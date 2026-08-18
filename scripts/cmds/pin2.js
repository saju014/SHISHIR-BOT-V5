const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "pinterest",
		aliases: ["pin2"],
		version: "2.0.0",
		author: "SIFAT",
		countDown: 10,
		role: 0,
		description: { en: "ꜱᴇᴀʀᴄʜ ᴘɪɴᴛᴇʀᴇꜱᴛ ꜰᴏʀ ɪᴍᴀɢᴇꜱ" },
		category: "media",
		guide: {
			en: "{pn} <ǫᴜᴇʀʏ> — ꜱʜᴏᴡ 6 ɪᴍᴀɢᴇꜱ\n{pn} <ǫᴜᴇʀʏ> -<ɴ> — ꜱʜᴏᴡ ɴ ɪᴍᴀɢᴇꜱ (ᴍᴀx 25)\n{pn} <ǫᴜᴇʀʏ> -r — ʀᴀɴᴅᴏᴍ ꜱᴇʟᴇᴄᴛɪᴏɴ"
		}
	},

	onStart: async function ({ args, message }) {
		let count = 6;
		let random = false;
		const countArg = args.find(a => /^-\d+$/.test(a));
		const randomArg = args.find(a => a === "-r");
		if (countArg) { count = Math.min(parseInt(countArg.slice(1), 10), 25); args = args.filter(a => a !== countArg); }
		if (randomArg) { random = true; args = args.filter(a => a !== randomArg); }
		const query = args.join(" ").trim();
		if (!query) return message.reply("⌀ ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ꜱᴇᴀʀᴄʜ ǫᴜᴇʀʏ");

		const waitMsg = await message.reply("◈ ꜱᴇᴀʀᴄʜɪɴɢ ᴘɪɴᴛᴇʀᴇꜱᴛ...");

		try {
			const res = await axios.get(`https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=90`);
			const allImageUrls = res.data.results || [];

			if (waitMsg?.messageID) message.unsend(waitMsg.messageID).catch(() => {});

			if (!allImageUrls.length)
				return message.reply(`⌀ ɴᴏ ɪᴍᴀɢᴇꜱ ꜰᴏᴜɴᴅ ꜰᴏʀ "${query}"`);

			let pool = random ? allImageUrls.sort(() => Math.random() - 0.5) : allImageUrls;
			const urls = pool.slice(0, count);
			const streams = await Promise.all(urls.map(url => getStreamFromURL(url).catch(() => null)));
			const valid = streams.filter(s => s);

			if (!valid.length)
				return message.reply("⌀ ꜰᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴀᴅ ɪᴍᴀɢᴇꜱ");

			return message.reply({
				body: `✦ ᴘɪɴᴛᴇʀᴇꜱᴛ: "${query}"\n◈ ꜱʜᴏᴡɪɴɢ ${valid.length}/${allImageUrls.length} ɪᴍᴀɢᴇꜱ${random ? " (ʀᴀɴᴅᴏᴍ)" : ""}`,
				attachment: valid
			});
		} catch {
			if (waitMsg?.messageID) message.unsend(waitMsg.messageID).catch(() => {});
			return message.reply("⌀ ꜱᴇʀᴠᴇʀ ᴏꜰꜰʟɪɴᴇ ᴏʀ ᴇʀʀᴏʀ");
		}
	}
};
