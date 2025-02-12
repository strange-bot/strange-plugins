const plugin = require("../index");
const Model = plugin.getModel("tickets");

module.exports = {
    addTicketLog: async (data) => new Model(data).save(),

    closeTicketLog: async (guildId, channelId, ticketId, closedBy, reason, transcript) =>
        Model.findOneAndUpdate(
            { guild_id: guildId, channel_id: channelId, ticket_id: ticketId },
            {
                closed_by: closedBy,
                reason: reason,
                transcript: transcript,
            },
        ),

    getById: async (objectId) => Model.findById(objectId).lean(),
};
