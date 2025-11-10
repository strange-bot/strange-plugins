const ems = require("enhanced-ms");

module.exports = async (client, payload) => {
    return client.giveawaysManager.giveaways
        .filter((g) => g.guildId === payload && !g.ended)
        .map((g) => {
            return {
                prize: g.prize,
                winnerCount: g.winnerCount,
                extraData: g.extraData,
                hostedBy: g.hostedBy,
                channelId: g.channelId,
                pauseOptions: g.pauseOptions,
                messageId: g.messageId,
                timeRemaining:
                    g.endAt !== Infinity ? ems(g.endAt - Date.now(), { shortFormat: true }) : "∞",
            };
        });
};
