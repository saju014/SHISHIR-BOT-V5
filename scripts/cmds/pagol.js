const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pagol",
    aliases: ["crazy"],
    version: "2.0",
    author: "Shishir",
    countDown: 5,
    role: 0,
    shortDescription: "Pagol picture",
    category: "fun"
  },

  onStart: async function ({ api, event, message }) {
    const imagePath = path.join(__dirname, "pagol.jpg");

    if (!fs.existsSync(imagePath)) {
      return message.reply("❌ pagol.jpg ছবিটা commands folder-এ রাখো!");
    }

    const mentions = event.mentions || {};
    const ids = Object.keys(mentions);

    if (ids.length === 0) {
      return message.reply(
        "🤪 একজনকে mention করো!\n\nExample: !pagol @someone"
      );
    }

    const name = mentions[ids[0]].replace("@", "");

    return message.reply({
      body:
`🤪━━━━ PAGOL ALERT ━━━━🤪

😂 ${name} আজকের পাগল!

🤣 এই পাগলামির কোনো শেষ নাই!

━━━━━━━━━━━━━━━━
👀 Mentioned by: ${event.senderID}
🤪 PAGOL LEVEL: 100%
━━━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(imagePath)
    });
  }
};
