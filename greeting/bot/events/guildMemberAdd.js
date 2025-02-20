const { buildGreeting } = require("../utils");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
    const settings = await member.guild.getSettings("greeting");

    // Autorole
    if (settings.autorole_id) {
        const role = member.guild.roles.cache.get(config.autorole);
        if (role) member.roles.add(role).catch(() => {});
    }

    const config = settings?.welcome;
    if (!config || !config.enabled) return;

    // check if channel exists
    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const inviterData = member.inviterData || {};

    // build welcome message
    const response = await buildGreeting(member, "WELCOME", config, inviterData);

    channel.safeSend(response);
};
