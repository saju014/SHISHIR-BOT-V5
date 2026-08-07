const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "tuntun",
                version: "1.7",
                author: "MahMUD",
                role: 0,
                category: "fun",
                cooldown: 10,
                guide: {
                        en: "{pn} [mention/reply/UID]",
                        bn: "{pn} [মেনশন/রিপ্লাই/UID]",
                        vi: "{pn} [mention/reply/UID]"
                }
        },

        langs: {
                bn: {
                        noTarget: "• বেবি, কাকে tuntun বানাবে? মেনশন, রিপ্লাই বা UID দাও",
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "Effect tuntun successful"
                },
                en: {
                        noTarget: "• Baby, mention, reply, or provide UID of the target",
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "Effect tuntun successful"
                },
                vi: {
