module.exports = {
  config: {
    name: "casino",
    version: "4.0.0",
    author: "Shishir",
    role: 0,
    category: "games",
    shortDescription: {
      en: "Premium animated casino"
    },
    longDescription: {
      en: "Animated casino games with premium style"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    const MIN_BET = 50;
    const MAX_BET = 20000000;

    const userData = await usersData.get(senderID);
    const balance = Number(userData?.money || 0);

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    function format(n) {
      n = Number(n);

      if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";

      return Math.floor(n).toLocaleString();
    }

    function parseAmount(value) {
      if (!value) return NaN;

      value = String(value).toLowerCase();

      if (value === "all") return balance;

      const match = value.match(/^(\d+(?:\.\d+)?)(k|m|b|t)?$/);

      if (!match) return NaN;

      const number = parseFloat(match[1]);
      const unit = match[2];

      const units = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12
      };

      return unit ? number * units[unit] : number;
    }

    function validateBet(bet) {
      if (isNaN(bet) || bet < MIN_BET) {
        return `╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ 💰 𝗠𝗶𝗻𝗶𝗺𝘂𝗺 : ${format(MIN_BET)}$
┃ 🛡️ 𝗠𝗮𝘅𝗶𝗺𝘂𝗺 : ${format(MAX_BET)}$
┃
╰━━━━━━━━━━━━━━━━━━╯`;
      }

      if (bet > MAX_BET) {
        return `╭━━━〔 🛡️ 𝗕𝗟𝗢𝗖𝗞𝗘𝗗 〕━━━╮
┃
┃ 🚫 𝗠𝗮𝘅 𝗕𝗲𝘁 : ${format(MAX_BET)}$
┃
┃ ⚠️ 𝗛𝗶𝗴𝗵 𝘀𝘁𝗮𝗸𝗲𝘀 𝗮𝗿𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱!
┃
╰━━━━━━━━━━━━━━━━━━╯`;
      }

      if (bet > balance) {
        return `╭━━━〔 💸 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 〕━━━╮
┃
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance)}$
┃ 💰 𝗕𝗲𝘁     : ${format(bet)}$
┃
┃ ❌ 𝗡𝗼𝘁 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆!
┃
╰━━━━━━━━━━━━━━━━━━╯`;
      }

      return null;
    }

    async function animate(messageID, frames, delay = 600) {
      for (const frame of frames) {
        await api.editMessage(frame, messageID);
        await sleep(delay);
      }
    }

    const choose = String(args[0] || "").toLowerCase();

    // =========================
    // MENU
    // =========================

    if (!choose) {
      const menu = `╭━━━〔 🎰 𝗖𝗔𝗦𝗜𝗡𝗢 〕━━━╮
┃
┃   💎 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗚𝗔𝗠𝗘𝗦
┃
┃ 🎲 𝟭. 𝗕𝗜𝗚 / 𝗦𝗠𝗔𝗟𝗟
┃ 🎴 𝟮. 𝗘𝗩𝗘𝗡 / 𝗢𝗗𝗗
┃ 🎟️ 𝟯. 𝗟𝗢𝗧𝗧𝗘𝗥𝗬
┃ 🎯 𝟰. 𝗗𝗜𝗙𝗙𝗘𝗥𝗘𝗡𝗖𝗘
┃ 🍒 𝟱. 𝗦𝗟𝗢𝗧
┃
┣━━━━━━━━━━━━━━━━━━
┃ 💰 𝗠𝗶𝗻 : 𝟱𝟬$
┃ 🛡️ 𝗠𝗮𝘅 : 𝟮𝟬𝗠$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance)}$
╰━━━━━━━━━━━━━━━━━━╯

💡 𝗧𝘆𝗽𝗲:
𝗰𝗮𝘀𝗶𝗻𝗼 𝟭
𝗰𝗮𝘀𝗶𝗻𝗼 𝟱`;

      const sent = await api.sendMessage(menu, threadID);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "casino",
        author: senderID
      });

      return;
    }

    // =========================
    // MENU GUIDE
    // =========================

    const menuGames = {
      "1": "big",
      "2": "even",
      "3": "lottery",
      "4": "difference",
      "5": "slot"
    };

    if (menuGames[choose]) {
      const game = menuGames[choose];

      let guide = "";

      if (game === "big") {
        guide = `🎲 𝗕𝗜𝗚 / 𝗦𝗠𝗔𝗟𝗟

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:
casino big 1k
casino small 1k`;
      }

      if (game === "even") {
        guide = `🎴 𝗘𝗩𝗘𝗡 / 𝗢𝗗𝗗

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:
casino even 1k
casino odd 1k`;
      }

      if (game === "lottery") {
        guide = `🎟️ 𝗟𝗢𝗧𝗧𝗘𝗥𝗬

Choose number 0-99.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:
casino lottery 50 1k`;
      }

      if (game === "difference") {
        guide = `🎯 𝗗𝗜𝗙𝗙𝗘𝗥𝗘𝗡𝗖𝗘

Choose number 0-9.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:
casino difference 5 1k`;
      }

      if (game === "slot") {
        guide = `🍒 𝗦𝗟𝗢𝗧

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:
casino slot 1k`;
      }

      return api.sendMessage(
        `╭━━━〔 🎮 𝗚𝗔𝗠𝗘 〕━━━╮
┃
┃ ${guide.replace(/\n/g, "\n┃ ")}
┃
┣━━━━━━━━━━━━━━━━━━
┃ 💰 𝗠𝗶𝗻 : 50$
┃ 🛡️ 𝗠𝗮𝘅 : 20M$
╰━━━━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }

    // =========================
    // BIG / SMALL
    // =========================

    if (choose === "big" || choose === "small") {
      const bet = parseAmount(args[1]);
      const error = validateBet(bet);

      if (error) return api.sendMessage(error, threadID, messageID);

      await usersData.subtractMoney(senderID, bet);

      const sent = await api.sendMessage(
        `╭━━━〔 🎲 𝗕𝗜𝗚 / 𝗦𝗠𝗔𝗟𝗟 〕━━━╮
┃
┃ 🔄 𝗣𝗿𝗲𝗽𝗮𝗿𝗶𝗻𝗴...
╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      await animate(sent.messageID, [
        `╭━━━〔 🎲 𝗥𝗢𝗟𝗟𝗜𝗡𝗚 〕━━━╮
┃
┃       🎲
┃
┃    ░░░░░░░░░░
╰━━━━━━━━━━━━━━━━━━╯`,

        `╭━━━〔 🎲 𝗥𝗢𝗟𝗟𝗜𝗡𝗚 〕━━━╮
┃
┃      🎲 🎲
┃
┃    ▓▓░░░░░░░░
╰━━━━━━━━━━━━━━━━━━╯`,

        `╭━━━〔 🎲 𝗥𝗢𝗟𝗟𝗜𝗡𝗚 〕━━━╮
┃
┃    🎲 🎲 🎲
┃
┃    ▓▓▓▓▓▓▓▓▓▓
╰━━━━━━━━━━━━━━━━━━╯`
      ], 500);

      const number = Math.floor(Math.random() * 12) + 1;
      const result = number >= 7 ? "big" : "small";

      if (choose === result) {
        const reward = bet * 2;
        await usersData.addMoney(senderID, reward);

        return api.editMessage(
          `╭━━━〔 🏆 𝗩𝗜𝗖𝗧𝗢𝗥𝗬 〕━━━╮
┃
┃ 🎉 𝗬𝗢𝗨 𝗪𝗢𝗡!
┃
┃ 🎲 𝗡𝘂𝗺𝗯𝗲𝗿 : ${number}
┃ 🎯 𝗥𝗲𝘀𝘂𝗹𝘁 : ${result.toUpperCase()}
┃ 🔥 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿 : 𝟮×
┃
┃ 💰 𝗥𝗲𝘄𝗮𝗿𝗱 : +${format(reward)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet + reward)}$
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );
      }

      return api.editMessage(
        `╭━━━〔 💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥 〕━━━╮
┃
┃ 😈 𝗕𝗔𝗗 𝗟𝗨𝗖𝗞!
┃
┃ 🎲 𝗡𝘂𝗺𝗯𝗲𝗿 : ${number}
┃ 🎯 𝗥𝗲𝘀𝘂𝗹𝘁 : ${result.toUpperCase()}
┃
┃ 💸 𝗟𝗼𝘀𝘁 : -${format(bet)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet)}$
╰━━━━━━━━━━━━━━━━━━╯`,
        sent.messageID
      );
    }

    // =========================
    // EVEN / ODD
    // =========================

    if (choose === "even" || choose === "odd") {
      const bet = parseAmount(args[1]);
      const error = validateBet(bet);

      if (error) return api.sendMessage(error, threadID, messageID);

      await usersData.subtractMoney(senderID, bet);

      const sent = await api.sendMessage(
        "🎴 𝗦𝗛𝗨𝗙𝗙𝗟𝗜𝗡𝗚...",
        threadID
      );

      await animate(sent.messageID, [
        "🎴 𝗦𝗛𝗨𝗙𝗙𝗟𝗜𝗡𝗚... ⬅️",
        "➡️ 🎴 𝗦𝗛𝗨𝗙𝗙𝗟𝗜𝗡𝗚...",
        "🎴 ➡️ 🎴 𝗦𝗛𝗨𝗙𝗙𝗟𝗜𝗡𝗚...",
        "🎴 🎴 ➡️ 🎴"
      ], 450);

      const number = Math.floor(Math.random() * 100) + 1;
      const result = number % 2 === 0 ? "even" : "odd";

      if (choose === result) {
        const reward = bet * 2;
        await usersData.addMoney(senderID, reward);

        return api.editMessage(
          `╭━━━〔 ✨ 𝗪𝗜𝗡𝗡𝗘𝗥 〕━━━╮
┃
┃ 🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦!
┃
┃ 🔢 𝗡𝘂𝗺𝗯𝗲𝗿 : ${number}
┃ 🎴 𝗧𝘆𝗽𝗲 : ${result.toUpperCase()}
┃
┃ 💰 𝗣𝗿𝗼𝗳𝗶𝘁 : +${format(reward)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet + reward)}$
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );
      }

      return api.editMessage(
        `╭━━━〔 ☠️ 𝗟𝗢𝗦𝗦 〕━━━╮
┃
┃ 😈 𝗕𝗔𝗗 𝗟𝗨𝗖𝗞!
┃
┃ 🔢 𝗡𝘂𝗺𝗯𝗲𝗿 : ${number}
┃ 🎴 𝗧𝘆𝗽𝗲 : ${result.toUpperCase()}
┃
┃ 💸 𝗟𝗼𝘀𝘁 : -${format(bet)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet)}$
╰━━━━━━━━━━━━━━━━━━╯`,
        sent.messageID
      );
    }

    // =========================
    // LOTTERY
    // =========================

    if (choose === "lottery") {
      const guess = Number(args[1]);
      const bet = parseAmount(args[2]);

      if (!Number.isInteger(guess) || guess < 0 || guess > 99) {
        return api.sendMessage(
          `╭━━━〔 ⚠️ 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ 🎟️ Choose a number from 𝟬-𝟵𝟵.
╰━━━━━━━━━━━━━━━━━━╯`,
          threadID,
          messageID
        );
      }

      const error = validateBet(bet);
      if (error) return api.sendMessage(error, threadID, messageID);

      await usersData.subtractMoney(senderID, bet);

      const sent = await api.sendMessage(
        "╭━━━〔 🎟️ 𝗟𝗢𝗧𝗧𝗘𝗥𝗬 〕━━━╮\n┃\n┃ 🔄 DRAWING...\n╰━━━━━━━━━━━━━━━━━━╯",
        threadID
      );

      await animate(sent.messageID, [
        "╭━━━〔 🎟️ 𝗗𝗥𝗔𝗪 〕━━━╮\n┃\n┃ 🎟️  ➜  ❔\n╰━━━━━━━━━━━━━━━━━━╯",
        "╭━━━〔 🎟️ 𝗗𝗥𝗔𝗪 〕━━━╮\n┃\n┃ 🎟️  ➜  🔢\n╰━━━━━━━━━━━━━━━━━━╯",
        "╭━━━〔 🎟️ 𝗗𝗥𝗔𝗪 〕━━━╮\n┃\n┃ 🎟️  ➜  🎯\n╰━━━━━━━━━━━━━━━━━━╯"
      ], 600);

      const result = Math.floor(Math.random() * 100);

      if (guess === result) {
        const reward = bet * 10;

        await usersData.addMoney(senderID, reward);

        return api.editMessage(
          `╭━━━〔 💎 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 〕━━━╮
┃
┃ 🔥 𝗣𝗘𝗥𝗙𝗘𝗖𝗧 𝗠𝗔𝗧𝗖!
┃
┃ 🎟️ 𝗬𝗼𝘂𝗿 : ${guess}
┃ 🎯 𝗥𝗲𝘀𝘂𝗹𝘁 : ${result}
┃
┃ 💎 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿 : 𝟭𝟬×
┃ 💰 𝗪𝗼𝗻 : +${format(reward)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet + reward)}$
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );
      }

      return api.editMessage(
        `╭━━━〔 💀 𝗟𝗢𝗧𝗧𝗘𝗥𝗬 𝗢𝗩𝗘𝗥 〕━━━╮
┃
┃ 😈 𝗡𝗢 𝗠𝗔𝗧𝗖!
┃
┃ 🎟️ 𝗬𝗼𝘂𝗿 : ${guess}
┃ 🎯 𝗥𝗲𝘀𝘂𝗹𝘁 : ${result}
┃
┃ 💸 𝗟𝗼𝘀𝘁 : -${format(bet)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet)}$
╰━━━━━━━━━━━━━━━━━━╯`,
        sent.messageID
      );
    }

    // =========================
    // DIFFERENCE
    // =========================

    if (choose === "difference") {
      const guess = Number(args[1]);
      const bet = parseAmount(args[2]);

      if (!Number.isInteger(guess) || guess < 0 || guess > 9) {
        return api.sendMessage(
          `╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ 🎯 Choose a number from 𝟬-𝟵.
╰━━━━━━━━━━━━━━━━━━╯`,
          threadID,
          messageID
        );
      }

      const error = validateBet(bet);
      if (error) return api.sendMessage(error, threadID, messageID);

      await usersData.subtractMoney(senderID, bet);

      const sent = await api.sendMessage(
        "🎯 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗡𝗚...",
        threadID
      );

      await animate(sent.messageID, [
        "🎯 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗡𝗚... ░░░",
        "🎯 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗡𝗚... ▓▓░",
        "🎯 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗡𝗚... ▓▓▓",
        "🎯 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗜𝗡𝗚... ███"
      ], 450);

      const result = Math.floor(Math.random() * 10);
      const difference = Math.abs(guess - result);

      let multiplier = 0;

      if (difference === 0) multiplier = 5;
      else if (difference === 1) multiplier = 3;
      else if (difference === 2) multiplier = 2;

      if (multiplier > 0) {
        const reward = bet * multiplier;

        await usersData.addMoney(senderID, reward);

        return api.editMessage(
          `╭━━━〔 🏆 𝗣𝗘𝗥𝗙𝗘𝗖𝗧 〕━━━╮
┃
┃ 🎯 𝗬𝗢𝗨𝗥 : ${guess}
┃ 🎲 𝗥𝗘𝗦𝗨𝗟𝗧 : ${result}
┃ 📏 𝗗𝗜𝗙𝗙 : ${difference}
┃
┃ 🔥 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿 : ${multiplier}×
┃ 💰 𝗪𝗼𝗻 : +${format(reward)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet + reward)}$
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );
      }

      return api.editMessage(
        `╭━━━〔 💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥 〕━━━╮
┃
┃ 😈 𝗕𝗔𝗗 𝗟𝗨𝗖𝗞!
┃
┃ 🎯 𝗬𝗼𝘂𝗿 : ${guess}
┃ 🎲 𝗥𝗲𝘀𝘂𝗹𝘁 : ${result}
┃ 📏 𝗗𝗶𝗳𝗳 : ${difference}
┃
┃ 💸 𝗟𝗼𝘀𝘁 : -${format(bet)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet)}$
╰━━━━━━━━━━━━━━━━━━╯`,
        sent.messageID
      );
    }

    // =========================
    // SLOT
    // =========================

    if (choose === "slot") {
      const bet = parseAmount(args[1]);
      const error = validateBet(bet);

      if (error) return api.sendMessage(error, threadID, messageID);

      await usersData.subtractMoney(senderID, bet);

      const sent = await api.sendMessage(
        `╭━━━〔 🎰 𝗦𝗟𝗢𝗧 〕━━━╮
┃
┃ 🔄 𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚...
╰━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      const items = ["🍒", "🍋", "🍉", "🍊", "🍇", "🍓"];

      for (let i = 0; i < 4; i++) {
        const a = items[Math.floor(Math.random() * items.length)];
        const b = items[Math.floor(Math.random() * items.length)];
        const c = items[Math.floor(Math.random() * items.length)];

        await api.editMessage(
          `╭━━━〔 🎰 𝗦𝗣𝗜𝗡𝗡𝗜𝗡𝗚 〕━━━╮
┃
┃  ${a}  │  ${b}  │  ${c}
┃
┃       🔄
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );

        await sleep(500);
      }

      const a = items[Math.floor(Math.random() * items.length)];
      const b = items[Math.floor(Math.random() * items.length)];
      const c = items[Math.floor(Math.random() * items.length)];

      let multiplier = 0;

      if (a === b && b === c) {
        multiplier = 5;
      } else if (a === b || b === c || a === c) {
        multiplier = 2;
      }

      if (multiplier > 0) {
        const reward = bet * multiplier;

        await usersData.addMoney(senderID, reward);

        return api.editMessage(
          `╭━━━〔 💎 𝗦𝗟𝗢𝗧 𝗪𝗜𝗡 〕━━━╮
┃
┃  ${a}  │  ${b}  │  ${c}
┃
┃ 🎉 𝗬𝗢𝗨 𝗪𝗢𝗡!
┃ 🔥 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿 : ${multiplier}×
┃
┃ 💰 𝗪𝗼𝗻 : +${format(reward)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet + reward)}$
╰━━━━━━━━━━━━━━━━━━╯`,
          sent.messageID
        );
      }

      return api.editMessage(
        `╭━━━〔 💀 𝗦𝗟𝗢𝗧 𝗢𝗩𝗘𝗥 〕━━━╮
┃
┃  ${a}  │  ${b}  │  ${c}
┃
┃ 😈 𝗕𝗔𝗗 𝗟𝗨𝗖𝗞!
┃
┃ 💸 𝗟𝗼𝘀𝘁 : -${format(bet)}$
┃ 💳 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 : ${format(balance - bet)}$
╰━━━━━━━━━━━━━━━━━━╯`,
        sent.messageID
      );
    }

    return api.sendMessage(
      `╭━━━〔 ❌ 𝗘𝗥𝗥𝗢𝗥 〕━━━╮
┃
┃ Unknown casino game!
┃
┃ 🎲 big / small
┃ 🎴 even / odd
┃ 🎟️ lottery
┃ 🎯 difference
┃ 🍒 slot
┃
╰━━━━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const prefix = global.GoatBot?.config?.prefix || "!";

    const guide = {
      "1": "casino big 1k",
      "2": "casino even 1k",
      "3": "casino lottery 50 1k",
      "4": "casino difference 5 1k",
      "5": "casino slot 1k"
    };

    if (!guide[event.body]) {
      return api.sendMessage(
        `╭━━━〔 ⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 〕━━━╮
┃
┃ ❌ Choose 𝟭, 𝟮, 𝟯, 𝟰 or 𝟱.
╰━━━━━━━━━━━━━━━━━━╯`,
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      `╭━━━〔 🎰 𝗚𝗔𝗠𝗘 𝗦𝗘𝗟𝗘𝗖𝗧𝗘𝗗 〕━━━╮
┃
┃ 🎮 𝗨𝘀𝗲:
┃
┃ ${prefix}${guide[event.body]}
╰━━━━━━━━━━━━━━━━━━━━━━╯`,
      event.threadID,
      event.messageID
    );
  }
};
