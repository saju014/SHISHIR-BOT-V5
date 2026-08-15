const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "5.0",
    author: "ARIYAN AI",
    countDown: 3,
    role: 0,
    category: "Game",
    guide: "{pn} <amount> (Example: !slot 10k, !slot 1m, !slot 20m)"
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID) || {};
    let userMoney = userData.money || 0;

    // ১. অ্যামাউন্ট পার্সিং
    if (!args[0]) return message.reply("❌ কত টাকা স্লট মারবেন লিখুন! (যেমন: !slot 100k)");
    let amount = parseAmount(args[0]);

    if (isNaN(amount) || amount <= 0) return message.reply("❌ সঠিক টাকার পরিমাণ লিখুন।");
    if (amount > 20000000) return message.reply("❌ সর্বোচ্চ 20M (২০ মিলিয়ন) পর্যন্ত স্লট মারা যাবে।");
    if (amount > userMoney) return message.reply(`❌ পর্যাপ্ত টাকা নেই! আপনার আছে: $${userMoney.toLocaleString()}`);

    // ২. কুলডাউন ও লিমিট সিস্টেম (৩০ বার / ৩ ঘণ্টা)
    const now = Date.now();
    const cooldownTime = 3 * 60 * 60 * 1000; // 3 Hours
    const maxSpins = 30;

    if (!userData.data) userData.data = {};
    if (!userData.data.slotInfo) {
      userData.data.slotInfo = { count: 0, lastTime: now };
    }

    let { count, lastTime } = userData.data.slotInfo;

    if (now - lastTime > cooldownTime) {
      count = 0; 
      lastTime = now;
    }

    if (count >= maxSpins) {
      const remaining = cooldownTime - (now - lastTime);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(`❌ স্লট সীমা (৩০ বার) শেষ!\nআবার খেলতে পারবেন: ${hours} ঘণ্টা ${minutes} মিনিট পর।`);
    }

    // ৩. স্লট লজিক (65% Loss & 35% Win Odds)
    const items = ["🍓", "🦆", "🐢", "🍎", "🍊", "🍇", "💎"];
    let s1, s2, s3, s4, s5;
    let win = false;
    let multiplier = 0;
    let winType = "";

    const chance = Math.random();

    if (chance < 0.65) {
      // 65% PURE LOSS (কখনোই কোনো পেয়ার মিলবে না)
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      [s1, s2, s3, s4, s5] = [shuffled[0], shuffled[1], shuffled[2], shuffled[3], shuffled[4]];
      win = false;
    } else {
      // 35% WIN CHANCE
      win = true;
      const winChance = Math.random();
      
      if (winChance < 0.05) {
        // 5% Jackpot (10x)
        const match = items[Math.floor(Math.random() * items.length)];
        s1 = s2 = s3 = s4 = s5 = match;
        multiplier = 10;
        winType = "JACKPOT";
      } else if (winChance < 0.25) {
        // 20% Triple (3x)
        const match = items[Math.floor(Math.random() * items.length)];
        s1 = s2 = s3 = match;
        s4 = items.filter(x => x !== match)[0];
        s5 = items.filter(x => x !== match)[1];
        multiplier = 3;
        winType = "TRIPLE";
      } else {
        // 75% Pair (1.5x)
        const match = items[Math.floor(Math.random() * items.length)];
        s1 = s2 = match;
        const remaining = items.filter(x => x !== match);
        s3 = remaining[0]; s4 = remaining[1]; s5 = remaining[2];
        multiplier = 1.5;
        winType = "PAIR";
      }
    }

    const winnings = win ? Math.floor(amount * multiplier) : -amount;
    const finalMoney = userMoney + winnings;

    // ডাটাবেস আপডেট
    userData.data.slotInfo = { count: count + 1, lastTime: lastTime };
    await usersData.set(senderID, {
      money: finalMoney,
      data: userData.data
    });

    // ৪. শর্ট & স্প্যাম-সেফ UI
    const resultMsg = 
`🎰 𝐒𝐋𝐎𝐓 𝐌𝐀𝐂𝐇𝐈𝐍𝐄 🎰
[ ${s1} | ${s2} | ${s3} | ${s4} | ${s5} ]

${win ? `🎉 WON: +$${(winnings - amount).toLocaleString()} (${winType})` : `💔 LOST: -$${amount.toLocaleString()}`}
💰 BAL: $${finalMoney.toLocaleString()}
📊 LIMIT: ${count + 1}/30 (3h Cooldown)`;

    return message.reply(resultMsg);
  }
};

function parseAmount(input) {
  if (typeof input !== "string") return input;
  const unit = input.slice(-1).toLowerCase();
  const value = parseFloat(input);
  if (unit === 'k') return value * 1000;
  if (unit === 'm') return value * 1000000;
  if (unit === 'b') return value * 1000000000;
  return value;
}
