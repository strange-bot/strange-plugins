const { BotPlugin } = require("strange-sdk");
const { ChannelType } = require("discord.js");

module.exports = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,
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

        getRolesOf: async (payload, client) => {
            const guild = client.guilds.cache.get(payload);
            if (!guild) return [];

            return guild.roles.cache
                .filter(
                    (r) =>
                        r != guild.roles.everyone &&
                        guild.members.me.roles.highest.position > r.position &&
                        !r.managed,
                )
                .map((r) => ({
                    id: r.id,
                    name: r.name,
                }));
        },
    },
});
