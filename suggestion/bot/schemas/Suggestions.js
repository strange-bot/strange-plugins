const plugin = require("../index");
const Model = plugin.getModel("suggestions");

module.exports = {
    model: Model,

    addSuggestion: async (message, userId, suggestion) => {
        return new Model({
            guild_id: message.guildId,
            channel_id: message.channelId,
            message_id: message.id,
            user_id: userId,
            suggestion: suggestion,
        }).save();
    },

    findSuggestion: async (guildId, messageId) => {
        return Model.findOne({ guild_id: guildId, message_id: messageId });
    },

    deleteSuggestionDb: async (guildId, messageId, memberId, reason) => {
        return Model.updateOne(
            { guild_id: guildId, message_id: messageId },
            {
                status: "DELETED",
                $push: {
                    status_updates: { user_id: memberId, status: "DELETED", reason },
                },
            },
        );
    },
};
