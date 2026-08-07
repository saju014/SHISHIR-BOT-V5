


module.exports = {
  config: {
    name: "sexvid",
    aliases: ["sex","sexvid"],
    version: "2.0",
    author: "nexo_here",
    countDown: 30,
    role: 2,
    shortDescription: "",
    longDescription: "get kanda/p***n video hilake sojaa",
    category: "18+",
    guide: "{p}{n}",
  },

  sentVideos: [],

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Tham video dicchi ektu Dara 😏",
    });

    const link = [
      "https://drive.google.com/uc?export=download&id=1-gJdG8bxmZLyOC7-6E4A5Hm95Q9gWIPO",
      "https://drive.google.com/uc?export=download&id=1-ryNR8j529EZyTCuMur9wmkFz4ahlv-f",
      "https://drive.google.com/uc?export=download&id=1-vHh7XBtPOS3s42q-s8s30Bzsx2u6czu",
      "https://drive.google.com/uc?export=download&id=11IUd-PDHozLmh_RtvSf0S-f3G6wut1ZT",
      "https://drive.google.com/uc?export=download&id=12YCqZovJ8sVZZZTDLu8dv8NAwsMGfqiB",
      "https://drive.google.com/uc?export=download&id=12eIiCYpd_Jm8zIVRSkqlSt7W-7OsxB6g",
      "https://drive.google.com/uc?export=download&id=13utWruipZ_3fR0QSMtGMnFjGt3bthnbf",
      "https://drive.google.com/uc?export=download&id=14GYNaYL-pkEh3UH0oIUXVamru5h830DY",
      "https://drive.google.com/uc?export=download&id=14UGb2fH4wyUbVSQ-Vt5yf-4sH3-icXGC",
