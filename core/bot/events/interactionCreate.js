const { MessageFlags } = require("discord.js");
const { handleSlashCommand, handleContext } = require("../handler");

/**
 * @param {import('discord.js').Interaction} interaction
 */
module.exports = async (interaction) => {
    if (!interaction.guild) {
        return interaction
            .reply({
                content: "Command can only be executed in a discord server",
                flags: MessageFlags.Ephemeral,
            })
            .catch(() => {});
    }

    const guild = interaction.guild;

    // Slash Commands
    if (interaction.isChatInputCommand()) {
        const cmd = interaction.client.commandManager.findSlashCommand(interaction.commandName);
        if (!cmd) {
            return interaction
                .reply({
                    content: guild.getT("core:HANDLER.CMD_NOT_FOUND"),
                    flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
        }

        const [settings, pluginSettings] = await Promise.all([
            guild.getSettings("core"),
            guild.getSettings(cmd.plugin.name),
        ]);

        // check if the plugin is disabled
        if (pluginSettings.enabled === false) {
            return interaction
                .reply({
                    content: guild.getT("core:HANDLER.PLUGIN_DISABLED"),
                    flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
        }

        // check if the command is disabled
        if (settings.disabled_slash.includes(cmd.name)) {
            return interaction
                .reply({
                    content: guild.getT("core:HANDLER.CMD_DISABLED"),
                    flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
        }

        await handleSlashCommand(interaction, cmd);
    }

    // Context Menu
    else if (interaction.isContextMenuCommand()) {
        const context = interaction.client.commandManager.findContextMenu(interaction.commandName);
        if (context) await handleContext(interaction, context);
        else
            return interaction
                .reply({ content: "An error has occurred", flags: MessageFlags.Ephemeral })
                .catch(() => {});
    }
};
