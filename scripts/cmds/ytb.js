const yts = require("yt-search");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function formatViews(n) {
  n = Number(n) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function shortText(text, max = 55) {
  if (!text) return "Unknown";
  return text.length > max
    ? text.slice(0, max - 3) + "..."
    : text;
}

async function animate(api, threadID, frames, delay = 700) {
  return new Promise((resolve, reject) => {
    api.sendMessage(frames[0], threadID, async (err, info) => {
      if (err) return reject(err);

      for (let i = 1; i < frames.length; i++) {
        await new Promise(r => setTimeout(r, delay));

        try {
          await api.editMessage(frames[i], info.messageID);
        } catch {}
      }

      resolve(info.messageID);
    });
  });
}

module.exports = {
  config: {
    name: "yt",
    aliases: ["youtube", "ytb"],
    version: "7.0",
    author: "Shishir",
    role: 0,
    countDown: 5,
    category: "media",

    shortDescription: {
      en: "🎬 YouTube search & info"
    },

    longDescription: {
      en: "Search YouTube and show video information."
    },

    guide: {
      en:
        "{pn} <search>\n" +
        "{pn} -v <YouTube URL>\n\n" +
        "Example:\n" +
        "{prefix}yt Believer\n" +
        "{prefix}yt -v https://youtu.be/xxxxx"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID } = event;

    if (!args.length) {
      return message.reply(
`╭━━━〔 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 〕━━━╮
┃
┃ 🔎 Search:
┃ ${global.GoatBot.config.prefix}yt <song name>
┃
┃ 🎥 Video info:
┃ ${global.GoatBot.config.prefix}yt -v <YouTube URL>
┃
╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const isVideo = args[0].toLowerCase() === "-v";

    const query = isVideo
      ? args.slice(1).join(" ").trim()
      : args.join(" ").trim();

    if (!query) {
      return message.reply(
`╭━━━〔 ⚠️ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗟𝗜𝗡𝗞 〕━━━╮
┃
┃ Please provide a YouTube URL.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const loadingID = await animate(
      api,
      threadID,
      [
`╭━━━〔 🎬 𝗬𝗧 〕━━━╮
┃
┃ 🔍 Initializing...
┃ ▰▱▱▱▱▱▱▱▱
╰━━━━━━━━━━━━━━━━╯`,

`╭━━━〔 🎬 𝗬𝗧 〕━━━╮
┃
┃ 🔎 Searching YouTube...
┃ ▰▰▰▱▱▱▱▱▱
╰━━━━━━━━━━━━━━━━╯`,

`╭━━━〔 🎬 𝗬𝗧 〕━━━╮
┃
┃ ⚡ Fetching information...
┃ ▰▰▰▰▰▰▱▱▱
╰━━━━━━━━━━━━━━━━╯`
      ],
      600
    );

    try {
      // Direct YouTube URL
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query)) {
        const result = await yts(query);

        let video;

        if (result && result.videos && result.videos.length) {
          video = result.videos[0];
        }

        if (!video) {
          throw new Error("Video information not found");
        }

        const text =
`╭━━━〔 🎥 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗩𝗜𝗗𝗘𝗢 〕━━━╮
┃
┃ 🎬 𝗧𝗜𝗧𝗟𝗘
┃ ${shortText(video.title, 70)}
┃
┃ 👤 𝗖𝗛𝗔𝗡𝗡𝗘𝗟
┃ ${shortText(video.author?.name, 45)}
┃
┃ ⏱️ 𝗗𝗨𝗥𝗔𝗧𝗜𝗢
┃ ${video.timestamp || "Unknown"}
┃
┃ 👁️ 𝗩𝗜𝗘𝗪𝗦
┃ ${formatViews(video.views)}
┃
┃ 📅 𝗣𝗨𝗕𝗟𝗜𝗦𝗛𝗘𝗗
┃ ${video.ago || "Unknown"}
┃
┣━━━━━━━━━━━━━━━━━━━━
┃ 🔗 𝗪𝗔𝗧𝗖𝗛
┃ ${video.url}
╰━━━━━━━━━━━━━━━━━━━━╯

✨ 𝗦𝗵𝗶𝘀𝗵𝗶𝗿 𝗬𝗧 𝗦𝘆𝘀𝘁𝗲𝗺`;

        await api.editMessage(text, loadingID);

        return;
      }

      // Search
      const result = await yts(query);
      const videos = result.videos.slice(0, 6);

      if (!videos.length) {
        return api.editMessage(
`╭━━━〔 ❌ 𝗡𝗢 𝗥𝗘𝗦𝗨𝗟𝗧 〕━━━╮
┃
┃ No YouTube videos found.
┃
┃ 🔎 Search:
┃ ${query}
╰━━━━━━━━━━━━━━━━━━━━╯`,
          loadingID
        );
      }

      let text =
`╭━━━〔 🔥 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 〕━━━╮
┃
┃ 🔎 Search: ${shortText(query, 40)}
┣━━━━━━━━━━━━━━━━━━━━`;

      videos.forEach((v, i) => {
        text +=
`\n┃
┃ ❶`.replace("❶", `${i + 1}️⃣`) +
`\n┃ 🎬 ${shortText(v.title, 48)}
┃ 👤 ${shortText(v.author?.name, 32)}
┃ ⏱️ ${v.timestamp || "N/A"} • 👁️ ${formatViews(v.views)}
┃ 🔗 ${v.url}
┃`;
      });

      text +=
`┣━━━━━━━━━━━━━━━━━━━━
┃ 💡 Reply with 1-6 for details
╰━━━━━━━━━━━━━━━━━━━━╯`;

      await api.editMessage(text, loadingID);

      global.GoatBot.onReply.set(loadingID, {
        commandName: "yt",
        author: senderID,
        data: videos
      });

    } catch (error) {
      console.error("YT ERROR:", error);

      await api.editMessage(
`╭━━━〔 💀 𝗬𝗧 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ ❌ Could not fetch YouTube data.
┃
┃ 🔄 Try again later.
╰━━━━━━━━━━━━━━━━━━━━╯`,
        loadingID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim();
    const index = Number(input);

    if (!Number.isInteger(index) || index < 1 || index > Reply.data.length) {
      return api.sendMessage(
`╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ Reply with a number from 1-${Reply.data.length}
╰━━━━━━━━━━━━━━━━━━╯`,
        event.threadID,
        event.messageID
      );
    }

    const video = Reply.data[index - 1];

    const result =
`╭━━━〔 ✦ 𝗩𝗜𝗗𝗘𝗢 ${index} ✦ 〕━━━╮
┃
┃ 🎬 𝗧𝗜𝗧𝗟𝗘
┃ ${shortText(video.title, 70)}
┃
┃ 👤 𝗖𝗛𝗔𝗡𝗡𝗘𝗟
┃ ${shortText(video.author?.name, 45)}
┃
┃ ⏱️ 𝗗𝗨𝗥𝗔𝗧𝗜𝗢
┃ ${video.timestamp || "N/A"}
┃
┃ 👁️ 𝗩𝗜𝗘𝗪𝗦
┃ ${formatViews(video.views)}
┃
┣━━━━━━━━━━━━━━━━━━━━
┃ ▶️ 𝗪𝗔𝗧𝗖𝗛 𝗡𝗢𝗪
┃ ${video.url}
╰━━━━━━━━━━━━━━━━━━━━╯

💠 𝗦𝗛𝗜𝗦𝗛𝗜𝗥 𝗬𝗧`;

    return api.sendMessage(
      result,
      event.threadID,
      event.messageID
    );
  }
};
