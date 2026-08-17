"use strict";

const path = require("path");
const fs = require("fs-extra");
const api = require("./lib/sifu-api");

const VALID_QUALITIES = ["240", "360", "480", "720", "1080"];
const DEFAULT_QUALITY = "480";
const FALLBACK_LADDER = ["720", "480", "360", "240"];

const BRAND = "꧁༺ 𝑺𝑯𝑰'𝑺𝑯𝑰𝑹 ༻꧂";

module.exports = {
    config: {
        name: "singvdo",
        aliases: ["mp4", "video", "vdo"],
        version: "5.0.0",
        author: "SHiSHIR",
        category: "media",
        role: 0,
        countDown: 8,

        description: {
            en: "Search & download MP4 video with smart quality fallback."
        },

        guide: {
            en:
                "{pn} [query|URL]\n" +
                "{pn} <query> -q 240|360|480|720|1080\n" +
                "{pn} <query> -list\n" +
                "{pn} pick <n>"
        },
    },

    onStart: async function ({ args, event, message, api: botApi }) {
        const ctx = {
            reply: message.reply.bind(message),
            event,
            api: botApi,
        };

        return module.exports._run({
            args: args || [],
            ctx
        });
    },

    _run: async function ({ args, ctx }) {
        const event = ctx.event || {};

        const parsed = api.parseArgs(
            args,
            VALID_QUALITIES,
            DEFAULT_QUALITY
        );

        if (parsed.mode === "help") {
            return api.safeReply(
                ctx,
                [
                    `╭━━━〔 ${BRAND} 〕━━━╮`,
                    "┃ 🎬 𝑺𝑰𝑵𝑮𝑽𝑫𝑶 𝑯𝑬𝑳𝑷",
                    "┣━━━━━━━━━━━━━━━━━━",
                    "┃",
                    "┃ 🎥 singvdo <video name>",
                    "┃ 🔗 singvdo <YouTube URL>",
                    "┃ 📺 singvdo <query> -q 720",
                    "┃ 📋 singvdo <query> -list",
                    "┃ 🔢 singvdo pick <number>",
                    "┃ ❔ singvdo -h",
                    "┃",
                    "┣━━━━━━━━━━━━━━━━━━",
                    "┃ ⚡ Smart Quality Fallback",
                    "┃ 🚀 Fast Cache System",
                    "┃ 🎧 Audio Included",
                    "┃",
                    `┃ 👑 𝑪𝒓𝒆𝒂𝒕𝒆𝒅 𝒃𝒚: 𝑺𝑯𝑰'𝑺𝑯𝑰𝑹`,
                    "╰━━━━━━━━━━━━━━━━━━╯"
                ].join("\n")
            );
        }

        let progressId = null;

        const sendProgress = async (text) => {
            try {
                const m = await api.safeReply(ctx, text);

                if (m?.messageID) {
                    progressId = m.messageID;
                }
            } catch (_) {}
        };

        const delProgress = () => {
            if (progressId) {
                try {
                    ctx.api?.unsendMessage(progressId);
                } catch (_) {}

                progressId = null;
            }
        };

        const react = (emoji) => {
            try {
                if (ctx.api && event.messageID) {
                    ctx.api.setMessageReaction(
                        emoji,
                        event.messageID,
                        () => {},
                        true
                    );
                }
            } catch (_) {}
        };

        try {
            await api.pruneCache();

            let videoUrl;
            let videoTitle;
            let videoUploader;
            let videoDuration;

            /* =========================
               SEARCH LIST
            ========================= */

            if (parsed.mode === "list") {

                if (!parsed.query) {
                    return api.safeReply(
                        ctx,
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ ⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒑𝒓𝒐𝒗𝒊𝒅𝒆 𝒂 𝒔𝒆𝒂𝒓𝒄𝒉 𝒒𝒖𝒆𝒓𝒚.",
                            "┃",
                            "┃ Example:",
                            "┃ singvdo attack on titan -list",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );
                }

                react("🔍");

                await sendProgress(
                    [
                        `╭━━━〔 ${BRAND} 〕━━━╮`,
                        "┃ 🔍 𝑺𝒆𝒂𝒓𝒄𝒉𝒊𝒏𝒈 𝑽𝒊𝒅𝒆𝒐𝒔...",
                        "┃",
                        `┃ 🔎 ${parsed.query}`,
                        "┃",
                        "┃ ⏳ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒘𝒂𝒊𝒕...",
                        "╰━━━━━━━━━━━━━━━━━━╯"
                    ].join("\n")
                );

                const imgPath = path.join(
                    api.config.CACHE_DIR,
                    `singvdo_list_${Date.now()}.png`
                );

                const imgResult = await api.downloadSearchImage(
                    "/api/video/search-image",
                    {
                        q: parsed.query,
                        limit: 6,
                        cmd: "singvdo pick <1-6>"
                    },
                    imgPath
                );

                delProgress();

                if (!imgResult.results?.length) {
                    react("❌");

                    return api.safeReply(
                        ctx,
                        `❌ 𝑵𝒐 𝒓𝒆𝒔𝒖𝒍𝒕𝒔 𝒇𝒐𝒖𝒏𝒅 𝒇𝒐𝒓 "${parsed.query}".`
                    );
                }

                api.rememberSearch(
                    "singvdo",
                    ctx,
                    imgResult.results,
                    "video"
                );

                react("✅");

                await api.safeReply(ctx, {
                    attachment: fs.createReadStream(imgResult.path)
                });

                setTimeout(() => {
                    fs.unlink(imgResult.path).catch(() => {});
                }, 12000);

                return;
            }

            /* =========================
               PICK VIDEO
            ========================= */

            if (parsed.mode === "pick") {

                const recalled = api.recallSearch(
                    "singvdo",
                    ctx
                );

                if (!recalled || recalled.kind !== "video") {
                    return api.safeReply(
                        ctx,
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ ❌ 𝑵𝒐 𝒂𝒄𝒕𝒊𝒗𝒆 𝒍𝒊𝒔𝒕 𝒇𝒐𝒖𝒏𝒅.",
                            "┃",
                            "┃ First use:",
                            "┃ singvdo <query> -list",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );
                }

                const idx = parsed.pickIndex - 1;

                if (
                    idx < 0 ||
                    idx >= recalled.results.length
                ) {
                    return api.safeReply(
                        ctx,
                        `❌ 𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝒏𝒖𝒎𝒃𝒆𝒓. 𝑪𝒉𝒐𝒐𝒔𝒆 1–${recalled.results.length}.`
                    );
                }

                const pick = recalled.results[idx];

                videoUrl = api.normalizeYouTubeUrl(
                    pick.url
                );

                videoTitle = pick.title;
                videoUploader = pick.uploader;
                videoDuration = pick.duration;

                api.clearPicker(
                    "singvdo",
                    ctx
                );

                react("📥");

                await sendProgress(
                    [
                        `╭━━━〔 ${BRAND} 〕━━━╮`,
                        "┃ 📥 𝑷𝒓𝒆𝒑𝒂𝒓𝒊𝒏𝒈 𝑽𝒊𝒅𝒆𝒐...",
                        "┃",
                        `┃ 🎬 ${videoTitle}`,
                        `┃ 👤 ${videoUploader || "Unknown"}`,
                        `┃ 📺 Quality: ${parsed.quality}p`,
                        "┃",
                        "┃ ⏳ Please wait...",
                        "╰━━━━━━━━━━━━━━━━━━╯"
                    ].join("\n")
                );

            } else {

                /* =========================
                   NORMAL SEARCH / URL
                ========================= */

                if (!parsed.query) {
                    return api.safeReply(
                        ctx,
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ ⚠️ 𝑷𝒓𝒐𝒗𝒊𝒅𝒆 𝒂 𝒗𝒊𝒅𝒆𝒐 𝒏𝒂𝒎𝒆",
                            "┃    𝒐𝒓 YouTube URL.",
                            "┃",
                            "┃ Examples:",
                            "┃",
                            "┃ • singvdo despacito -q 480",
                            "┃ • singvdo https://youtu.be/XXXXX",
                            "┃ • singvdo naruto opening -list",
                            "┃ • singvdo -h",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );
                }

                if (api.isYouTubeUrl(parsed.query)) {

                    videoUrl = api.normalizeYouTubeUrl(
                        parsed.query
                    );

                    react("📥");

                    await sendProgress(
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ 📥 𝑭𝒆𝒕𝒄𝒉𝒊𝒏𝒈 𝑽𝒊𝒅𝒆𝒐...",
                            "┃",
                            `┃ 📺 Quality: ${parsed.quality}p`,
                            "┃",
                            "┃ ⏳ Please wait...",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );

                } else {

                    react("🔍");

                    await sendProgress(
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ 🔍 𝑺𝒆𝒂𝒓𝒄𝒉𝒊𝒏𝒈 𝑽𝒊𝒅𝒆𝒐...",
                            "┃",
                            `┃ 🔎 ${parsed.query}`,
                            "┃",
                            "┃ ⏳ Please wait...",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );

                    const results = await api.searchVideos(
                        parsed.query,
                        1
                    );

                    if (!results.length) {

                        delProgress();
                        react("❌");

                        return api.safeReply(
                            ctx,
                            `❌ 𝑵𝒐 𝒓𝒆𝒔𝒖𝒍𝒕𝒔 𝒇𝒐𝒖𝒏𝒅 𝒇𝒐𝒓 "${parsed.query}".`
                        );
                    }

                    const top = results[0];

                    videoUrl = api.normalizeYouTubeUrl(
                        top.url
                    );

                    videoTitle = top.title;
                    videoUploader = top.uploader;
                    videoDuration = top.duration;

                    delProgress();

                    react("📥");

                    await sendProgress(
                        [
                            `╭━━━〔 ${BRAND} 〕━━━╮`,
                            "┃ 📥 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅𝒊𝒏𝒈...",
                            "┃",
                            `┃ 🎬 ${videoTitle}`,
                            `┃ 👤 ${videoUploader || "Unknown"}`,
                            `┃ 📺 Quality: ${parsed.quality}p`,
                            "┃",
                            "┃ ⏳ Please wait...",
                            "╰━━━━━━━━━━━━━━━━━━╯"
                        ].join("\n")
                    );
                }
            }

            /* =========================
               QUALITY FALLBACK
            ========================= */

            const reqIdx =
                VALID_QUALITIES.indexOf(
                    parsed.quality
                );

            const ladder = [
                parsed.quality,
                ...FALLBACK_LADDER.filter(q => {
                    const i =
                        VALID_QUALITIES.indexOf(q);

                    return i !== -1 && i < reqIdx;
                })
            ];

            const videoId =
                api.extractVideoId(videoUrl);

            let finalResult = null;
            let finalHeaders = {};
            let finalElapsed = 0;

            let finalQuality = parsed.quality;
            let wasCached = false;

            for (
                let i = 0;
                i < ladder.length;
                i++
            ) {

                const tryQ = ladder[i];

                let result =
                    videoId
                        ? await api.cacheLookup(
                            videoId,
                            tryQ,
                            "mp4"
                        )
                        : null;

                const cached = !!result;

                if (!result) {

                    const targetPath =
                        videoId
                            ? api.cacheFilenameFor(
                                videoId,
                                tryQ,
                                "mp4"
                            )
                            : path.join(
                                api.config.CACHE_DIR,
                                `tmp_${Date.now()}.mp4`
                            );

                    try {

                        const dl =
                            await api.downloadToDisk(
                                "/api/music/video",
                                {
                                    url: videoUrl,
                                    quality: tryQ
                                },
                                targetPath
                            );

                        result = {
                            path: dl.path,
                            size: dl.size
                        };

                        finalHeaders =
                            dl.headers || {};

                        finalElapsed =
                            dl.elapsedMs;

                        if (
                            finalHeaders["x-track-title"]
                        ) {
                            videoTitle =
                                finalHeaders[
                                    "x-track-title"
                                ];
                        }

                    } catch (err) {

                        console.error(
                            `[singvdo] ${tryQ}p failed:`,
                            err.message
                        );

                        if (
                            i === ladder.length - 1
                        ) {
                            throw err;
                        }

                        continue;
                    }
                }

                if (result.size < 1024) {

                    await fs
                        .unlink(result.path)
                        .catch(() => {});

                    if (
                        i === ladder.length - 1
                    ) {

                        delProgress();
                        react("❌");

                        return api.safeReply(
                            ctx,
                            "❌ 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝒇𝒂𝒊𝒍𝒆𝒅 — 𝒆𝒎𝒑𝒕𝒚 𝒇𝒊𝒍𝒆."
                        );
                    }

                    continue;
                }

                const sizeMB =
                    result.size /
                    (1024 * 1024);

                if (
                    sizeMB <=
                    api.config.MAX_FILE_MB
                ) {

                    finalResult = result;
                    finalQuality = tryQ;
                    wasCached = cached;

                    break;
                }

                if (
                    i < ladder.length - 1
                ) {

                    delProgress();

                    await sendProgress(
                        [
                            `⚠️ ${tryQ}p = ${sizeMB.toFixed(1)} MB`,
                            "┃ 📦 File too large",
                            `🔄 Trying ${ladder[i + 1]}p...`,
                            "⏳ Please wait..."
                        ].join("\n")
                    );
                }
            }

            delProgress();

            /* =========================
               FINAL ERROR
            ========================= */

            if (!finalResult) {

                react("❌");

                return api.safeReply(
                    ctx,
                    [
                        `╭━━━〔 ${BRAND} 〕━━━╮`,
                        "┃ ❌ 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑭𝒂𝒊𝒍𝒆𝒅",
                        "┃",
                        `┃ All qualities exceeded`,
                        `┃ Messenger limit`,
                        `┃ (${api.config.MAX_FILE_MB} MB).`,
                        "┃",
                        "┃ 💡 Try a shorter video.",
                        "╰━━━━━━━━━━━━━━━━━━╯"
                    ].join("\n")
                );
            }

            /* =========================
               SUCCESS
            ========================= */

            const fellBack =
                finalQuality !== parsed.quality;

            const cacheInfo =
                wasCached
                    ? "𝑪𝒂𝒄𝒉𝒆 𝑯𝒊
