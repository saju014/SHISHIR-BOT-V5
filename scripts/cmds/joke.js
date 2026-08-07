const axios = require("axios");

const mahmud = async () => {
  const basawait axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApwait axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/ = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.shishir;
};

module.exports = {
  config: {
    name: "joke",
    aliases: ["jokes"],
    version: "1.7",
    author: "shishir",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get a random joke"
    },
    longDescription: {
      en: "Fetches a funny joke from shishir's global API"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, api, event }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.\n",
        event.threadID,
        event.messageID
      );
    }
