const { DBService, Schema } = require("strange-sdk");

class SuggestionService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(config) {
        return {
            settings: new Schema({
                _id: String,
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
            }),

            logs: new Schema({
                guild_id: String,
                message_id: String,
                channel_id: String,
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
            }),
        };
    }

    async addSuggestion(message, userId, suggestion) {
        const LogsModel = this.getModel("logs");
        return new LogsModel({
            guild_id: message.guildId,
            channel_id: message.channelId,
            message_id: message.id,
            user_id: userId,
            suggestion: suggestion,
        }).save();
    }

    async findSuggestion(guildId, messageId) {
        return this.getModel("logs").findOne({ guild_id: guildId, message_id: messageId });
    }

    async deleteSuggestionDb(guildId, messageId, memberId, reason) {
        return this.getModel("logs").updateOne(
            { guild_id: guildId, message_id: messageId },
            {
                status: "DELETED",
                $push: {
                    status_updates: { user_id: memberId, status: "DELETED", reason },
                },
            },
        );
    }
}

module.exports = new SuggestionService();
