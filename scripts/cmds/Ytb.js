const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const CACHE = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE);

/* =========================
   CONFIG
========================= */

const API_URL = "https://xalman-apis.vercel.app/api/ytdlv2";

/* =========================
   HELPERS
========================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatViews(n) {
  if (!n) return "0";

  n = Number(n);

  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";

  return n.toLocaleString();
}

function cut(text, max = 45) {
  if (!text) return "Unknown";
  text = String(text);

  return text.length > max
    ? text.substring(0, max - 3) + "..."
    : text;
}

/* =========================
   LOADING ANIMATION
========================= */

async function loading(api, threadID) {
  return new Promise((resolve, reject) => {

    const frames = [
`╭━━━〔 🎬 𝗬𝗧 𝗦𝗘𝗔𝗥𝗖𝗛 〕━━━╮
┃
┃ 🔍 Searching YouTube...
┃ ▰▱▱▱▱▱▱▱▱
┃
╰━━━━━━━━━━━━━━━━━━╯`,

`╭━━━〔 🎬 𝗬𝗧 𝗦𝗘𝗔𝗥𝗖𝗛 〕━━━╮
┃
┃ 🔎 Finding videos...
┃ ▰▰▰▱▱▱▱▱▱
┃
╰━━━━━━━━━━━━━━━━━━╯`,

`╭━━━〔 🎬 𝗬𝗧 𝗦𝗘𝗔𝗥𝗖𝗛 〕━━━╮
┃
┃ ⚡ Preparing results...
┃ ▰▰▰▰▰▰▱▱▱
┃
╰━━━━━━━━━━━━━━━━━━╯`
    ];

    api.sendMessage(frames[0], threadID, async (err, info) => {

      if (err) return reject(err);

      for (let i = 1; i < frames.length; i++) {
        await sleep(600);

        try {
          await api.editMessage(
            frames[i],
            info.messageID
          );
        } catch {}
      }

      resolve(info.messageID);
    });
  });
}

/* =========================
   SEARCH IMAGE
========================= */

async function makeResultImage(videos, query) {

  const width = 1000;
  const rowHeight = 205;
  const header = 190;

  const height =
    header + videos.length * rowHeight + 100;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  /* Background */

  const bg = ctx.createLinearGradient(
    0,
    0,
    width,
    height
  );

  bg.addColorStop(0, "#050505");
  bg.addColorStop(1, "#151515");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  /* Header */

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, header);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial";

  ctx.fillText(
    "YOUTUBE",
    35,
    65
  );

  ctx.fillStyle = "#aaaaaa";
  ctx.font = "25px Arial";

  ctx.fillText(
    "Search: " + cut(query, 45),
    35,
    110
  );

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(
    35,
    140,
    930,
    4
  );

  /* Videos */

  for (let i = 0; i < videos.length; i++) {

    const video = videos[i];

    const y =
      header + i * rowHeight;

    /* Card */

    ctx.fillStyle =
      i % 2 === 0
        ? "#101010"
        : "#171717";

    ctx.fillRect(
      20,
      y + 8,
      960,
      rowHeight - 15
    );

    /* Number */

    ctx.fillStyle = "#ff0000";

    ctx.font = "bold 38px Arial";

    ctx.fillText(
      `${i + 1}`,
      35,
      y + 55
    );

    /* Thumbnail */

    const tx = 100;
    const ty = y + 25;
    const tw = 280;
    const th = 155;

    try {

      const image =
        await loadImage(video.thumbnail);

      ctx.drawImage(
        image,
        tx,
        ty,
        tw,
        th
      );

    } catch {

      ctx.fillStyle = "#222222";

      ctx.fillRect(
        tx,
        ty,
        tw,
        th
      );

      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";

      ctx.fillText(
        "NO THUMBNAIL",
        tx + 70,
        ty + 85
      );
    }

    /* Title */

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 25px Arial";

    ctx.fillText(
      cut(video.title, 42),
      410,
      y + 55
    );

    /* Channel */

    ctx.fillStyle = "#ff5555";

    ctx.font = "20px Arial";

    ctx.fillText(
      "👤 " + cut(video.author?.name, 30),
      410,
      y + 95
    );

    /* Info */

    ctx.fillStyle = "#bbbbbb";

    ctx.font = "18px Arial";

    ctx.fillText(
      `⏱ ${video.timestamp || "N/A"}`,
      410,
      y + 130
    );

    ctx.fillText(
      `👁 ${formatViews(video.views)}`,
      600,
      y + 130
    );

    /* Select */

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 18px Arial";

    ctx.fillText(
      `REPLY ${i + 1}`,
      410,
      y + 165
    );
  }

  /* Footer */

  ctx.fillStyle = "#ff0000";

  ctx.font = "bold 23px Arial";

  ctx.textAlign = "center";

  ctx.fillText(
    "Reply with 1 - 6 to download",
    width / 2,
    height - 55
  );

  ctx.fillStyle = "#777777";

  ctx.font = "17px Arial";

  ctx.fillText(
    "SHISHIR YT SYSTEM",
    width / 2,
    height - 25
  );

  ctx.textAlign = "left";

  return canvas.toBuffer(
    "image/jpeg",
    { quality: 0.90 }
  );
}

/* =========================
   DOWNLOAD
========================= */

async function downloadVideo(
  url,
  message,
  api,
  waitID,
  video
) {

  try {

    await api.editMessage(
`╭━━━〔 ⬇️ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 〕━━━╮
┃
┃ 🎬 ${cut(video.title, 35)}
┃
┃ ⚡ Preparing video...
┃ ▰▱▱▱▱▱▱▱▱
┃
╰━━━━━━━━━━━━━━━━━━╯`,
      waitID
    );

    await sleep(700);

    const apiURL =
      `${API_URL}?url=${encodeURIComponent(url)}`;

    const response =
      await axios.get(apiURL, {
        timeout: 30000
      });

    const data = response.data;

    /*
      Different API response formats
      are checked here.
    */

    const downloadURL =
      data.video_url ||
      data.video ||
      data.download_url ||
      data.url ||
      data.data?.video_url ||
      data.data?.download_url;

    if (!downloadURL) {

      throw new Error(
        "Video download link পাওয়া যায়নি"
      );
    }

    await api.editMessage(
`╭━━━〔 ⚡ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚 〕━━━╮
┃
┃ 🎥 Video found!
┃
┃ 📥 Downloading...
┃ ▰▰▰▰▰▰▱▱▱
┃
╰━━━━━━━━━━━━━━━━━━╯`,
      waitID
    );

    const filePath =
      path.join(
        CACHE,
        `yt_${Date.now()}.mp4`
      );

    const stream =
      await axios({
        method: "GET",
        url: downloadURL,
        responseType: "stream",
        timeout: 120000,
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        }
      });

    const writer =
      fs.createWriteStream(filePath);

    stream.data.pipe(writer);

    await new Promise(
      (resolve, reject) => {

        writer.on(
          "finish",
          resolve
        );

        writer.on(
          "error",
          reject
        );
      }
    );

    const size =
      (
        fs.statSync(filePath).size /
        1024 /
        1024
      ).toFixed(1);

    await api.unsendMessage(
      waitID
    ).catch(() => {});

    await message.reply({

      body:
`╭━━━〔 🎬 𝗬𝗧 𝗩𝗜𝗗𝗘𝗢 〕━━━╮
┃
┃ 🎥 ${cut(video.title, 40)}
┃
┃ 👤 ${cut(video.author?.name, 30)}
┃ ⏱️ ${video.timestamp || "N/A"}
┃ 👁️ ${formatViews(video.views)}
┃ 📦 ${size} MB
┃
╰━━━━━━━━━━━━━━━━━━╯

🔥 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗬𝗧`,

      attachment:
        fs.createReadStream(filePath)
    });

    setTimeout(() => {

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    }, 5000);

  } catch (error) {

    console.error(
      "YT DOWNLOAD ERROR:",
      error
    );

    await api.editMessage(
`╭━━━〔 💀 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗 〕━━━╮
┃
┃ ❌ Video download করা যায়নি।
┃
┃ 🔄 অন্য ভিডিও try করো।
╰━━━━━━━━━━━━━━━━━━━━╯`,
      waitID
    );
  }
}

/* =========================
   COMMAND
========================= */

module.exports = {

  config: {

    name: "yt",

    aliases: [
      "youtube",
      "ytb"
    ],

    version: "8.0",

    author: "Shishir",

    role: 0,

    countDown: 5,

    category: "media",

    shortDescription: {
      en: "🎬 YouTube video downloader"
    },

    longDescription: {
      en:
        "Search YouTube, select a video number and download it."
    },

    guide: {

      en:
`{pn} <song/video name> -v

Example:

{prefix}yt Believer -v
{prefix}yt Shape Of You -v`

    }

  },

  /* =====================
     START
  ===================== */

  onStart: async function ({
    api,
    event,
    args,
    message
  }) {

    const {
      threadID,
      senderID
    } = event;

    if (!args.length) {

      return message.reply(
`╭━━━〔 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 〕━━━╮
┃
┃ 🔎 Search + Download
┃
┃ ${global.GoatBot.config.prefix}yt Believer -v
┃
┃ 📌 Search → Select number
┃ 🎥 → Video attachment
┃
╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    /* Remove -v */

    const query =
      args
        .filter(
          x => x.toLowerCase() !== "-v"
        )
        .join(" ")
        .trim();

    if (!query) {

      return message.reply(
`╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ Example:
┃
┃ ${global.GoatBot.config.prefix}yt Believer -v
╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const loadingID =
      await loading(
        api,
        threadID
      );

    try {

      const result =
        await yts(query);

      const videos =
        result.videos.slice(0, 6);

      if (!videos.length) {

        return api.editMessage(
`╭━━━〔 ❌ 𝗡𝗢 𝗥𝗘𝗦𝗨𝗟𝗧 〕━━━╮
┃
┃ YouTube video পাওয়া যায়নি।
┃
╰━━━━━━━━━━━━━━━━━━╯`,
          loadingID
        );
      }

      /* Generate image */

      const buffer =
        await makeResultImage(
          videos,
          query
        );

      const imagePath =
        path.join(
          CACHE,
          `yt_result_${Date.now()}.jpg`
        );

      fs.writeFileSync(
        imagePath,
        buffer
      );

      await api.unsendMessage(
        loadingID
      ).catch(() => {});

      const sent =
        await message.reply({

          body:
`🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗦𝗘𝗔𝗥𝗖

🔎 ${cut(query, 55)}

👇 ছবিতে যেই ভিডিও চাই সেই **number reply** করো।

🎥 Reply: 1 - 6`,

          attachment:
            fs.createReadStream(imagePath)

        });

      /* Reply system */

      global.GoatBot.onReply.set(
        sent.messageID,
        {
          commandName: "yt",

          author: senderID,

          videos: videos
        }
      );

      setTimeout(() => {

        if (
          fs.existsSync(imagePath)
        ) {
          fs.unlinkSync(
            imagePath
          );
        }

      }, 30000);

    } catch (error) {

      console.error(
        "YT SEARCH ERROR:",
        error
      );

      await api.editMessage(
`╭━━━〔 💀 𝗬𝗧 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ ❌ YouTube search failed.
┃
┃ 🔄 আবার try করো।
╰━━━━━━━━━━━━━━━━━━━━╯`,
        loadingID
      );
    }
  },

  /* =====================
     REPLY
  ===================== */

  onReply: async function ({
    api,
    event,
    Reply,
    message
  }) {

    if (
      event.senderID !==
      Reply.author
    ) {
      return;
    }

    const number =
      parseInt(
        event.body.trim()
      );

    if (
      isNaN(number) ||
      number < 1 ||
      number > Reply.videos.length
    ) {

      return message.reply(
`╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ ছবির মধ্যে থাকা
┃ 1 - ${Reply.videos.length}
┃ এর যেকোনো একটি number reply করো।
╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const video =
      Reply.videos[number - 1];

    const wait =
      await message.reply(
`╭━━━〔 ⏳ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧 〕━━━╮
┃
┃ 🎬 ${cut(video.title, 40)}
┃
┃ 🔢 Selected: ${number}
┃
┃ ⚡ Starting download...
╰━━━━━━━━━━━━━━━━━━╯`
      );

    await downloadVideo(
      video.url,
      message,
      api,
      wait.messageID,
      video
    );
  }
};
