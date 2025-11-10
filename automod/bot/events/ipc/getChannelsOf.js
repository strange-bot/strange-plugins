const { ChannelType } = require("discord.js");

module.exports = (client, payload) => {
    const guild = client.guilds.cache.get(payload);
    if (!guild) return [];

    return guild.channels.cache
        .filter((channel) => channel.type === ChannelType.GuildText)
        .map((channel) => ({
            id: channel.id,
            name: channel.name,
        }));
};
