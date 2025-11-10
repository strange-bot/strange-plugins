const resume = require("../../commands/sub/resume");

module.exports = async (client, payload) => {
    const guild = client.guilds.cache.get(payload.guildId);
    if (!guild) return;
    const member = guild.members.cache.get(payload.memberId);
    await resume(member, payload.message_id);
};
