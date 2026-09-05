!cmd install slot.js "use strict";

const MAX_BET   = 20000000; // 20M
const MAX_SPINS = 50;
const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

const ITEMS = ["🔮", "⚡", "👑", "💎", "🍒", "🔥", "7️⃣"];

function parseAmount(input) {
  if (typeof input !== "string") return input;
  const unit = input.slice(-1).toLowerCase();
  const value = parseFloat(input);
  if (unit === "k") return value * 1000;
  if (unit === "m") return value * 1000000;
  if (unit === "b") return value * 1000000000;
  return value;
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}

/** builds 3 reel symbols matching a given tier, plus its multiplier & label */
function rollResult() {
  const roll = Math.random() * 100;

  // 35% total win chance / 65% loss — every win tier has REAL profit,
  // no more confusing "you won $0" cases
  if (roll < 1) {
    const m = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    return { symbols: [m, m, m], multiplier: 10, title: "🚨 MEGA JACKPOT! 🚨" };
  }
  if (roll < 5) {
    const m = ITEMS[Math.floor(Math.random() * (ITEMS.length - 1))]; // never "7️⃣"
    return { symbols: [m, m, "7️⃣"], multiplier: 5, title: "🔥 WILD BOOST! 🔥" };
  }
  if (roll < 15) {
    const m = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const other = ITEMS.filter(x => x !== m)[Math.floor(Math.random() * (ITEMS.length - 1))];
    return { symbols: [m, m, other], multiplier: 2.5, title: "✨ SWEET STRIKE! ✨" };
  }
  if (roll < 35) {
    const m = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const other = ITEMS.filter(x => x !== m)[Math.floor(Math.random() * (ITEMS.length - 1))];
    return { symbols: [m, m, other], multiplier: 1.5, title: "🍀 NICE WIN! 🍀" };
  }

  // loss — 3 distinct symbols, guaranteed no pair
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  return { symbols: shuffled.slice(0, 3), multiplier: 0, title: "💀 HARD LUCK 💀" };
}

module.exports = {
  config: {
    name: "slot",
    version: "8.0.0",
    author: "ARIYAN AI",
    countDown: 3,
    role: 0,
    category: "Game",
    guide: "{pn} <amount> (Example: !slot 10k, !slot 1m, !slot 20m)"
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const userData = (await usersData.get(senderID)) || {};
    let userMoney = userData.money || 0;

    if (!args[0]) return message.reply("⚠️ কত টাকা বেট ধরবেন লিখুন! (যেমন: !slot 50k)");
    const amount = parseAmount(args[0]);

    if (isNaN(amount) || amount <= 0) return message.reply("❌ ইনপুট সঠিক নয়! সঠিক পরিমাণ লিখুন।");
    if (amount > MAX_BET) return message.reply(`❌ একবারে সর্বোচ্চ ${formatNumber(MAX_BET)} পর্যন্ত খেলতে পারবেন!`);
    if (amount > userMoney) return message.reply(`💸 আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! আছে: $${formatNumber(userMoney)}`);

    // spin limit / cooldown
    const now = Date.now();
    if (!userData.data) userData.data = {};
    if (!userData.data.slotInfo) userData.data.slotInfo = { count: 0, lastTime: now };
    let { count, lastTime } = userData.data.slotInfo;

    if (now - lastTime > COOLDOWN_MS) { count = 0; lastTime = now; }

    if (count >= MAX_SPINS) {
      const remaining = COOLDOWN_MS - (now - lastTime);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(`🛑 স্পিন লিমিট শেষ!\n⏳ আবার খেলতে পারবেন: ${hours}h ${minutes}m পর।`);
    }

    const { symbols, multiplier, title } = rollResult();
    const win = multiplier > 0;
    const winnings = win ? Math.floor(amount * multiplier) : 0;
    const profit = win ? winnings - amount : -amount;
    const finalMoney = userMoney + profit;

    userData.money = finalMoney;
    userData.data.slotInfo = { count: count + 1, lastTime };
    await usersData.set(senderID, userData);

    const payoutText = win ? `🟢 +$${formatNumber(profit)}` : `🔴 -$${formatNumber(amount)}`;

    const resultMsg =
      `🌸 ━━ NeZUKo 𝒁𝑶𝑵𝑬 ━━ 🌸\n` +
      `[ ${symbols.join(" | ")} ]\n\n` +
      `${title}\n` +
      `💰 Payout: ${payoutText}\n` +
      `💳 Wallet: $${formatNumber(finalMoney)}\n` +
      `🎟️ Spin: [ ${count + 1}/${MAX_SPINS} ]`;

    return message.reply(resultMsg);
  }
};
