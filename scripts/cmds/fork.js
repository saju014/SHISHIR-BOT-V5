module.exports = {
  config: {
    name: "fork",
    version: "2.8",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Show  repository info",
    category: "utils",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: "╭━━━〔 𝐒𝐇𝐈𝐒𝐇𝐈𝐑-𝐁𝐎𝐓-𝐕5 〕━━━⦿\n┃\n┃ 👑 𝗢𝘄𝗻𝗲𝗿: 𝑨𝒉𝒎𝒆𝑫’𝒔 𝐒𝐇𝐈𝐒𝐇𝐈𝐑\n┃ 🔗 𝗥𝗲𝗽𝗼: %1\n┃ 💎 𝗦𝘁𝗮𝘁𝘂𝘀: always updating\n┃\n┃ ❝ 𝖳𝗁𝖾 𝖦𝗋𝖾𝖺𝗍𝖾𝗌𝗍 𝖮𝖿 𝖠𝗅𝗅 𝖳𝗂𝗆𝖾 𝖠𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝗈𝗇 ❞\n┃\n╰━━━━━━〔 📥 〕━━━━━━⦿"
    }
  },

  onStart: async function ({ message, getLang }) {
    const link = "আমার শিশির বস এর প্যান্টের নিচে ফর্ক আছে। যদি লাগে তাহলে শিশির বসের টুনটুনি থাক আর টুকু.. কইলাম না।... হলে পেয়ে যাবা 😂";
    return message.reply(getLang("current", link));
  },

  onChat: async function ({ message, getLang, event }) {
    if (event.body && event.body.toLowerCase() === "fork") {
      const link = "আমার শিশির বস এর প্যান্টের নিচে ফর্ক আছে যা কাছে ফক দিয়ে দিব নে 😂";
      return message.reply(getLang("current", link));
    }
  }
};
