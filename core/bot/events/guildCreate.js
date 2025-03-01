const db = require("../../db.service");

/**
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (guild) => {
    if (!guild.available) return;
    if (!guild.members.cache.has(guild.ownerId))
        await guild.fetchOwner({ cache: true }).catch(() => {});
    guild.client.logger.info(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);

    // Register guild
    await db.getModel("guilds").updateOne(
        {
            _id: guild.id,
        },
        { $set: { _id: guild.id, guild_name: guild.name, joined_at: guild.joinedAt } },
        { upsert: true },
    );

    // Register interactions
    guild.client.wait(5000).then(async () => {
        await guild.client.commandManager.registerInteractions(guild.id);
        guild.client.logger.success(`Registered interactions in ${guild.name}`);
    });
};
