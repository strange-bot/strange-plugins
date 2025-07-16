const { handlePrefixCommand } = require("../handler");
const plugin = require("../index");
const db = require("../../db.service");

/**
 * @param {import('discord.js').Message} message
 */
module.exports = async (message) => {
    message.received_at = Date.now();
    message.isCommand = false;
    if (!message.guild || message.author.bot) return;
    const guild = message.guild;

    const [config, settings] = await Promise.all([plugin.getConfig(), db.getSettings(guild)]);

    if (!config["PREFIX_COMMANDS"]["ENABLED"]) return;

    // check for bot mentions
    if (message.content.includes(`${guild.client.user.id}`)) {
        message.channel.send(`> My prefix is \`${settings.prefix}\``);
    }

    if (message.content && message.content.startsWith(settings.prefix)) {
        const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
        const cmd = guild.client.commandManager.findPrefixCommand(invoke);
        if (cmd) {
            // check if the plugin is disabled
            if (!settings.enabled_plugins.includes(cmd.plugin.name)) return;

            // check if the command is disabled
            if (settings.disabled_prefix.includes(cmd.name)) return;

            message.isCommand = true;
            handlePrefixCommand(message, cmd, settings.prefix);
        }
    }
};
