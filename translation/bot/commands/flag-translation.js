const { ApplicationCommandOptionType } = require("discord.js");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "flagtranslation",
    description: "translation:FLAGTR_DESC",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        aliases: ["flagtr"],
        minArgsCount: 1,
        usage: "<on/off>",
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "status",
                description: "translation:FLAGTR_STATUS_DESC",
                required: true,
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "ON",
                        value: "ON",
                    },
                    {
                        name: "OFF",
                        value: "OFF",
                    },
                ],
            },
        ],
    },

    async messageRun({ message, args }) {
        const status = args[0].toLowerCase();
        if (!["on", "off"].includes(status))
            return message.reply("Invalid status. Value must be `on/off`");

        const response = await setFlagTranslation(message, status);
        await message.reply(response);
    },

    async interactionRun({ interaction }) {
        const response = await setFlagTranslation(
            interaction,
            interaction.options.getString("status"),
        );
        await interaction.followUp(response);
    },
};

async function setFlagTranslation({ guild }, input) {
    const settings = await db.getSettings(guild);
    const status = input.toLowerCase() === "on" ? true : false;

    settings.flag_translation = status;
    await settings.save();

    return status
        ? guild.getT("translation:FLAGTR_ENABLED")
        : guild.getT("translation:FLAGTR_DISABLED");
}
