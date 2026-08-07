const fs = require("fs");
const axios = require("axios");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.shishir;
};

module.exports = {
        config: {
                name: "sister",
                aliases: ["sis", "বোন"],
                version: "1.7",
                author: "shishir",
                countDown: 5,
                role: 0,
                description: {
                        bn: "বোন-ভাইয়ের মিষ্টি সম্পর্কের একটি ছবি তৈরি করুন",
                        en: "Create a sweet sister-brother relationship image",
                        vi: "Tạo hình ảnh tình cảm chị em ngọt ngào"
                },
                category: "love",
                guide: {
                        bn: '   {pn} <@tag/reply>: কাউকে ট্যাগ অথবা রিপ্লাই দিন',
                        en: '   {pn} <@tag/reply>: Tag or reply to someone',
                        vi: '   {pn} <@tag/reply>: Gắn thẻ hoặc phản hồi ai đó'
                }
        },

        langs: {
                bn: {
                        noTarget: "× বেবি, একজনকে ট্যাগ করো অথবা রিপ্লাই দাও! 🎀",
                        wait: "⌛ তোমার ছবিটি তৈরি করছি... একটু অপেক্ষা করো বেবি! <😘",
                        success: "𝐋𝐢𝐟𝐞'𝐬 𝐛𝐞𝐭𝐭𝐞𝐫 𝐰𝐢𝐭𝐡 𝐚 𝐒𝐢𝐬𝐭𝐞𝐫 𝐛𝐲 𝐲𝐨𝐮𝐫 𝐬𝐢𝐝𝐞 🎀",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
