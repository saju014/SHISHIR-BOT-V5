module.exports = {
  config: {
    name: "out",
    aliases: ["out"],
    version: "2.5",
    author: "shishir",
    countDown: 5,
    role: 1,
    shortDescription: "Bot will leave group",
    longDescription: "",
    category: "admin",
    guide: {
      vi: "{pn} [tid,blank]",
      en: "{pn} [tid,blank]"
    }
  },

  onStart: async function ({ api, event, args }) {
    let id;

    if (!args.join(" ")) {
      id = event.threadID;
    } else {
      id = parseInt(args.join(" "));
    }

    const leaveMessage = `শিশির বাস বের করে দিলে তো অনেক কষ্ট পাইলাম কিন্তু! যাই হোক ভালো থেকো ভাবির খেয়াল রাইখো আমায় জানি ভুলনা লাভ ইউ বস...... 🥲..!🦆💨`;

    return api.sendMessage(
      leaveMessage,
      id,
      () => api.removeUserFromGroup(api.getCurrentUserID(), id)
    );
  }
};
