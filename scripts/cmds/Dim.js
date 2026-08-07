const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
 
//avatar fetch fix by Eren
const fetchAvatar = async (uid) => {
  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const finalUrl = avatarUrl.includes("?")
      ? `${avatarUrl}&t=${Date.now()}`
      : `${avatarUrl}?t=${Date.now()}`;
 
    const response = await axios.get(finalUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
 
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch avatar: ${error.message}`);
  }
};
 
module.exports = {
  config: {
    name: 'dim',
    aliases: ['anda'],
    version: '2.1',
    author: 'Meheraz',
    role: 0,
    category: 'fun',
    shortDescription: 'Turn someone into dim meme',
    longDescription: 'Funny dim meme with avatar on egg head',
    guide: '{pn} @mention / reply'
