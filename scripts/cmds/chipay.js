const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "chipay",
    aliases: ["corner", "muri"],
    version: "2.4.9",
    author: "Milon",
    countDown: 5,
    role: 0,
    shortDescription: "Fun command with image and stylish caption",
    category: "fun",
    guide: { en: "{pn} @mention or reply" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      // User not mentioned warning (Bangla)
      return api.sendMessage("🤦‍♂️ | আরে ভাই, কাকে চিপায় নিবেন তারে তো মেনশন দেন নাই!", threadID, messageID);
    }

/* --- [ 🔐 INTERNAL_SECURE_METADATA ] ---
 * 🤖 BOT NAME: MILON BOT
