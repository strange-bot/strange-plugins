module.exports = async (client, payload) => {
    const guild = client.guilds.cache.get(payload);
    if (!guild) return [];

    return guild.channels.cache
        .filter((channel) => channel.type === require("discord.js").ChannelType.GuildText)
        .map((channel) => ({
            id: channel.id,
            name: channel.name,
        }));
};
