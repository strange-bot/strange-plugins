const { BotPlugin } = require("strange-sdk");
const { cleanupCache } = require("./utils");
const { ChannelType } = require("discord.js");

module.exports = new BotPlugin({
    baseDir: __dirname,
    init: (_client) => {
        cleanupCache();
    },

    dbService: require("../db.service"),
    ipcHandler: {
        getChannelsOf: async (payload, client) => {
            const guild = client.guilds.cache.get(payload);
            if (!guild) return [];

            return guild.channels.cache
                .filter((channel) => channel.type === ChannelType.GuildText)
                .map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                }));
        },
    },
});
