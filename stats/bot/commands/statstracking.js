const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "statstracking",
    description: "stats:TRACKING.DESCRIPTION",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        aliases: ["statssystem"],
        usage: "<on|off>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "status",
                description: "stats:TRACKING.STATUS_DESC",
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
        const input = args[0].toLowerCase();
        if (!["on", "off"].includes(input))
            return message.reply("Invalid status. Value must be `on/off`");
        const response = await setStatus(input, message);
        return message.reply(response);
    },

    async interactionRun({ interaction }) {
        const response = await setStatus(interaction.options.getString("status"), interaction);
        await interaction.followUp(response);
    },
};

async function setStatus(input, { guild }) {
    const settings = await guild.getSettings("core");
    const status = input.toLowerCase() === "on" ? true : false;
    if (status) {
        settings.disabled_plugin = settings.disabled_plugins.filter((plugin) => plugin !== "stats");
    } else {
        if (!settings.disabled_plugins.includes("stats")) {
            settings.disabled_plugins.push("stats");
        }
    }

    await settings.save();
    return status ? guild.getT("stats:TRACKING.ENABLED") : guild.getT("stats:TRACKING.DISABLED");
}
