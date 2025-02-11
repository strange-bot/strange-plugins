module.exports = (config) => ({
    settings: {
        enabled: {
            type: Boolean,
            default: true,
        },
        upvote_emoji: {
            type: String,
            default: config["UPVOTE_EMOJI"],
        },
        downvote_emoji: {
            type: String,
            default: config["DOWNVOTE_EMOJI"],
        },
        default_embed: {
            type: String,
            default: config["DEFAULT_EMBED"],
        },
        approved_embed: {
            type: String,
            default: config["APPROVED_EMBED"],
        },
        rejected_embed: {
            type: String,
            default: config["DENIED_EMBED"],
        },
        channel_id: String,
        approved_channel: String,
        rejected_channel: String,
        staff_roles: [String],
    },

    suggestions: {
        guild_id: String,
        channel_id: String,
        message_id: String,
        user_id: String,
        suggestion: String,
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "DELETED"],
            default: "PENDING",
        },
        stats: {
            upvotes: { type: Number, default: 0 },
            downvotes: { type: Number, default: 0 },
        },
        status_updates: [
            {
                _id: false,
                user_id: String,
                status: {
                    type: String,
                    enum: ["APPROVED", "REJECTED", "DELETED"],
                },
                reason: String,
                timestamp: { type: Date, default: new Date() },
            },
        ],
    },
});
