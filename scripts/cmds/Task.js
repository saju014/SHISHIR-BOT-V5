"use strict";

const { createCanvas, loadImage } = require("canvas");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ============================================================
// DAILY MISSIONS
// ============================================================

const MISSIONS = [
  {
    id: 1,
    label: "Chat 1 Message",
    desc: "Send 1 message in group",
    reward: "20K",
    rewardVal: 20000,
    target: 1,
    type: "chat"
  },

  {
    id: 2,
    label: "Chat 100 Messages",
    desc: "Send 100 messages in group",
    reward: "200K",
    rewardVal: 200000,
    target: 100,
    type: "chat"
  },

  {
    id: 3,
    label: "Guess Play",
    desc: "Play Guess 20 times",
    reward: "1M",
    rewardVal: 1000000,
    target: 20,
    type: "cmd",
    cmds: ["guess"]
  },

  {
    id: 4,
    label: "Mine Play",
    desc: "Play Mine 20 times",
    reward: "1M",
    rewardVal: 1000000,
    target: 20,
    type: "cmd",
    cmds: ["mine", "mines"]
  },

  {
    id: 5,
    label: "Waifu Play",
    desc: "Play Waifu 25 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 25,
    type: "cmd",
    cmds: ["waifu"]
  },

  {
    id: 6,
    label: "Quiz Play",
    desc: "Play Quiz 25 times",
    reward: "3M",
    rewardVal: 3000000,
    target: 25,
    type: "cmd",
    cmds: ["quiz"]
  },

  {
    id: 7,
    label: "Aniqz Play",
    desc: "Play Aniqz 25 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 25,
    type: "cmd",
    cmds: ["aniqz"]
  },

  {
    id: 8,
    label: "Free Fire Play",
    desc: "Play Free Fire 10 times",
    reward: "1M",
    rewardVal: 1000000,
    target: 10,
    type: "cmd",
    cmds: ["ffqz", "freefire", "freefireqz", "ff"]
  },

  {
    id: 9,
    label: "Slot Play",
    desc: "Play Slot 25 times",
    reward: "1M",
    rewardVal: 1000000,
    target: 25,
    type: "cmd",
    cmds: ["slot"]
  },

  {
    id: 10,
    label: "Actor Play",
    desc: "Play Actor 10 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 10,
    type: "cmd",
    cmds: ["actor", "actorqz"]
  },

  {
    id: 11,
    label: "Flag Game",
    desc: "Play Flag Game 25 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 25,
    type: "cmd",
    cmds: ["flag", "flaggame"]
  },

  {
    id: 12,
    label: "Dice Play",
    desc: "Play Dice 25 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 25,
    type: "cmd",
    cmds: ["dice"]
  },

  {
    id: 13,
    label: "Cartoon Play",
    desc: "Play Cartoon 25 times",
    reward: "2M",
    rewardVal: 2000000,
    target: 25,
    type: "cmd",
    cmds: ["cartoon", "carton"]
  },

  // Completionist
  {
    id: 14,
    label: "Completionist",
    desc: "Claim all 13 daily missions",
    reward: "5M",
    rewardVal: 5000000,
    target: 13,
    type: "meta"
  }
];

const NORMAL_MISSION_COUNT = 13;

// ============================================================
// MONGODB
// ============================================================

const missionSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      index: true
    },

    dateKey: {
      type: String,
      required: true,
      index: true
    },

    missionId: {
      type: Number,
      required: true
    },

    progress: {
      type: Number,
      default: 0
    },

    claimed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

missionSchema.index(
  {
    uid: 1,
    dateKey: 1,
    missionId: 1
  },
  {
    unique: true
  }
);

const Mission =
  mongoose.models.DailyMission ||
  mongoose.model("DailyMission", missionSchema);

// ============================================================
// MONGODB CONNECTION CHECK
// ============================================================

async function ensureMongo() {
  try {
    // Existing GoatBot MongoDB connection
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    // If bot is already connecting, wait for it
    if (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 10000);

        mongoose.connection.once("connected", () => {
          clearTimeout(timer);
          resolve();
        });
      });

      return mongoose.connection.readyState === 1;
    }

    // Fallback: connect from environment variable
    const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL;

    if (!mongoURI) {
      console.error(
        "[DAILY TASK] MongoDB URI not found. Set MONGO_URI in environment variables."
      );
      return false;
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("[DAILY TASK] MongoDB connected.");

    return true;
  } catch (err) {
    console.error("[DAILY TASK] MongoDB connection error:", err.message);
    return false;
  }
}

// ============================================================
// DATE
// ============================================================

function todayKey() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka"
  });
}

// ============================================================
// DATABASE HELPERS
// ============================================================

async function bump(uid, missionId, inc = 1) {
  try {
    const connected = await ensureMongo();

    if (!connected) return;

    await Mission.findOneAndUpdate(
      {
        uid: String(uid),
        dateKey: todayKey(),
        missionId
      },
      {
        $inc: {
          progress: inc
        }
      },
      {
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  } catch (err) {
    console.error(
      `[DAILY TASK] Failed to update mission ${missionId}:`,
      err.message
    );
  }
}

async function setProgress(uid, missionId, value) {
  try {
    const connected = await ensureMongo();

    if (!connected) return;

    await Mission.findOneAndUpdate(
      {
        uid: String(uid),
        dateKey: todayKey(),
        missionId
      },
      {
        $set: {
          progress: value
        }
      },
      {
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  } catch (err) {
    console.error(
      `[DAILY TASK] Failed to set progress ${missionId}:`,
      err.message
    );
  }
}

async function getProgressMap(uid) {
  try {
    const connected = await ensureMongo();

    if (!connected) return {};

    const docs = await Mission.find({
      uid: String(uid),
      dateKey: todayKey()
    });

    const map = {};

    for (const d of docs) {
      map[d.missionId] = {
        progress: d.progress || 0,
        claimed: d.claimed === true
      };
    }

    return map;
  } catch (err) {
    console.error(
      "[DAILY TASK] Failed to get progress:",
      err.message
    );

    return {};
  }
}

// ============================================================
// UPDATE COMPLETIONIST
// ============================================================

async function updateCompletionist(uid) {
  try {
    const connected = await ensureMongo();

    if (!connected) return;

    const claimedCount = await Mission.countDocuments({
      uid: String(uid),
      dateKey: todayKey(),
      missionId: {
        $lte: NORMAL_MISSION_COUNT
      },
      claimed: true
    });

    await setProgress(
      uid,
      14,
      Math.min(claimedCount, NORMAL_MISSION_COUNT)
    );
  } catch (err) {
    console.error(
      "[DAILY TASK] Completionist update error:",
      err.message
    );
  }
}

// ============================================================
// CLAIM MISSION
// ============================================================

async function claimMission(uid, missionId, usersData) {
  try {
    const connected = await ensureMongo();

    if (!connected) {
      return {
        ok: false,
        reason: "MongoDB is not connected."
      };
    }

    const def = MISSIONS.find(
      (m) => m.id === missionId
    );

    if (!def) {
      return {
        ok: false,
        reason: "Mission not found."
      };
    }

    // Completionist
    if (missionId === 14) {
      await updateCompletionist(uid);

      const completionDoc = await Mission.findOne({
        uid: String(uid),
        dateKey: todayKey(),
        missionId: 14
      });

      if (
        !completionDoc ||
        completionDoc.progress < NORMAL_MISSION_COUNT
      ) {
        return {
          ok: false,
          reason: `Complete and claim all ${NORMAL_MISSION_COUNT} missions first.`
        };
      }
    }

    // Atomic claim prevents double reward
    const claimedDoc = await Mission.findOneAndUpdate(
      {
        uid: String(uid),
        dateKey: todayKey(),
        missionId,
        progress: {
          $gte: def.target
        },
        claimed: false
      },
      {
        $set: {
          claimed: true
        }
      },
      {
        new: true
      }
    );

    if (!claimedDoc) {
      const current = await Mission.findOne({
        uid: String(uid),
        dateKey: todayKey(),
        missionId
      });

      if (!current) {
        return {
          ok: false,
          reason: "Mission has not started yet."
        };
      }

      if (current.claimed) {
        return {
          ok: false,
          reason: "Already claimed."
        };
      }

      return {
        ok: false,
        reason: `Not completed yet (${current.progress}/${def.target}).`
      };
    }

    // Add reward
    try {
      const userData =
        (await usersData.get(uid)) || {};

      const currentMoney =
        Number(userData.money) || 0;

      await usersData.set(uid, {
        money: currentMoney + def.rewardVal
      });
    } catch (moneyErr) {
      // Revert claim if money update failed
      await Mission.updateOne(
        {
          _id: claimedDoc._id
        },
        {
          $set: {
            claimed: false
          }
        }
      );

      console.error(
        "[DAILY TASK] Reward error:",
        moneyErr.message
      );

      return {
        ok: false,
        reason: "Failed to add reward."
      };
    }

    // Update completionist after normal mission claim
    if (missionId <= NORMAL_MISSION_COUNT) {
      await updateCompletionist(uid);
    }

    return {
      ok: true,
      reward: def.rewardVal,
      mission: def
    };
  } catch (err) {
    console.error(
      "[DAILY TASK] Claim error:",
      err.message
    );

    return {
      ok: false,
      reason: "Database error."
    };
  }
}

// ============================================================
// CANVAS COLORS
// BLACK + BLUE + ORANGE THEME
// ============================================================

const BG = "#060a12";
const BG2 = "#0b1220";

const CARD_FILL =
  "rgba(15,30,48,0.72)";

const CARD_BRDR =
  "rgba(56,189,248,0.18)";

const WHITE = "#f8fafc";
const GRAY = "#94a3b8";

const BLUE = "#38bdf8";
const BLUE2 = "#2563eb";

const ORANGE = "#f97316";

const GREEN = "#34d399";
const RED = "#fb7185";

const TRACK =
  "rgba(148,163,184,0.16)";

// ============================================================
// CANVAS HELPERS
// ============================================================

function setGlow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function clearGlow(ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

function roundedRect(
  ctx,
  x,
  y,
  w,
  h,
  r
) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.lineTo(
    x + w - r,
    y
  );

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + r,
    r
  );

  ctx.lineTo(
    x + w,
    y + h - r
  );

  ctx.arcTo(
    x + w,
    y + h,
    x + w - r,
    y + h,
    r
  );

  ctx.lineTo(
    x + r,
    y + h
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y + h - r,
    r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.arcTo(
    x,
    y,
    x + r,
    y,
    r
  );

  ctx.closePath();
}

function truncate(
  ctx,
  text,
  maxWidth
) {
  text = String(text || "");

  if (
    ctx.measureText(text).width <=
    maxWidth
  ) {
    return text;
  }

  let t = text;

  while (
    t.length > 1 &&
    ctx.measureText(
      t + "…"
    ).width > maxWidth
  ) {
    t = t.slice(0, -1);
  }

  return t + "…";
}

// ============================================================
// AVATAR
// ============================================================

async function fetchAvatarImg(url) {
  try {
    const res = await axios.get(
      url,
      {
        responseType: "arraybuffer",
        timeout: 8000
      }
    );

    return await loadImage(
      Buffer.from(res.data)
    );
  } catch (_) {
    return null;
  }
}

// ============================================================
// DRAW AVATAR
// ============================================================

function drawAvatar(
  ctx,
  img,
  name,
  cx,
  cy,
  r
) {
  ctx.save();

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctx.clip();

  if (img) {
    ctx.drawImage(
      img,
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );
  } else {
    ctx.fillStyle = "#172033";

    ctx.fillRect(
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );

    ctx.fillStyle = WHITE;

    ctx.font =
      `bold ${Math.floor(r)}px sans-serif`;

    ctx.textAlign = "center";

    ctx.fillText(
      (name || "?")
        .trim()
        .charAt(0)
        .toUpperCase(),
      cx,
      cy + r * 0.35
    );
  }

  ctx.restore();

  ctx.save();

  setGlow(
    ctx,
    BLUE,
    25
  );

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r + 4,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = BLUE;

  ctx.lineWidth = 3;

  ctx.stroke();

  clearGlow(ctx);

  ctx.restore();
}

// ============================================================
// DRAW DIAMOND
// ============================================================

function drawDiamond(
  ctx,
  cx,
  cy,
  size,
  color
) {
  ctx.save();

  ctx.translate(
    cx,
    cy
  );

  ctx.rotate(
    Math.PI / 4
  );

  roundedRect(
    ctx,
    -size / 2,
    -size / 2,
    size,
    size,
    2
  );

  ctx.fillStyle = color;

  ctx.fill();

  ctx.restore();
}

// ============================================================
// BUILD CARD
// ============================================================

async function buildCard({
  name,
  avatarImg,
  completedCount,
  progressMap
}) {
  const W = 1080;

  const PAD = 48;

  const PROFILE_Y = 40;

  const PROFILE_H = 170;

  const SECTION_TITLE_Y =
    PROFILE_Y +
    PROFILE_H +
    60;

  const GRID_Y0 =
    SECTION_TITLE_Y +
    45;

  const COL_GAP = 40;

  const COL_W =
    (W - PAD * 2 - COL_GAP) /
    2;

  const CARD_H = 132;

  const ROW_GAP = 28;

  const rows =
    Math.ceil(
      MISSIONS.length / 2
    );

  const GRID_H =
    rows * CARD_H +
    (rows - 1) * ROW_GAP;

  const GRID_Y_END =
    GRID_Y0 + GRID_H;

  const FOOT_SEP_Y =
    GRID_Y_END + 34;

  const FOOT_TXT_Y =
    FOOT_SEP_Y + 30;

  const H =
    FOOT_TXT_Y + 26;

  const canvas =
    createCanvas(W, H);

  const ctx =
    canvas.getContext("2d");

  // Background
  const bg =
    ctx.createLinearGradient(
      0,
      0,
      W,
      H
    );

  bg.addColorStop(
    0,
    BG
  );

  bg.addColorStop(
    1,
    BG2
  );

  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  // Decorative glow
  ctx.save();

  const glow =
    ctx.createRadialGradient(
      W * 0.8,
      100,
      20,
      W * 0.8,
      100,
      500
    );

  glow.addColorStop(
    0,
    "rgba(37,99,235,0.18)"
  );

  glow.addColorStop(
    1,
    "rgba(37,99,235,0)"
  );

  ctx.fillStyle = glow;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  ctx.restore();

  // ==========================================================
  // PROFILE
  // ==========================================================

  ctx.save();

  roundedRect(
    ctx,
    PAD,
    PROFILE_Y,
    W - PAD * 2,
    PROFILE_H,
    18
  );

  ctx.fillStyle =
    CARD_FILL;

  ctx.fill();

  ctx.strokeStyle =
    CARD_BRDR;

  ctx.lineWidth = 1;

  ctx.stroke();

  ctx.restore();

  const avR = 68;

  const avCX =
    PAD +
    40 +
    avR;

  const avCY =
    PROFILE_Y +
    PROFILE_H / 2;

  drawAvatar(
    ctx,
    avatarImg,
    name,
    avCX,
    avCY,
    avR
  );

  // Name
  ctx.save();

  ctx.fillStyle =
    WHITE;

  ctx.font =
    "bold 36px sans-serif";

  ctx.textAlign =
    "left";

  ctx.fillText(
    truncate(
      ctx,
      name,
      W -
        avCX -
        avR -
        140
    ),
    avCX +
      avR +
      30,
    avCY - 8
  );

  ctx.restore();

  // Completed
  ctx.save();

  ctx.fillStyle =
    BLUE;

  ctx.font =
    "bold 20px sans-serif";

  ctx.textAlign =
    "left";

  ctx.fillText(
    `Missions Completed: ${completedCount}/${NORMAL_MISSION_COUNT}`,
    avCX +
      avR +
      30,
    avCY + 26
  );

  ctx.restore();

  // ==========================================================
  // TITLE
  // ==========================================================

  ctx.save();

  ctx.fillStyle =
    WHITE;

  ctx.font =
    "bold 26px sans-serif";

  ctx.textAlign =
    "left";

  ctx.fillText(
    "⚡ DAILY TASK LIST",
    PAD,
    SECTION_TITLE_Y
  );

  ctx.restore();

  // Blue line
  ctx.save();

  roundedRect(
    ctx,
    PAD,
    SECTION_TITLE_Y + 14,
    110,
    4,
    2
  );

  ctx.fillStyle =
    BLUE;

  ctx.fill();

  ctx.restore();

  // ==========================================================
  // MISSION CARDS
  // ==========================================================

  MISSIONS.forEach(
    (m, i) => {
      const col =
        i % 2;

      const row =
        Math.floor(i / 2);

      const x =
        PAD +
        col *
          (COL_W + COL_GAP);

      const y =
        GRID_Y0 +
        row *
          (CARD_H + ROW_GAP);

      const prog =
        progressMap[m.id] ||
        {
          progress: 0,
          claimed: false
        };

      const cur =
        Math.min(
          prog.progress || 0,
          m.target
        );

      const ratio =
        m.target
          ? cur / m.target
          : 0;

      const complete =
        cur >= m.target;

      // Card
      ctx.save();

      roundedRect(
        ctx,
        x,
        y,
        COL_W,
        CARD_H,
        14
      );

      ctx.fillStyle =
        CARD_FILL;

      ctx.fill();

      ctx.strokeStyle =
        complete
          ? "rgba(52,211,153,0.35)"
          : CARD_BRDR;

      ctx.lineWidth = 1;

      ctx.stroke();

      ctx.restore();

      // Mission title
      ctx.save();

      ctx.fillStyle =
        WHITE;

      ctx.font =
        "bold 20px sans-serif";

      ctx.textAlign =
        "left";

      ctx.fillText(
        truncate(
          ctx,
          `${m.id}. ${m.label}`,
          COL_W - 150
        ),
        x + 26,
        y + 38
      );

      ctx.restore();

      // Reward diamond
      drawDiamond(
        ctx,
        x + COL_W - 92,
        y + 32,
        12,
        ORANGE
      );

      ctx.save();

      ctx.fillStyle =
        "#fdba74";

      ctx.font =
        "bold 17px sans-serif";

      ctx.textAlign =
        "left";

      ctx.fillText(
        m.reward,
        x + COL_W - 78,
        y + 38
      );

      ctx.restore();

      // Description
      ctx.save();

      ctx.fillStyle =
        GRAY;

      ctx.font =
        "15px sans-serif";

      ctx.textAlign =
        "left";

      ctx.fillText(
        truncate(
          ctx,
          m.desc,
          COL_W - 52
        ),
        x + 26,
        y + 64
      );

      ctx.restore();

      // Progress bar
      const barX =
        x + 26;

      const barY =
        y + CARD_H - 26;

      const barW =
        COL_W - 52;

      const barH = 6;

      roundedRect(
        ctx,
        barX,
        barY,
        barW,
        barH,
        barH / 2
      );

      ctx.fillStyle =
        TRACK;

      ctx.fill();

      if (complete) {
        roundedRect(
          ctx,
          barX,
          barY,
          barW,
          barH,
          barH / 2
        );

        ctx.fillStyle =
          GREEN;

        ctx.fill();

        ctx.save();

        ctx.fillStyle =
          GREEN;

        ctx.font =
          "bold 13px sans-serif";

        ctx.textAlign =
          "right";

        ctx.fillText(
          prog.claimed
            ? "✓ CLAIMED"
            : "✓ COMPLETE",
          x + COL_W - 26,
          barY - 8
        );

        ctx.restore();
      } else {
        if (ratio > 0) {
          const fillW =
            Math.max(
              ratio * barW,
              barH
            );

          roundedRect(
            ctx,
            barX,
            barY,
            fillW,
            barH,
            barH / 2
          );

          ctx.fillStyle =
            BLUE;

          ctx.fill();

          ctx.save();

          setGlow(
            ctx,
            BLUE,
            8
          );

          ctx.beginPath();

          ctx.arc(
            barX + fillW,
            barY + barH / 2,
            5,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            BLUE;

          ctx.fill();

          clearGlow(ctx);

          ctx.restore();
        }

        ctx.save();

        ctx.fillStyle =
          ORANGE;

        ctx.font =
          "bold 13px sans-serif";

        ctx.textAlign =
          "right";

        ctx.fillText(
          `${cur}/${m.target}`,
          x + COL_W - 26,
          barY - 8
        );

        ctx.restore();
      }
    }
  );

  // ==========================================================
  // FOOTER
  // ==========================================================

  ctx.save();

  ctx.strokeStyle =
    "rgba(56,189,248,0.15)";

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(
    PAD,
    FOOT_SEP_Y
  );

  ctx.lineTo(
    W - PAD,
    FOOT_SEP_Y
  );

  ctx.stroke();

  ctx.restore();

  const now =
    new Date().toLocaleString(
      "en-GB",
      {
        timeZone:
          "Asia/Dhaka",
        hour12: false
      }
    );

  ctx.save();

  ctx.fillStyle =
    "rgba(148,163,184,0.8)";

  ctx.font =
    "12px monospace";

  ctx.textAlign =
    "left";

  ctx.fillText(
    "⟡ Ariyan ai • Daily Reset",
    PAD,
    FOOT_TXT_Y
  );

  ctx.textAlign =
    "right";

  ctx.fillText(
    `⏲ ${now} (BD)`,
    W - PAD,
    FOOT_TXT_Y
  );

  ctx.restore();

  return canvas;
}

// ============================================================
// MODULE
// ============================================================

module.exports = {

  config: {
    name: "task",
    aliases: [
      "dailytask",
      "missions",
      "dt"
    ],

    version: "2.0.0",

    author: "Ariyan ai",

    countDown: 5,

    role: 0,

    description: {
      en: "Daily mission tracker with claimable rewards"
    },

    category: "economy",

    guide: {
      en:
        "{pn} - show today's missions\n" +
        "{pn} claim <number> - claim reward"
    }
  },

  // ==========================================================
  // COMMAND
  // ==========================================================

  onStart: async function ({
    event,
    args,
    message,
    usersData
  }) {

    const uid =
      String(event.senderID);

    // Make sure Mongo is ready
    await ensureMongo();

    // ========================================================
    // CLAIM
    // ========================================================

    if (
      args[0] &&
      args[0].toLowerCase() ===
        "claim"
    ) {

      const id =
        parseInt(args[1]);

      if (
        !id ||
        id < 1 ||
        id > 14
      ) {
        return message.reply(
          "⚠️ Usage: task claim <number>\n\nExample: task claim 5"
        );
      }

      const result =
        await claimMission(
          uid,
          id,
          usersData
        );

      if (!result.ok) {
        return message.reply(
          `❌ Mission ${id}\n\n${result.reason}`
        );
      }

      return message.reply(
        `🎉 Mission ${id} completed!\n\n` +
        `💰 Reward: +${result.reward.toLocaleString()}\n\n` +
        `✅ Money added to your balance!`
      );
    }

    // ========================================================
    // NORMAL TASK VIEW
    // ========================================================

    let name =
      "User";

    let avatarUrl =
      null;

    try {
      name =
        (await usersData.getName(uid)) ||
        name;
    } catch (_) {}

    try {
      avatarUrl =
        await usersData.getAvatarUrl(uid);
    } catch (_) {}

    const avatarImg =
      avatarUrl
        ? await fetchAvatarImg(
            avatarUrl
          )
        : null;

    const progressMap =
      await getProgressMap(uid);

    const completedCount =
      MISSIONS
        .filter(
          (m) =>
            m.id <= NORMAL_MISSION_COUNT &&
            progressMap[m.id] &&
            progressMap[m.id].progress >=
              m.target
        )
        .length;

    const canvas =
      await buildCard({
        name,
        avatarImg,
        completedCount,
        progressMap
      });

    // ========================================================
    // SAVE IMAGE
    // ========================================================

    const cacheDir =
      path.join(
        __dirname,
        "cache"
      );

    await fs.ensureDir(
      cacheDir
    );

    const imgPath =
      path.join(
        cacheDir,
        `task_${uid}_${Date.now()}.png`
      );

    await fs.writeFile(
      imgPath,
      canvas.toBuffer(
        "image/png"
      )
    );

    // ========================================================
    // SEND
    // ========================================================

    return message.reply(
      {
        attachment:
          fs.createReadStream(
            imgPath
          )
      },
      () =>
        fs
          .remove(imgPath)
          .catch(() => {})
    );
  },

  // ==========================================================
  // TRACK CHAT + COMMAND MISSIONS
  // ==========================================================

  onChat: async function ({
    event
  }) {

    if (
      !event.senderID ||
      !event.body ||
      !event.isGroup
    ) {
      return;
    }

    const uid =
      String(event.senderID);

    // --------------------------------------------------------
    // CHAT MISSIONS
    // --------------------------------------------------------

    await bump(
      uid,
      1,
      1
    );

    await bump(
      uid,
      2,
      1
    );

    // --------------------------------------------------------
    // COMMAND MISSIONS
    // --------------------------------------------------------

    const text =
      String(event.body)
        .trim()
        .toLowerCase();

    for (
      const mission of MISSIONS
    ) {

      if (
        mission.type !==
        "cmd"
      ) {
        continue;
      }

      if (
        !Array.isArray(
          mission.cmds
        )
      ) {
        continue;
      }

      let matched =
        false;

      for (
        const cmd of mission.cmds
      ) {

        const escaped =
          cmd.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        const regex =
          new RegExp(
            `^(?:\\W|\\.)?${escaped}(?:\\s|$)`,
            "i"
          );

        if (
          regex.test(text)
        ) {
          matched = true;
          break;
        }
      }

      if (matched) {
        await bump(
          uid,
          mission.id,
          1
        );

        break;
      }
    }
  }
};
