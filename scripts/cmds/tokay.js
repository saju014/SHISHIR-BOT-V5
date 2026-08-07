const axios = require("axios");
const fs = require("fs");
const path  fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.shishir;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "tokai",
    aliases: ["toqai"],
    version: "1.7",
    author: "shishir",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "[mention/reply/UID]",
  },

  onStart: async function({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.\n", 
        event.threadID, 
        event.messageID
      );
