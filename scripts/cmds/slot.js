const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "4.0",
    author: "ARIYAN AI",
    countDown: 5,
    role: 0,
    category: "Game",
    guide: "{pn} <amount> (Example: !slot 10k, !slot 1m, !slot 300m)"
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID, threadID, messageID } = event;
    const userData = await usersData.get(senderID);

    // ১. অ্যামাউন্ট পার্সিং
    if (!args[0]) return message.reply("❌ কত টাকা স্লট মারতে চান তা লিখুন। (যেমন: !slot 100k)");
    let amount = parseAmount(args[0]);

    if (isNaN(amount) || amount <= 0) return message.reply("❌ দয়া করে সঠিক টাকার পরিমাণ লিখুন।");
    if (amount > 300000000) return message.reply("❌ জানু, একবারে সর্বোচ্চ 300M (৩০০ মিলিয়ন) পর্যন্ত স্লট মারা যাবে।");
    if (amount > userData.money) return message.reply(`❌ আপনার কাছে পর্যাপ্ত টাকা নেই! আপনার আছে: $${userData.money.toLocaleString()}`);

    // ২. কুলডাউন ও লিমিট সিস্টেম (৩৫ বার / ২ ঘণ্টা)
    const now = Date.now();
    const cooldownTime = 2 * 60 * 60 * 1000; 
    const maxSpins = 35;

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
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return message.reply(`❌ | আপনি আপনার স্লট সীমা (৩৫ বার) অতিক্রম করেছেন।\nআবার চেষ্টা করুন: ${hours} ঘণ্টা ${minutes} মিনিট ${seconds} সেকেন্ড পর।`);
    }

    // ৩. স্লট লজিক এবং আইটেম
    const items = ["🍓", "🦆", "🐢", "🍎", "🍊", "🍇", "💎"];
    const s1 = items[Math.floor(Math.random() * items.length)];
    const s2 = items[Math.floor(Math.random() * items.length)];
    const s3 = items[Math.floor(Math.random() * items.length)];
    const s4 = items[Math.floor(Math.random() * items.length)];
    const s5 = items[Math.floor(Math.random() * items.length)];

    let win = false;
    let multiplier = 0;
    let winType = "";

    // অ্যাডভান্সড ১x থেকে ১০x উইনিং লজিক
    if (s1 === s2 && s2 === s3 && s3 === s4 && s4 === s5) { 
        win = true; multiplier = 10; winType = "👑 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 👑"; 
    } 
    else if ((s1 === s2 && s2 === s3 && s3 === s4) || (s2 === s3 && s3 === s4 && s4 === s5)) { 
        win = true; multiplier = 7; winType = "🔥 𝐐𝐔𝐀𝐃𝐑𝐔𝐏𝐋𝐄 🔥";
    }
    else if ((s1 === s2 && s2 === s3) || (s2 === s3 && s3 === s4) || (s3 === s4 && s4 === s5)) { 
        win = true; multiplier = 4; winType = "✨ 𝐓𝐑𝐈𝐏𝐋𝐄 ✨";
    }
    else if ((s1 === s2 && s4 === s5) || (s1 === s2 && s3 === s4) || (s2 === s3 && s4 === s5)) {
        win = true; multiplier = 2.5; winType = "🎀 𝐓𝐖𝐎 𝐏𝐀𝐈𝐑𝐒 🎀";
    }
    else if (s1 === s2 || s2 === s3 || s3 === s4 || s4 === s5 || s1 === s5) {
        win = true; multiplier = 1.5; winType = "🎈 𝐎𝐍𝐄 𝐏𝐀𝐈𝐑 🎈";
    } else {
        // কোনো পেয়ার না মিললে ৫% চান্স লাকি ব্রেক (১x রিফান্ড)
        if (Math.random() < 0.05) {
          win = true; multiplier = 1; winType = "🍀 𝐋𝐔𝐂𝐊𝐘 𝐁𝐑𝐄𝐀𝐊 🍀";
        }
    }

    const winnings = win ? Math.floor(amount * multiplier) : -amount;
    const finalMoney = (userData.money || 0) + winnings;

    // ডাটাবেস আপডেট
    userData.data.slotInfo = { count: count + 1, lastTime: lastTime };
    await usersData.set(senderID, {
      money: finalMoney,
      data: userData.data
    });

    // ৪. প্রিমিয়াম ক্যাসিনো স্টাইল টেক্সট UI ডিজাইন
    const statusEmoji = win ? "🟢" : "🔴";
    const resultHeader = win ? "🎉 𝐘𝐎𝐔 𝐖𝐎𝐍 🎉" : "💀 𝐘𝐎𝐔 𝐋𝐎𝐒𝐄 💀";
    
    const resultMsg = `🎰 ═══ 𝐂𝐀𝐒𝐈𝐍𝐎 𝐒𝐋𝐎𝐓 ═══ 🎰

✨ 𝘓𝘶𝘤𝘬𝘺 𝘙𝘦𝘦𝘭𝘴:
  💎 ╔══════════════╗ 💎
       [  ${s1}  |  ${s2}  |  ${s3}  |  ${s4}  |  ${s5}  ]
  💎 ╚══════════════╝ 💎

💵 𝐁𝐞𝐭 𝐀𝐦𝐨𝐮𝐧𝐭: $${amount.toLocaleString()}
🎯 𝐑𝐞𝐬𝐮𝐥𝐭: ${resultHeader}

${statusEmoji} 𝐒𝐭𝐚𝐭𝐮𝐬: ${win ? `${winType} (${multiplier}x)` : "𝐁𝐞𝐭𝐭𝐞𝐫 𝐥𝐮𝐜𝐤 𝐧𝐞𝐱𝐭 𝐭𝐢𝐦𝐞!"}
💰 ${win ? "𝐏𝐫𝐨𝐟𝐢𝐭" : "𝐋𝐨𝐬𝐬"}: $${Math.abs(winnings).toLocaleString()}
💳 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $${finalMoney.toLocaleString()}

⚙️ 𝐒𝐩𝐢𝐧 𝐋𝐢𝐦𝐢𝐭: [ ${count + 1} / 35 ]
🔔 𝘛𝘪𝘱: 𝘓𝘪𝘮𝘪𝘵 𝘴𝘩𝘦𝘴𝘩 𝘩𝘰𝘭𝘦 2𝘩 𝘸𝘢𝘪𝘵 𝘬𝘰𝘳𝘵𝘦 𝘩𝘰𝘣𝘦!`;

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
