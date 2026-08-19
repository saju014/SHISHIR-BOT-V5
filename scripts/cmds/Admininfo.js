module.exports = {
  config: {
    name: "admininfo",
    aliases: ["admin", "ainfo", "info"],
    version: "3.0.0",
    author: "SHISHIR",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot admin information",
    category: "info"
  },

  onStart: async function ({ message }) {

    const name = "𝐒𝐡𝐚𝐰𝐨𝐧";
    const address = "𝐑𝐚𝐣𝐬𝐡𝐚𝐡𝐢";
    const study = "𝐇𝐨𝐧𝐨𝐮𝐫𝐬 𝟏𝐬𝐭";
    const relation = "𝐒𝐢𝐧𝐠𝐥𝐞";
    const colour = "𝐁𝐥𝐚𝐜𝐤 & 𝐖𝐡𝐢𝐭𝐞";
    const number = "𝟎𝟏𝟖𝟏𝟔****𝟗𝟎";

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃
┃    🤖 𝐁𝐎𝐓 𝐀𝐃𝐌𝐈𝐍 𝐈𝐍𝐅𝐎
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

       ✦ 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ✦

╭──────────────────────╮
┃ 👤 𝐍𝐀𝐌𝐄
┃ ➜ ${name}
┃
┃ 🏠 𝐁𝐀𝐒𝐀
┃ ➜ ${address}
┃
┃ 🎓 𝐒𝐓𝐔𝐃𝐘
┃ ➜ ${study}
┃
┃ 💞 𝐑𝐄𝐋𝐀𝐓𝐈𝐎𝐍
┃ ➜ ${relation}
┃
┃ 🎨 𝐅𝐀𝐕 𝐂𝐎𝐋𝐎𝐔𝐑
┃ ➜ ${colour}
┃
┃ 📱 𝐍𝐔𝐌𝐁𝐄𝐑
┃ ➜ ${number}
╰──────────────────────╯

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🛡️ 𝐁𝐎𝐓 𝐀𝐃𝐌𝐈𝐍
┃ 🤖 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑
┃ ⚡ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐂𝐂𝐄𝐒𝐒
╰━━━━━━━━━━━━━━━━━━━━━━╯

      「 🖤 𝐒𝐇𝐀𝐖𝐎𝐍 🤍 」

   ✦ 𝐌𝐀𝐃𝐄 𝐖𝐈𝐓𝐇 ❤️ 𝐁𝐘 𝐒𝐇𝐈𝐒𝐇𝐈𝐑 ✦
`;

    return message.reply(msg);
  }
};
