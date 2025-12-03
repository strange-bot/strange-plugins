const { DBService, Schema } = require("strange-sdk");
const reqString = { type: String, required: true };

class TicketService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(config) {
        return {
            settings: new Schema({
                _id: String,
                embed_colors: {
                    create: {
                        type: String,
                        default: config["CREATE_EMBED"],
                    },
                    close: {
                        type: String,
                        default: config["CLOSE_EMBED"],
                    },
                },
                log_channel: String,
                limit: { type: Number, default: config["DEFAULT_LIMIT"] },
                categories: [
                    {
                        _id: false,
                        name: String,
                        description: String,
                        parent_id: {
                            type: String,
                            default: "auto",
                        },
                        channel_style: {
                            type: String,
                            required: true,
                            enum: ["NUMBER", "NAME", "ID"],
                            default: "NUMBER",
                        },
                        staff_roles: [String],
                        member_roles: [String],
                        open_msg: {
                            title: String,
                            description: String,
                            footer: String,
                        },
                    },
                ],
            }),

            logs: new Schema(
                {
                    ticket_id: reqString,
                    guild_id: reqString,
                    channel_id: reqString,

                    status: {
                        type: String,
                        required: true,
                        default: "OPEN",
                        enum: ["OPEN", "CLOSED", "DELETED"],
                        index: true,
                    },

                    // Data for opening
                    category: String,
                    opener_id: reqString,
                    opener_username: reqString,
                    reason: String,

                    // Data for closure
                    closed_by_id: String,
                    close_time: Date,
                    close_reason: String,

                    transcript: [
                        {
                            _id: false,
                            author_id: reqString,
                            author_username: reqString,
                            content: String,
                            embeds: [Object],
                            timestamp: Date,
                            bot: Boolean,
                            attachments: [
                                {
                                    _id: false,
                                    name: reqString,
                                    description: String,
                                    url: reqString,
                                },
                            ],
                        },
                    ],
                },
                {
                    timestamps: true,
                },
            ),
        };
    }

    async addTicketLog(data) {
        const LogsModel = this.getModel("logs");
        return new LogsModel(data).save();
    }

    async closeTicketLog(guildId, channelId, ticketId, closedBy, reason, transcript) {
        return this.getModel("logs").findOneAndUpdate(
            { guild_id: guildId, channel_id: channelId, ticket_id: ticketId },
            {
                closed_by_id: closedBy,
                close_reason: reason,
                transcript: transcript,
            },
        );
    }

    async findLogsForGuildPaged(guildId, opts = {}) {
        const LogsModel = this.getModel("logs");
        const page = Math.max(1, parseInt(opts.page) || 1);
        const perPage = Math.max(1, Math.min(200, parseInt(opts.perPage) || 25));
        const skip = (page - 1) * perPage;

        const sortField = opts.sortField || "createdAt";
        const sortDir = opts.sortDir === "asc" ? 1 : -1;

        // only allow searching by ticket_id
        const q = (opts.q || "").trim();
        const filter = { guild_id: guildId };
        if (q) {
            const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.ticket_id = re;
        }

        // optional status filter (ALL|OPEN|CLOSED)
        if (opts.status && opts.status !== "ALL") {
            filter.status = opts.status;
        } else {
            filter.status = { $ne: "DELETED" };
        }

        const total = await LogsModel.countDocuments(filter);
        const items = await LogsModel.find(filter)
            .select(
                "ticket_id status category opener_username opener_id channel_id reason close_time close_reason closed_by_id createdAt",
            )
            .sort({ [sortField]: sortDir })
            .skip(skip)
            .limit(perPage)
            .lean();

        return { items, total, page, perPage };
    }

    async getTranscriptForLogById(objectId, guildId) {
        const LogsModel = this.getModel("logs");
        const doc = await LogsModel.findById(objectId).select("transcript guild_id").lean();
        if (!doc) return null;
        if (String(doc.guild_id) !== String(guildId)) return null;
        return doc.transcript || [];
    }

    async getLogForGuildById(objectId, guildId) {
        const log = await this.getModel("logs").findById(objectId).lean();
        if (!log) return null;
        if (String(log.guild_id) !== String(guildId)) return null;
        return log;
    }

    async softDeleteLogById(objectId, guildId) {
        const LogsModel = this.getModel("logs");
        return LogsModel.updateOne({ _id: objectId, guild_id: guildId }, { status: "DELETED" });
    }

    async softDeleteLogsForGuild(guildId) {
        const LogsModel = this.getModel("logs");
        return LogsModel.updateMany({ guild_id: guildId }, { status: "DELETED" });
    }
}

module.exports = new TicketService();
