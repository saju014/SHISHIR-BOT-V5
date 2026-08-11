module.exports = {
	config: {
		name: "mention",
		version: "1.2",
		author: "shishir",
		role: 0,
		shortDescription: {
			en: "Reply when specific user is mentioned"
		},
		category: "owner"
	},

	onStart: async function () {},

	onChat: async function ({ api, event }) {
		const bossUIDs = [
			"61592841571046",
			"61592841571046"
		];

		if (!event.mentions || typeof event.mentions !== "object")
			return;

		const mentionedIDs = Object.keys(event.mentions);

		if (mentionedIDs.some(uid => bossUIDs.includes(uid))) {
			return api.sendMessage(
				"-কিরে বোকাচোদা বসরে মেনশন,  দেও কে। বস এখন পরকীয়ায় বিজি। তুমি পরকীয়া করতে চাইলে ইনবক্স করো বারবার বসের মেনশন দিস না -আর একবার মেনশন দিলে তোর নানির খালিঘর-🫠🌷",
				event.threadID,
				event.messageID
			);
		}
	}
};
