"use strict";

const axios = require("axios");

module.exports = {
  config: {
    name: "admininfo",
    aliases: ["admin", "admininfo"],
    version: "2.1.0",
    author: "shishir",
    role: 0,
    countDown: 5,
    shortDescription: "Admin Information",
    category: "Information",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {

    const videoUrl = "https://i.imgur.com/sbCunk3.mp4";

    const adminInfo = `
╔════════════════════════════╗
        👑 𝐀𝐃𝐌𝐈𝐍 𝐈𝐍𝐅𝐎 👑
╚════════════════════════════╝

✦ 𝐍𝐀𝐌𝐄 : 𝐒𝐡𝐚𝐰𝐨𝐧
✦ 𝐇𝐎𝐌𝐄 : 𝐑𝐚𝐣𝐬𝐡𝐚𝐡𝐢
✦ 𝐒𝐓𝐔𝐃𝐘 : 𝐇𝐨𝐧𝐨𝐮𝐫𝐬 𝟏𝐬𝐭
✦ 𝐑𝐄𝐋𝐀𝐓𝐈𝐎𝐍 : 𝐒𝐢𝐧𝐠𝐥𝐞
✦ 𝐅𝐀𝐕 𝐂𝐎𝐋𝐎𝐔𝐑 : 🖤 𝐁𝐥𝐚𝐜𝐤 & 𝐖𝐡𝐢𝐭𝐞
✦ 𝐍𝐔𝐌𝐁𝐄𝐑 : 𝟎𝟏𝟖𝟏𝟔****𝟗𝟎

╭────────────────────────────╮
│ 👑 𝐑𝐎𝐋𝐄 : 𝐎𝐍𝐋𝐘 𝐀𝐃𝐌𝐈𝐍
╰────────────────────────────╯

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ⚡ 𝐎𝐖𝐍𝐄𝐑 ⚡
        👑 𝘼𝙝𝙢𝙚𝙙 𝙎𝙝𝙞𝙨𝙝𝙞𝙧 🙍‍♂️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

       🖤 𝐁𝐋𝐀𝐂𝐊 × 𝐖𝐇𝐈𝐓𝐄 🖤
`;

    try {
      const response = await axios.get(videoUrl, {
        responseType: "stream"
      });

      return message.reply({
        body: adminInfo,
        attachment: response.data
      });

    } catch (error) {
      return message.reply(adminInfo);
    }
  }
};
