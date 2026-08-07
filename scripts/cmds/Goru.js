const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "goru",
    version: "2.3",
    author: "ARIJIT × Ere'rious", // Don't change author name
    countDown: 5,
    role: 0,
    usePrefix: true,
    shortDescription: "Expose someone as a Goru!",
    longDescription: "Puts the tagged/replied user's face on a cow's body (fun meme)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to make them a cow 😂",
    },
  },

  onStart: async function ({ event, message, api, usersData }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❗ Tag or reply to someone to turn them into a goru!");
    }

    if (targetID === event.senderID) {
      return message.reply("❗ Bro, why would you cow yourself?");
    }

    try {
