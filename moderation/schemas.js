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
        modlog_channel: String,
        max_warn: {
            action: {
                type: String,
                enum: ["TIMEOUT", "KICK", "BAN"],
                default: "KICK",
            },
            limit: { type: Number, default: 5 },
        },
    },

    "mod-logs": {
        guild_id: reqString,
        member_id: String,
        reason: String,
        admin: {
            id: reqString,
            tag: reqString,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "PURGE",
                "WARN",
                "TIMEOUT",
                "UNTIMEOUT",
                "KICK",
                "SOFTBAN",
                "BAN",
                "UNBAN",
                "VMUTE",
                "VUNMUTE",
                "DEAFEN",
                "UNDEAFEN",
                "DISCONNECT",
                "MOVE",
            ],
        },
        deleted: {
            type: Boolean,
            default: false,
        },
    },
});
