const { DBService, Schema } = require("strange-sdk");

class AutoModService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(_config) {
        return {
            settings: new Schema({
                _id: String,
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
                anti_massmention: Boolean,
                anti_massmention_threshold: { type: Number, default: 5 },
                max_lines: { type: Number, default: 0 },
            }),

            strikes: new Schema({
                guild_id: { type: String, required: true },
                member_id: { type: String, required: true },
                strikes: { type: Number, default: 0 },
            }),

            logs: new Schema({
                guild_id: String,
                member_id: String,
                content: String,
                reason: String,
                strikes: Number,
            }),
        };
    }

    async getStrikes(guildId, memberId) {
        const key = `strikes:${guildId}-${memberId}`;

        const cached = await this.getCache(key);
        if (cached) return Number(cached);

        const Model = this.getModel("strikes");
        const strikes = await Model.findOne(
            { guild_id: guildId, member_id: memberId },
            "strikes",
        ).lean();

        this.cache(key, strikes?.strikes ?? 0);
    }

    async updateStrikes(guildId, memberId, newStrikes) {
        const key = `strikes:${guildId}-${memberId}`;

        const Model = this.getModel("strikes");
        await Model.updateOne(
            { guild_id: guildId, member_id: memberId },
            { strikes: newStrikes },
            { upsert: true },
        );
        this.cache(key, newStrikes);
    }

    async addAutoModLogToDb(member, content, reason, strikes) {
        if (!member) throw new Error("Member is undefined");

        const Model = this.getModel("logs");
        await new Model({
            guild_id: member.guild.id,
            member_id: member.id,
            content,
            reason,
            strikes,
        }).save();
    }
}

module.exports = new AutoModService();
