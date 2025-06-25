const { DBService, Schema } = require("strange-sdk");
const reqString = { type: String, required: true };

class TicketService extends DBService {
    constructor(pluginName) {
        super(pluginName);
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

            logs: new Schema({
                guild_id: reqString,
                channel_id: reqString,
                ticket_id: reqString,
                category: String,
                opened_by: String,
                closed_by: String,
                reason: String,
                transcript: [
                    {
                        _id: false,
                        author: String,
                        content: String,
                        embeds: [Object],
                        timestamp: Date,
                        bot: Boolean,
                        attachments: [
                            {
                                _id: false,
                                name: String,
                                description: String,
                                url: String,
                            },
                        ],
                    },
                ],
            }),
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
                closed_by: closedBy,
                reason: reason,
                transcript: transcript,
            },
        );
    }

    async getById(objectId) {
        return this.getModel("logs").findById(objectId).lean();
    }
}

module.exports = new TicketService("ticket");
