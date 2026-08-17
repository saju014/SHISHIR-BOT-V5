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
  n = Number(n) || 0;

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
   FIND DOWNLOAD URL
========================= */

function getDownloadURL(data) {
  if (!data) return null;

  const candidates = [
    data.video_url,
    data.videoUrl,
    data.download_url,
    data.downloadUrl,
    data.url,

    data.data?.video_url,
    data.data?.videoUrl,
    data.data?.download_url,
    data.data?.downloadUrl,
    data.data?.url,

    data.result?.video_url,
    data.result?.videoUrl,
    data.result?.download_url,
    data.result?.downloadUrl,
    data.result?.url,

    data.result?.data?.video_url,
    data.result?.data?.download_url,
    data.result?.data?.url
  ];

  for (const value of candidates) {
    if (
      typeof value === "string" &&
      /^https?:\/\//i.test(value)
    ) {
      return value;
    }
  }

  return null;
}

/* =========================
   LOADING
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

  for (let i = 0; i < videos.length; i++) {

    const video = videos[i];

    const y =
      header + i * rowHeight;

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

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 38px Arial";

    ctx.fillText(
      `${i + 1}`,
      35,
      y + 55
    );

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

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 25px Arial";

    ctx.fillText(
      cut(video.title, 42),
      410,
      y + 55
    );

    ctx.fillStyle = "#ff5555";
    ctx.font = "20px Arial";

    ctx.fillText(
      "👤 " + cut(video.author?.name, 30),
      410,
      y + 95
    );

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

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";

    ctx.fillText(
      `REPLY ${i + 1}`,
      410,
      y + 165
    );
  }

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

  let filePath = null;

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

    console.log("YT API REQUEST:", apiURL);

    const response =
      await axios.get(apiURL, {
        timeout: 60000,
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        },
        validateStatus: () => true
      });

    console.log(
      "YT API STATUS:",
      response.status
    );

    const data = response.data;

    console.log(
      "YT API RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    if (
      response.status < 200 ||
      response.status >= 300
    ) {

      throw new Error(
        `API HTTP ${response.status}: ${
          typeof data === "string"
            ? data.substring(0, 300)
            : JSON.stringify(data).substring(0, 500)
        }`
      );
    }

    const downloadURL =
      getDownloadURL(data);

    if (!downloadURL) {

      throw new Error(
        "API response-এ download URL পাওয়া যায়নি"
      );
    }

    console.log(
      "YT DOWNLOAD URL:",
      downloadURL
    );

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

    filePath =
      path.join(
        CACHE,
        `yt_${Date.now()}.mp4`
      );

    const stream =
      await axios({
        method: "GET",
        url: downloadURL,
        responseType: "stream",
        timeout: 180000,
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024,
        headers: {
          "User-Agent":
            "Mozilla/5.0",
          "Accept":
            "video/mp4,video/*,*/*"
        },
        validateStatus: status =>
          status >= 200 &&
          status < 300
      });

    const writer =
      fs.createWriteStream(filePath);

    await new Promise(
      (resolve, reject) => {

        let settled = false;

        const done = err => {

          if (settled) return;

          settled = true;

          if (err) {
            try {
              writer.destroy();
            } catch {}

            reject(err);
          } else {
            resolve();
          }
        };

        stream.data.on(
          "error",
          err => done(err)
        );

        writer.on(
          "error",
          err => done(err)
        );

        writer.on(
          "finish",
          () => done()
        );

        stream.data.pipe(writer);
      }
    );

    if (
      !fs.existsSync(filePath)
    ) {
      throw new Error(
        "Video file তৈরি হয়নি"
      );
    }

    const stat =
      fs.statSync(filePath);

    if (
      stat.size < 10000
    ) {

      throw new Error(
        `Downloaded file খুব ছোট: ${stat.size} bytes`
      );
    }

    const size =
      (
        stat.size /
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

    const uploadedFile =
      filePath;

    filePath = null;

    setTimeout(() => {

      try {

        if (
          fs.existsSync(uploadedFile)
        ) {
          fs.unlinkSync(uploadedFile);
        }

      } catch (e) {
        console.error(
          "FILE DELETE ERROR:",
          e
        );
      }

    }, 15000);

  } catch (error) {

    console.error(
      "=============================="
    );

    console.error(
      "YT DOWNLOAD ERROR:"
    );

    console.error(
      error?.message || error
    );

    console.error(
      "=============================="
    );

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {

      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    const errorText =
      cut(
        error?.message ||
        "Unknown error",
        120
      );

    await api.editMessage(
`╭━━━〔 💀 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗 〕━━━╮
┃
┃ ❌ Video download করা যায়নি।
┃
┃ ⚠️ ${errorText}
┃
┃ 🔄 অন্য ভিডিও try করো।
╰━━━━━━━━━━━━━━━━━━━━╯`,
      waitID
    ).catch(() => {});
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

    version: "8.1",

    author: "Shishir",

    role: 0,

    countDown: 5,

    category: "media",

    shortDescription: {
      en: "YouTube video downloader"
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

    let loadingID;

    try {

      loadingID =
        await loading(
          api,
          threadID
        );

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

👇 ছবিতে যেই ভিডিও চাই সেই number reply করো।

🎥 Reply: 1 - 6`,

          attachment:
            fs.createReadStream(
              imagePath
            )
        });

      global.GoatBot.onReply.set(
        sent.messageID,
        {
          commandName: "yt",
          author: senderID,
          videos: videos
        }
      );

      setTimeout(() => {

        try {

          if (
            fs.existsSync(imagePath)
          ) {
            fs.unlinkSync(imagePath);
          }

        } catch {}

      }, 30000);

    } catch (error) {

      console.error(
        "YT SEARCH ERROR:",
        error
      );

      if (loadingID) {

        await api.editMessage(
`╭━━━〔 💀 𝗬𝗧 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ ❌ YouTube search failed.
┃
┃ ⚠️ ${cut(
  error?.message ||
  "Unknown error",
  100
)}
┃
┃ 🔄 আবার try করো।
╰━━━━━━━━━━━━━━━━━━━━╯`,
          loadingID
        ).catch(() => {});
      }
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
        String(event.body).trim()
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
