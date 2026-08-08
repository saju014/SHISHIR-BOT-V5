module.exports = {
  config: {
      name: "shishir",
          version: "1.0.4",
              author: "〲shishirツ࿐ T.T　o.O",
                  role: 0,
                      shortDescription: "shishir Profile ",
                          category: "Information",
                              guide: {
                                    en: "type shishir"
                                        }
                                          },
  onStart: async function () {},
  onChat: async function ({ api, event }) {
      const msg = event.body?.toLowerCase();
          if (!msg || msg !== "shishir") return;
    const profileText = 
    `⏤͟͟͞͞𝐒𝐇𝐈𝐒𝐇𝐈𝐑   𝗜𝗡𝗙𝗢 ☺︎
 ⏤͟͟͞͞☺︎ ┏━━━━━━━━━━━━━━━
 ⏤͟͟͞͞𝐍𝐚𝐦𝐞 ➯ 👑𝐒𝐇𝐈𝐒𝐇𝐈𝐑   ⏤͟͟͞͞ ᜊ
 
⏤͟͟͞͞𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 ➯⏤͟͟͞͞ Your abbu 😜

⏤͟͟͞͞𝐂𝐨𝐮𝐧𝐭𝐫𝐲 ➯⏤͟͟͞͞𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡 🇧🇩

🏤⏤͟͟͞͞𝐇𝐨𝐦𝐞 ➯⏤͟͟͞͞𝙎𝙞𝙧𝙖𝙟𝙜𝙖𝙣𝙟   ☠️

🏛️⏤͟͟͞͞𝐃𝐢𝐬𝐭𝐫𝐢𝐜𝐭 ➯⏤͟͟͞͞𝐑𝐚𝐣𝐬𝐡𝐚𝐡𝐢 💀

⛪⏤͟͟͞͞𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 ➯ 𝐈𝐧𝐭𝐞𝐫 1st 𝐘𝐞𝐚𝐫 ✍︎❤️‍🩹

⏤͟͟͞͞𝐀𝐠𝐞 ➯ 20  😊❤️‍🩹

🕌⏤͟͟͞͞𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧 ➯ 𝐈𝐬𝐥𝐚𝐦 ❤️♡♡

⏤͟͟͞͞𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩 ➯ 𝑺i𝐧𝐠𝐥𝐞 ‍♡

⏤͟͟͞͞𝐁𝐞𝐬𝐭 𝐅𝐧𝐝➯ 𝑨𝑺𝑬 ,,🙃

⏤͟͟͞͞𝐅𝐯𝐭 𝐂𝐨𝐥𝐨𝐮𝐫➯ ⏤͟͟͞͞White 😺🖤


 ⏤͟͟͞͞ ☻ 𝐒𝐇𝐈𝐒𝐇𝐈𝐑 𝗕𝗕𝗭 
 ⏤͟͟͞͞𝑂𝑊𝑁𝐸𝑅⏤☺︎ `;
    api.sendMessage(profileText, event.threadID, event.messageID);
      }
      };
