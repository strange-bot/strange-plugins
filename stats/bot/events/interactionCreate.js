const db = require("../../db.service");

/**
 * @param {import('discord.js').BaseInteraction} interaction
 */
module.exports = async (interaction) => {
    const statsDb = await db.getMemberStats(interaction.guildId, interaction.member.id);

    if (interaction.isChatInputCommand()) statsDb.commands.slash += 1;
    if (interaction.isUserContextMenuCommand()) statsDb.contexts.user += 1;
    if (interaction.isMessageContextMenuCommand()) statsDb.contexts.message += 1;

    // Log to DB
    await db.getModel("interaction-logs").create({
        guild_id: interaction.guildId,
        channel_id: interaction.channelId,
        member_id: interaction.member.id,
        is_slash: interaction.isChatInputCommand(),
        cmd_name: interaction.commandName,
        is_user_context: interaction.isUserContextMenuCommand(),
        is_message_context: interaction.isMessageContextMenuCommand(),
    });

    await statsDb.save();
};
