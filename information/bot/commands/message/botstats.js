const botstats = require("../shared/botstats");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "botstats",
    description: "information:BOT.SUB_STATS_DESC",
    botPermissions: ["EmbedLinks"],
    cooldown: 5,
    command: {
        enabled: true,
        aliases: ["botstat", "botinfo"],
    },

    async messageRun({ message }) {
        const response = await botstats(message);
        await message.reply(response);
    },
};
