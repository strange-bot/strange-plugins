const reqString = {
    type: String,
    required: true,
};

module.exports = (_config) => ({
    "settings": {
        enabled: {
            type: Boolean,
            default: true,
        },
        debug: Boolean,
        log_channel: String,
        embed_colors: {
            log: String,
            dm: String,
        },
        strikes: { type: Number, default: 10 },
        action: { type: String, default: "TIMEOUT" },
        wh_channels: [String],
        anti_attachments: Boolean,
        anti_invites: Boolean,
        anti_links: Boolean,
        anti_spam: Boolean,
        anti_ghostping: Boolean,
        anti_massmention: Number,
        max_lines: Number,
    },

    "automod-logs": {
        guild_id: reqString,
        member_id: reqString,
        content: String,
        reason: String,
        strikes: Number,
    },

    "strikes": {
        guild_id: reqString,
        member_id: reqString,
        strikes: { type: Number, default: 0 },
    },
});
