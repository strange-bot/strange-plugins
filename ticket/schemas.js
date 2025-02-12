const reqString = {
    type: String,
    required: true,
};

module.exports = (_config) => ({
    settings: {
        enabled: {
            type: Boolean,
            default: true,
        },
        embed_colors: {
            create: {
                type: String,
                default: "#068ADD",
            },
            close: {
                type: String,
                default: "#068ADD",
            },
        },
        log_channel: String,
        limit: { type: Number, default: 10 },
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
    },

    tickets: {
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
    },
});
