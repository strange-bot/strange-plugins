const { buildGreeting } = require("../utils");
const db = require("../../db.service");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
    const settings = await db.getSettings(member.guild);

    const config = settings?.farewell;
    if (!config || !config.enabled) return;

    // check if channel exists
    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const inviterData = member.inviterData || {};

    // build farewell message
    const response = await buildGreeting(member, "FAREWELL", config, inviterData);

    channel.send(response);
};
