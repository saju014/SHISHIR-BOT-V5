"use strict";

module.exports = {
  config: {
    name: "admininfo",
    aliases: ["admin", "ainfo", "info"],
    version: "5.0.0",
    author: "SHISHIR",
    countDown: 5,
    role: 0,
    shortDescription: "Admin Information",
    category: "Information",
    guide: {
      en: "type admin"
    }
  },

  onStart: async function ({ api, event }) {

    const msg = `
╭━━━〔 👑 𝐀𝐃𝐌𝐈𝐍 〕━━━╮

        𝐒𝐇𝐀𝐖𝐎𝐍
     ✦ 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ✦

━━━━━━━━━━━━━━━━━━━━

👤 𝐍𝐚𝐦𝐞
   └─ 𝑺𝒉𝒂𝒘𝒐𝒏

📍 𝐁𝐚𝐬𝐚
   └─ 𝑹𝒂𝒋𝒔𝒉𝒂𝒉𝒊

🎓 𝐒𝐭𝐮𝐝𝐲
   └─ 𝑯𝒐𝒏𝒐𝒖𝒓𝒔 𝟏𝒔𝒕

💞 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧
   └─ 𝑺𝒊𝒏𝒈𝒍𝒆

🎨 𝐅𝐚𝐯 𝐂𝐨𝐥𝐨𝐮𝐫
   └─ 🖤 𝑩𝒍𝒂𝒄𝒌 × 𝑾𝒉𝒊𝒕𝒆 🤍

📱 𝐍𝐮𝐦𝐛𝐞𝐫
   └─ 𝟎𝟏𝟖𝟏𝟔****𝟗𝟎

━━━━━━━━━━━━━━━━━━━━

🛡️ 𝐏𝐎𝐖𝐄𝐑
   └─ 𝐀𝐃𝐌𝐈𝐍

👑 𝐎𝐖𝐍𝐄𝐑
   └─ 𝐒𝐇𝐈𝐒𝐇𝐈𝐑

━━━━━━━━━━━━━━━━━━━━

      🖤 𝐒𝐇𝐀𝐖𝐎𝐍 🤍
   ✦ 👑𝗼𝘄𝗻𝗲𝗿 𝐁𝐘 𝐒𝐇𝐈𝐒𝐇𝐈𝐑 ✦

╰━━━━━━━━━━━━━━━━━━━━╯
`;

    return api.sendMessage(
      msg,
      event.threadID,
      event.messageID
    );
  }
};
