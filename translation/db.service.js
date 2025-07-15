const { DBService, Schema } = require("strange-sdk");

const TRANSLATE_COOLDOWN = 120;

class TicketService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(_config) {
        return {
            settings: new Schema({
                _id: String,
                flag_translation: { type: Boolean, default: false },
            }),

            logs: new Schema(
                {
                    guild_id: { type: String, required: true },
                    channel_id: { type: String, required: true },
                    message_id: { type: String, required: true },
                    emoji: { type: String, required: true },
                },
                {
                    versionKey: false,
                    autoIndex: false,
                    timestamps: {
                        createdAt: "created_at",
                        updatedAt: false,
                    },
                },
            ),
        };
    }

    async addCooldown(user) {
        const key = `cooldown:${user.id}`;
        return this.cache(key, Date.now());
    }

    async getCooldown(user) {
        const key = `cooldown:${user.id}`;
        const cached = await this.getCache(key);
        if (cached) {
            const remaining = Number((cached - Date.now()) * 0.001);
            if (remaining > TRANSLATE_COOLDOWN) {
                this.delCache(key);
                return 0;
            }
            return TRANSLATE_COOLDOWN - remaining;
        }
        return 0;
    }

    async isTranslated(message, code) {
        return this.getModel("logs")
            .findOne({
                guild_id: message.guildId,
                channel_id: message.channelId,
                message_id: message.id,
                emoji: code,
            })
            .lean();
    }

    async logTranslation(message, code) {
        const LogsModel = this.getModel("logs");
        return new LogsModel({
            guild_id: message.guildId,
            channel_id: message.channelId,
            message_id: message.id,
            emoji: code,
        }).save();
    }
}

module.exports = new TicketService();
