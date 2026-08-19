"use strict";

const axios = require("axios");

module.exports = {
  config: {
    name: "shishir",
    version: "3.0.0",
    author: "〲shishirツ࿐ T.T o.O",
    role: 0,
    shortDescription: "Shishir Profile",
    category: "Information",
    guide: {
      en: "type shishir"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {

    const msg = event.body?.toLowerCase();
    if (!msg || msg !== "shishir") return;

    const profileText = `
╔════════════════════════════╗
║
║     𓆩 🖤 𓆪 𝐒𝐇𝐈𝐒𝐇𝐈𝐑 𝐈𝐍𝐅𝐎 𓆩 🤍 𓆪
║
╚════════════════════════════╝

       ✦👑 𝐎𝐖𝐍𝐄𝐑 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ✦

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃
┃  👑 𝐍𝐚𝐦𝐞
┃  ➤ 𝑺𝑯𝑰𝑺𝑯𝑰𝑹
┃
┃  😜 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞
┃  ➤ 𝒀𝒐𝒖𝒓 𝒂𝒃𝒃𝒖
┃
┃  🇧🇩 𝐂𝐨𝐮𝐧𝐭𝐫𝐲
┃  ➤ 𝑩𝒂𝒏𝒈𝒍𝒂𝒅𝒆𝒔𝒉
┃
┃  🏤 𝐇𝐨𝐦𝐞
┃  ➤ 𝑺𝒊𝒓𝒂𝒋𝒈𝒂𝒏𝒋
┃
┃  🏛️ 𝐃𝐢𝐬𝐭𝐫𝐢𝐜𝐭
┃  ➤ 𝑹𝒂𝒋𝒔𝒉𝒂𝒉𝒊
┃
┃  🎓 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧
┃  ➤ 𝑰𝒏𝒕𝒆𝒓 𝟏𝒔𝒕 𝒀𝒆𝒂𝒓
┃
┃  🎂 𝐀𝐠𝐞
┃  ➤ 𝟐𝟎
┃
┃  🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧
┃  ➤ 𝑰𝒔𝒍𝒂𝒎
┃
┃  ♡ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩
┃  ➤ 𝑺𝒊𝒏𝒈𝒍𝒆
┃
┃  🫂 𝐁𝐞𝐬𝐭 𝐅𝐧𝐝
┃  ➤ 𝑨𝑺𝑬
┃
┃  🎨 𝐅𝐯𝐭 𝐂𝐨𝐥𝐨𝐮𝐫
┃  ➤ 𝑾𝒉𝒊𝒕𝒆 😺🖤
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

      ╭─────── 𓆩🖤𓆪 ───────╮
          𝐒𝐇𝐈𝐒𝐇𝐈𝐑 𝐁𝐁𝐙
      ╰─────── 𓆩🤍𓆪 ───────╯

          「 𝑶𝑾𝑵𝑬𝑹 ☻ 」

       ✦ 𝐒𝐓𝐘𝐋𝐄 𝐁𝐘 𝐒𝐇𝐈𝐒𝐇𝐈𝐑 ✦
`;

    const videoUrl = "https://i.imgur.com/sbCunk3.mp4";

    try {

      const response = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 30000
      });

      api.sendMessage(
        {
          body: profileText,
          attachment: response.data
        },
        event.threadID,
        event.messageID
      );

    } catch (error) {

      console.error("Video Error:", error);

      api.sendMessage(
        profileText,
        event.threadID,
        event.messageID
      );
    }
  }
};
