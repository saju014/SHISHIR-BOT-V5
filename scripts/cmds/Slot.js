"use strict";

const MAX_BET = 20000000;
const MAX_SPINS = 50;
const COOLDOWN_MS = 3 * 60 * 60 * 1000;

const ITEMS = ["🔮", "⚡", "👑", "💎", "🍒", "🔥", "7️⃣"];

function parseAmount(input) {
  if (typeof input !== "string") return Number(input);

  const unit = input.slice(-1).toLowerCase();
  const value = parseFloat(input);

  if (isNaN(value)) return NaN;

  if (unit === "k") return value * 1000;
  if (unit === "m") return value * 1000000;
  if (unit === "b") return value * 1000000000;

  return value;
}

function formatNumber(num) {
  num = Number(num) || 0;

  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

  return Math.floor(num).toString();
}

function rollResult() {
  const roll = Math.random() * 100;

  // 💎 MEGA JACKPOT
  if (roll < 1) {
    const symbol =
      ITEMS[Math.floor(Math.random() * ITEMS.length)];

    return {
      symbols: [symbol, symbol, symbol],
      multiplier: 10,
      title: "╰┈➤ 👑 𝑴𝑬𝑮𝑨 𝑱𝑨𝑪𝑲𝑷𝑶𝑻 👑"
    };
  }

  // 🔥 WILD BOOST
  if (roll < 5) {
    const symbol =
      ITEMS[Math.floor(Math.random() * (ITEMS.length - 1))];

    return {
      symbols: [symbol, symbol, "7️⃣"],
      multiplier: 5,
      title: "╰┈➤ 🔥 𝑾𝑰𝑳𝑫 𝑩𝑶𝑶𝑺𝑻 🔥"
    };
  }

  // ✨ SWEET STRIKE
  if (roll < 15) {
    const symbol =
      ITEMS[Math.floor(Math.random() * ITEMS.length)];

    let other;
    do {
      other = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    } while (other === symbol);

    return {
      symbols: [symbol, symbol, other],
      multiplier: 2.5,
      title: "╰┈➤ ✨ 𝑺𝑾𝑬𝑬𝑻 𝑺𝑻𝑹𝑰𝑲𝑬 ✨"
    };
  }

  // 🍀 NICE WIN
  if (roll < 35) {
    const symbol =
      ITEMS[Math.floor(Math.random() * ITEMS.length)];

    let other;
    do {
      other = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    } while (other === symbol);

    return {
      symbols: [symbol, symbol, other],
      multiplier: 1.5,
      title: "╰┈➤ 🍀 𝑵𝑰𝑪𝑬 𝑾𝑰𝑵 🍀"
    };
  }

  // 💀 LOSS
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);

  return {
    symbols: shuffled.slice(0, 3),
    multiplier: 0,
    title: "╰┈➤ 💀 𝑯𝑨𝑹𝑫 𝑳𝑼𝑪𝑲 💀"
  };
}

module.exports = {
  config: {
    name: "slot",
    aliases: ["slots", "casino"],
    version: "9.0.0",
    author: "𝑺𝑯𝑰𝑺𝑯𝑰𝑹",
    countDown: 3,
    role: 0,
    category: "Game",

    guide: {
      en:
        "{pn} <amount>\n" +
        "Example:\n" +
        "{pn} 10k\n" +
        "{pn} 1m\n" +
        "{pn} 20m"
    }
  },

  onStart: async function ({
    args,
    message,
    event,
    usersData
  }) {
    const { senderID } = event;

    const userData =
      (await usersData.get(senderID)) || {};

    let userMoney = Number(userData.money) || 0;

    // =========================
    // AMOUNT CHECK
    // =========================

    if (!args[0]) {
      return message.reply(
        "╭━━━〔 🎰 𝑺𝑯𝑰𝑺𝑯𝑰𝑹'𝑺 𝑺𝑳𝑶𝑻 🎰 〕━━━╮\n" +
        "┃\n" +
        "┃ 💰 𝑩𝒆𝒕 𝑨𝒎𝒐𝒖𝒏𝒕 𝑫𝒊𝒏\n" +
        "┃\n" +
        "┃ ✦ Example: !slot 10k\n" +
        "┃ ✦ Example: !slot 1m\n" +
        "┃\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯"
      );
    }

    const amount = parseAmount(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        "❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑨𝒎𝒐𝒖𝒏𝒕!\n" +
        "➜ সঠিক amount দিন।"
      );
    }

    if (amount > MAX_BET) {
      return message.reply(
        `🚫 𝑴𝒂𝒙 𝑩𝒆𝒕: $${formatNumber(MAX_BET)}`
      );
    }

    if (amount > userMoney) {
      return message.reply(
        "╭━━〔 💸 𝑰𝑵𝑺𝑼𝑭𝑭𝑰𝑪𝑰𝑬𝑵𝑻 𝑩𝑨𝑳𝑨𝑵𝑪𝑬 〕━━╮\n" +
        `┃ 💳 𝑩𝒂𝒍𝒂𝒏𝒄𝒆: $${formatNumber(userMoney)}\n` +
        `┃ 🎯 𝑩𝒆𝒕: $${formatNumber(amount)}\n` +
        "╰━━━━━━━━━━━━━━━━━━━━━━╯"
      );
    }

    // =========================
    // SPIN SYSTEM
    // =========================

    const now = Date.now();

    if (!userData.data)
      userData.data = {};

    if (!userData.data.slotInfo) {
      userData.data.slotInfo = {
        count: 0,
        lastTime: now
      };
    }

    let {
      count,
      lastTime
    } = userData.data.slotInfo;

    if (now - lastTime >= COOLDOWN_MS) {
      count = 0;
      lastTime = now;
    }

    if (count >= MAX_SPINS) {
      const remaining =
        COOLDOWN_MS - (now - lastTime);

      const hours =
        Math.floor(
          remaining / (60 * 60 * 1000)
        );

      const minutes =
        Math.floor(
          (remaining % (60 * 60 * 1000)) /
          (60 * 1000)
        );

      return message.reply(
        "╭━━〔 🛑 𝑺𝑷𝑰𝑵 𝑳𝑰𝑴𝑰𝑻 〕━━╮\n" +
        "┃\n" +
        "┃ 🎰 𝑨𝒑𝒏𝒂𝒓 𝒔𝒑𝒊𝒏 𝒍𝒊𝒎𝒊𝒕 𝒔𝒆𝒔𝒉!\n" +
        `┃ ⏳ 𝑨𝒃𝒂𝒓: ${hours}h ${minutes}m\n` +
        "┃\n" +
        "╰━━━━━━━━━━━━━━━━━━╯"
      );
    }

    // =========================
    // ROLL
    // =========================

    const {
      symbols,
      multiplier,
      title
    } = rollResult();

    const win = multiplier > 0;

    const winnings = win
      ? Math.floor(amount * multiplier)
      : 0;

    const profit = win
      ? winnings - amount
      : -amount;

    const finalMoney =
      userMoney + profit;

    // =========================
    // SAVE DATA
    // =========================

    userData.money = finalMoney;

    userData.data.slotInfo = {
      count: count + 1,
      lastTime
    };

    await usersData.set(
      senderID,
      userData
    );

    // =========================
    // RESULT
    // =========================

    const payoutText = win
      ? `🟢 +$${formatNumber(profit)}`
      : `🔴 -$${formatNumber(amount)}`;

    const resultMsg =
      "╭━━━〔 🎰 𝑺𝑯𝑰𝑺𝑯𝑰𝑹'𝑺 𝑺𝑳𝑶𝑻 🎰 〕━━━╮\n" +
      "┃\n" +
      `┃     [ ${symbols.join("  |  ")} ]\n` +
      "┃\n" +
      `┃ ${title}\n` +
      "┃\n" +
      `┃ 🎯 𝑩𝒆𝒕      : $${formatNumber(amount)}\n` +
      `┃ 💰 𝑷𝒂𝒚𝒐𝒖𝒕  : ${payoutText}\n` +
      `┃ 💳 𝑾𝒂𝒍𝒍𝒆𝒕   : $${formatNumber(finalMoney)}\n` +
      `┃ 🎟️ 𝑺𝒑𝒊𝒏     : [ ${count + 1}/${MAX_SPINS} ]\n` +
      "┃\n" +
      "┃ 👑 𝑶𝒘𝒏𝒆𝒓: 𝑺𝑯𝑰𝑺𝑯𝑰𝑹\n" +
      "┃\n" +
      "╰━━━━━━━━━━━━━━━━━━━━━━╯";

    return message.reply(resultMsg);
  }
};
