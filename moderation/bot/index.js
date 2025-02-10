const { ChannelType } = require("discord.js");
const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,

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
