module.exports = async (client, payload) => {
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
};
