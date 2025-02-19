const db = require("../../db.service");

/**
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (guild) => {
    if (!guild.available) return;
    guild.client.logger.info(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);
    await db.getModel("guilds").updateOne(
        {
            _id: guild.id,
        },
        {
            $set: {
                _id: guild.id,
                guild_name: guild.name,
                joined_at: guild.joinedAt,
                left_at: new Date(),
            },
        },
        { upsert: true },
    );
};
