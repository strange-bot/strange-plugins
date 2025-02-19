const { ApplicationCommandOptionType } = require("discord.js");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "setprefix",
    description: "core:PREFIX.DESCRIPTION",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        usage: "<new-prefix>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "newprefix",
                description: "core:PREFIX.NEW_PREFIX",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun({ message, args }) {
        const newPrefix = args[0];
        const response = await setNewPrefix(message.guild, newPrefix);
        await message.reply(response);
    },

    async interactionRun({ interaction }) {
        const response = await setNewPrefix(
            interaction.guild,
            interaction.options.getString("newprefix"),
        );
        await interaction.followUp(response);
    },
};

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} newPrefix
 */
async function setNewPrefix(guild, newPrefix) {
    if (newPrefix.length > 2) return guild.getT("core:PREFIX.TOO_LONG");

    const settings = await db.getSettings(guild);
    settings.prefix = newPrefix;
    await settings.save();

    return guild.getT("core:PREFIX.SUCCESS", { prefix: newPrefix });
}
