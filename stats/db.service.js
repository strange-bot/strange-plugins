const { DBService, Schema } = require("strange-sdk");
const ReqString = { type: String, required: true };
const DefaultBoolean = { type: Boolean, default: false };

class StatsService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(config) {
        return {
            "settings": new Schema({
                _id: ReqString,
                xp: {
                    message: {
                        type: String,
                        default: config["LEVEL_UP_MESSAGE"],
                    },
                    channel: String,
                    cooldown: { type: Number, default: 5 },
                },
            }),

            "interaction-logs": new Schema({
                guild_id: ReqString,
                channel_id: ReqString,
                member_id: ReqString,
                is_slash: DefaultBoolean,
                is_user_context: DefaultBoolean,
                is_message_context: DefaultBoolean,
                cmd_name: String,
            }),

            "member-stats": new Schema({
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
            }).post("save", async (doc) => {
                const key = `${doc.guild_id}-${doc.member_id}`;
                this.cache(key, doc);
            }),

            "message-logs": new Schema({
                guild_id: ReqString,
                channel_id: ReqString,
                member_id: ReqString,
                is_cmd: { type: Boolean, default: false },
                is_ccmd: { type: Boolean, default: false },
                cmd_name: String,
                attachments: { type: Number, default: 0 },
                embeds: { type: Number, default: 0 },
            }),

            "voice-logs": new Schema({
                guild_id: ReqString,
                channel_id: ReqString,
                member_id: ReqString,
                connected_at: Number,
                disconnected_at: Number,
                connection_time: Number,
            }),
        };
    }

    async saveVoiceState(member, time) {
        const key = `voice-states:${member.guild.id}-${member.id}`;
        await this.cache(key, time, 0);
    }

    async getVoiceState(member) {
        const key = `voice-states:${member.guild.id}-${member.id}`;
        return await this.getCache(key);
    }

    async deleteVoiceState(member) {
        const key = `voice-states:${member.guild.id}-${member.id}`;
        await this.deleteCache(key);
    }

    async getMemberStats(guildId, memberId) {
        const Model = this.getModel("member-stats");
        const key = `${guildId}-${memberId}`;

        const cached = await this.getCache(key);
        if (cached) {
            return cached === "null"
                ? new Model({ guild_id: guildId, member_id: memberId })
                : Model.hydrate(JSON.parse(cached));
        }

        let member = await Model.findOne({ guild_id: guildId, member_id: memberId });
        await this.cache(key, member);
        return member || new Model({ guild_id: guildId, member_id: memberId });
    }

    async getXpLb(guildId, limit = 10) {
        return this.getModel("member-stats")
            .find({ guild_id: guildId })
            .limit(limit)
            .sort({ level: -1, xp: -1 })
            .lean();
    }
}

module.exports = new StatsService();
