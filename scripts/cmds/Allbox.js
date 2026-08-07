const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "allbox",
    version: "1.0.0",
    author: "MOHAMMAD AKASH",
    countDown: 60,
    role: 2,
    shortDescription: "Manage all joined groups",
    longDescription: "List all groups and reply to Ban, Unban, Delete data, or remove the bot",
    category: "box chat",
    usages: "[page number/all]",
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID } = event;

    try {
      const dataThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = dataThreads.filter(thread => thread.isGroup);
      if (!groups.length) return api.sendMessage("There are currently no groups!", threadID);

      // Sort groups by messageCount descending
      groups.sort((a, b) => b.messageCount - a.messageCount);

      let msg = "🎭 GROUP LIST 🎭\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name}\n🔰TID: ${g.threadID}\n💌MessageCount: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name);
      });

