const start = require("../../commands/sub/start");

module.exports = async (client, payload) => {
    const guild = client.guilds.cache.get(payload.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(payload.channelId);
    const member = guild.members.cache.get(payload.memberId);

    await start(
        member,
        channel,
        payload.duration,
        payload.prize,
        Number(payload.winners),
        payload.host,
        payload.member_roles,
    );
};
