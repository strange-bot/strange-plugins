const { DBService, Schema } = require("strange-sdk");
const reqString = { type: String, required: true };

class ModerationService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(_config) {
        return {
            settings: new Schema({
                _id: String,
                modlog_channel: String,
                max_warn: {
                    action: {
                        type: String,
                        enum: ["TIMEOUT", "KICK", "BAN"],
                        default: "KICK",
                    },
                    limit: { type: Number, default: 5 },
                },
            }),

            logs: new Schema({
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
            }),
        };
    }
}

module.exports = new ModerationService();
