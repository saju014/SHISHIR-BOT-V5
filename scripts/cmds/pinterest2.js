const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { getStreamFromURL } = global.utils;

const TMP_DIR = path.join(process.cwd(), "scripts", "tmp");
fs.ensureDirSync(TMP_DIR);

module.exports = {
	config: {
		name: "pinterest2",
		aliases: ["pin"],
		version: "3.0.0",
		author: "SIFAT",
		countDown: 10,
		role: 0,
		shortDescription: "Pinterest image search",
		description: "Search Pinterest images and select by number",
		category: "media",
		guide: {
			en: "{pn} <query>\nExample: {pn} cat"
		}
	},

	onStart: async function ({ args, message, event }) {
		const query = args.join(" ").trim();

		if (!query)
			return message.reply(
				"❌ | Please provide a search query.\n\nExample: pin cat"
			);

		const waitMsg = await message.reply(
			"🔎 | Searching Pinterest for images..."
		);

		try {
			const res = await axios.get(
				`https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=90`,
				{ timeout: 30000 }
			);

			const allUrls = res.data?.results || [];

			if (waitMsg?.messageID)
				message.unsend(waitMsg.messageID).catch(() => {});

			if (!allUrls.length)
				return message.reply(
					`❌ | No images found for "${query}".`
				);

			// প্রথম 6টা ছবি
			const urls = allUrls.slice(0, 6);

			const images = [];

			for (let i = 0; i < urls.length; i++) {
				try {
					const response = await axios.get(urls[i], {
						responseType: "arraybuffer",
						timeout: 15000
					});

					const img = await loadImage(
						Buffer.from(response.data)
					);

					images.push({
						img,
						url: urls[i],
						number: i + 1
					});
				} catch (e) {
					console.log(`Image ${i + 1} failed`);
				}
			}

			if (!images.length)
				return message.reply(
					"❌ | Failed to load Pinterest images."
				);

			// Canvas settings
			const cols = 3;
			const cellWidth = 300;
			const cellHeight = 300;
			const rows = Math.ceil(images.length / cols);

			const canvas = createCanvas(
				cols * cellWidth,
				rows * cellHeight
			);

			const ctx = canvas.getContext("2d");

			// Background
			ctx.fillStyle = "#222222";
			ctx.fillRect(
				0,
				0,
				canvas.width,
				canvas.height
			);

			for (let i = 0; i < images.length; i++) {
				const item = images[i];

				const x = (i % cols) * cellWidth;
				const y = Math.floor(i / cols) * cellHeight;

				// Image fit / crop
				const imgRatio =
					item.img.width / item.img.height;

				const boxRatio =
					cellWidth / cellHeight;

				let drawWidth;
				let drawHeight;
				let drawX;
				let drawY;

				if (imgRatio > boxRatio) {
					drawHeight = cellHeight;
					drawWidth =
						drawHeight * imgRatio;
					drawX =
						x + (cellWidth - drawWidth) / 2;
					drawY = y;
				} else {
					drawWidth = cellWidth;
					drawHeight =
						drawWidth / imgRatio;
					drawX = x;
					drawY =
						y + (cellHeight - drawHeight) / 2;
				}

				ctx.save();
				ctx.beginPath();
				ctx.rect(
					x,
					y,
					cellWidth,
					cellHeight
				);
				ctx.clip();

				ctx.drawImage(
					item.img,
					drawX,
					drawY,
					drawWidth,
					drawHeight
				);

				ctx.restore();

				// Number circle
				ctx.beginPath();
				ctx.arc(
					x + 30,
					y + 30,
					22,
					0,
					Math.PI * 2
				);

				ctx.fillStyle = "rgba(0,0,0,0.75)";
				ctx.fill();

				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 24px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillText(
					String(item.number),
					x + 30,
					y + 30
				);
			}

			const filePath = path.join(
				TMP_DIR,
				`pin_${Date.now()}.jpg`
			);

			await fs.writeFile(
				filePath,
				canvas.toBuffer("image/jpeg", {
					quality: 0.9
				})
			);

			const attachment =
				await getStreamFromURL(
					`file://${filePath}`
				).catch(() => null);

			// যদি file:// কাজ না করে
			const finalAttachment = attachment
				? attachment
				: fs.createReadStream(filePath);

			const msg = await message.reply({
				body:
					`🖼️ | Found ${allUrls.length} images for "${query}".\n\n` +
					`↪️ Reply with a number (1-${images.length}) to get that image.\n` +
					`↪️ Reply "next" for more images.`,
				attachment: finalAttachment
			});

			// Reply data save
			if (msg?.messageID) {
				global.GoatBot.onReply.set(
					msg.messageID,
					{
						commandName: this.config.name,
						messageID: msg.messageID,
						author: event.senderID,
						query,
						allUrls,
						currentPage: 0,
						selectedUrls: urls
					}
				);
			}

			// Temporary file delete
			setTimeout(() => {
				fs.remove(filePath).catch(() => {});
			}, 60000);

		} catch (error) {
			console.error(error);

			if (waitMsg?.messageID)
				message.unsend(waitMsg.messageID).catch(() => {});

			return message.reply(
				"❌ | Pinterest server offline or an error occurred."
			);
		}
	},

	onReply: async function ({ event, Reply, message }) {
		// শুধু যে user command দিয়েছে সে reply করতে পারবে
		if (
			Reply.author &&
			event.senderID !== Reply.author
		) {
			return;
		}

		const body = (event.body || "").trim().toLowerCase();

		if (body === "next") {
			const nextPage =
				(Reply.currentPage || 0) + 1;

			const start = nextPage * 6;
			const urls = Reply.allUrls.slice(
				start,
				start + 6
			);

			if (!urls.length)
				return message.reply(
					"❌ | No more images available."
				);

			const images = [];

			for (let i = 0; i < urls.length; i++) {
				try {
					const response = await axios.get(
						urls[i],
						{
							responseType: "arraybuffer",
							timeout: 15000
						}
					);

					const img = await loadImage(
						Buffer.from(response.data)
					);

					images.push({
						img,
						url: urls[i],
						number: i + 1
					});
				} catch {}
			}

			if (!images.length)
				return message.reply(
					"❌ | Failed to load images."
				);

			const cols = 3;
			const cell = 300;
			const rows = Math.ceil(
				images.length / cols
			);

			const canvas = createCanvas(
				cols * cell,
				rows * cell
			);

			const ctx = canvas.getContext("2d");

			ctx.fillStyle = "#222";
			ctx.fillRect(
				0,
				0,
				canvas.width,
				canvas.height
			);

			for (let i = 0; i < images.length; i++) {
				const x =
					(i % cols) * cell;
				const y =
					Math.floor(i / cols) * cell;

				const img = images[i].img;

				const scale = Math.max(
					cell / img.width,
					cell / img.height
				);

				const w = img.width * scale;
				const h = img.height * scale;

				ctx.save();

				ctx.beginPath();
				ctx.rect(
					x,
					y,
					cell,
					cell
				);
				ctx.clip();

				ctx.drawImage(
					img,
					x + (cell - w) / 2,
					y + (cell - h) / 2,
					w,
					h
				);

				ctx.restore();

				ctx.beginPath();
				ctx.arc(
					x + 30,
					y + 30,
					22,
					0,
					Math.PI * 2
				);

				ctx.fillStyle =
					"rgba(0,0,0,0.75)";
				ctx.fill();

				ctx.fillStyle = "#fff";
				ctx.font =
					"bold 24px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillText(
					String(i + 1),
					x + 30,
					y + 30
				);
			}

			const filePath = path.join(
				TMP_DIR,
				`pin_next_${Date.now()}.jpg`
			);

			await fs.writeFile(
				filePath,
				canvas.toBuffer("image/jpeg", {
					quality: 0.9
				})
			);

			const sent = await message.reply({
				body:
					`🖼️ | More images for "${Reply.query}"\n\n` +
					`↪️ Reply 1-${images.length} to get an image.\n` +
					`↪️ Reply "next" for more.`,
				attachment:
					fs.createReadStream(filePath)
			});

			// Update reply listener
			if (sent?.messageID) {
				global.GoatBot.onReply.set(
					sent.messageID,
					{
						commandName:
							Reply.commandName,
						messageID:
							sent.messageID,
						author:
							Reply.author,
						query:
							Reply.query,
						allUrls:
							Reply.allUrls,
						currentPage:
							nextPage,
						selectedUrls:
							urls
					}
				);
			}

			setTimeout(() => {
				fs.remove(filePath).catch(() => {});
			}, 60000);

			return;
		}

		const number = parseInt(body);

		if (
			isNaN(number) ||
			number < 1 ||
			number > Reply.selectedUrls.length
		) {
			return message.reply(
				`❌ | Please reply with a number between 1-${Reply.selectedUrls.length}, or type "next".`
			);
		}

		const selectedUrl =
			Reply.selectedUrls[number - 1];

		try {
			const stream =
				await getStreamFromURL(
					selectedUrl
				);

			return message.reply({
				body:
					`🖼️ | Pinterest Image #${number}\n🔎 | ${Reply.query}`,
				attachment: stream
			});

		} catch (error) {
			return message.reply(
				"❌ | Failed to download this image."
			);
		}
	}
};
