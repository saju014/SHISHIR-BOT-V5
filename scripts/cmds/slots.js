const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "slots_data.json");

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const symbols = ["🍉", "🔔", "🍒", "💎", "7️⃣", "🍋"];

module.exports = {
  config: {
    name: "slots",
    aliases: ["slot", "spin"],
    version: "1.0",
    author: "Shishir",
    countDown: 5,
    role: 0,
    shortDescription: "VIP style fun slot",
    category: "game"
  },

  onStart: async function ({ event, message }) {
    const data = loadData();
    const uid = event.senderID;

    if (!data[uid]) {
      data[uid] = {
        points: 100,
        wins: 0,
        plays: 0
      };
    }

    const user = data[uid];

    // 3 random symbols
    const a = symbols[Math.floor(Math.random() * symbols.length)];
    const b = symbols[Math.floor(Math.random() * symbols.length)];
    const c = symbols[Math.floor(Math.random() * symbols.length)];

    user.plays++;

    let result;
    let gained = 0;

    // Win conditions
    if (a === b && b === c) {
      gained = 100;
      user.wins++;
      user.points += gained;
      result = `🏆 JACKPOT! +${gained} Points`;
    } else if (a === b || b === c || a === c) {
      gained = 25;
      user.points += gained;
      result = `🎉 WIN! +${gained} Points`;
    } else {
      result = "❌ NO WIN — Try Again!";
    }

    saveData(data);

    return message.reply(
`🎰 ━━━ VIP FUN SLOTS ━━━ 🎰

🎰  S L O T S

💎 Points: ${user.points}
🎯 Result: ${a}  |  ${b}  |  ${c}

━━━━━━━━━━━━━━━━━━
${result}
━━━━━━━━━━━━━━━━━━

🏆 Wins: ${user.wins}
🎮 Plays: ${user.plays}
⭐ Score: ${user.points}

🎰 আবার খেলতে: !slots`
    );
  }
};
