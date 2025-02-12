const ReqString = { type: String, required: true };
const DefaultBoolean = { type: Boolean, default: false };

module.exports = (config) => ({
    "settings": {
        enabled: {
            type: Boolean,
            default: true,
        },
        xp: {
            message: {
                type: String,
                default: config["LEVEL_UP_MESSAGE"],
            },
            channel: String,
            cooldown: { type: Number, default: 5 },
        },
    },

    "interaction-logs": {
        guild_id: ReqString,
        channel_id: ReqString,
        member_id: ReqString,
        is_slash: DefaultBoolean,
        is_user_context: DefaultBoolean,
        is_message_context: DefaultBoolean,
        cmd_name: String,
    },

    "member-stats": {
        guild_id: ReqString,
        member_id: ReqString,
        messages: { type: Number, default: 0 },
        voice: {
            connections: { type: Number, default: 0 },
            time: { type: Number, default: 0 },
        },
        commands: {
            prefix: { type: Number, default: 0 },
            slash: { type: Number, default: 0 },
        },
        contexts: {
            message: { type: Number, default: 0 },
            user: { type: Number, default: 0 },
        },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
    },

    "message-logs": {
        guild_id: ReqString,
        channel_id: ReqString,
        member_id: ReqString,
        is_cmd: { type: Boolean, default: false },
        is_ccmd: { type: Boolean, default: false },
        cmd_name: String,
        attachments: { type: Number, default: 0 },
        embeds: { type: Number, default: 0 },
    },

    "voice-logs": {
        guild_id: ReqString,
        channel_id: ReqString,
        member_id: ReqString,
        connected_at: Number,
        disconnected_at: Number,
        connection_time: Number,
    },
});
