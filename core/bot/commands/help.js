const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Message,
    ButtonBuilder,
    CommandInteraction,
    ApplicationCommandOptionType,
    ButtonStyle,
    ComponentType,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("../handler");
const { EmbedUtils } = require("strange-sdk/utils");

const CMDS_PER_PAGE = 5;
const IDLE_TIMEOUT = 30;

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "help",
    description: "core:HELP.DESCRIPTION",
    botPermissions: ["EmbedLinks"],
    validations: [],
    command: {
        enabled: true,
        usage: "[plugin|command]",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "plugin",
                description: "core:HELP.PLUGIN_DESC",
                required: false,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "command",
                description: "core:HELP.COMMAND_DESC",
                required: false,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },

    async messageRun({ message, args, prefix }) {
        let trigger = args[0];

        // !help
        if (!trigger) {
            const { disabled_prefix } = await message.guild.getSettings("core");
            const response = await getHelpMenu(message);
            const sentMsg = await message.reply(response);
            return waiter(sentMsg, message.author.id, prefix, disabled_prefix);
        }

        // check if category help (!help cat)
        const settings = await message.guild.getSettings("core");
        const { enabled_plugins, disabled_prefix } = settings;
        if (
            message.client.pluginManager.plugins.some(
                (p) => p.name === trigger && !p.ownerOnly && enabled_plugins.includes(p.name),
            )
        ) {
            return pluginWaiter(message, trigger, prefix, disabled_prefix);
        }

        // check if command help (!help cmdName)
        const cmd = message.client.prefixCommands.get(trigger);
        if (cmd && !disabled_prefix.includes(trigger)) {
            const embed = getCommandUsage(message.guild, cmd, prefix, trigger);
            return message.reply({ embeds: [embed] });
        }

        // No matching command/category found
        await message.replyT("core:HELP.NOT_FOUND");
    },

    async interactionRun({ interaction }) {
        let pluginName = interaction.options.getString("plugin");
        let cmdName = interaction.options.getString("command");

        // !help
        if (!cmdName && !pluginName) {
            const { disabled_slash } = await interaction.guild.getSettings("core");
            const response = await getHelpMenu(interaction);
            const sentMsg = await interaction.followUp(response);
            return waiter(sentMsg, interaction.user.id, null, disabled_slash);
        }

        // check if category help (!help cat)
        const settings = await interaction.guild.getSettings("core");
        const { enabled_plugins, disabled_slash } = settings;
        if (pluginName) {
            if (
                interaction.client.pluginManager.plugins.some(
                    (p) =>
                        p.name === pluginName && !p.ownerOnly && enabled_plugins.includes(p.name),
                )
            ) {
                return pluginWaiter(interaction, pluginName, disabled_slash);
            }
            return interaction.followUpT("core:HELP.NOT_FOUND");
        }

        // check if command help (!help cmdName)
        if (cmdName) {
            const cmd = interaction.client.slashCommands.get(cmdName);
            if (cmd && !disabled_slash.includes(cmd.name)) {
                const embed = getSlashUsage(interaction.guild, cmd);
                return interaction.followUp({ embeds: [embed] });
            }
            return interaction.followUpT("core:HELP.COMMAND_NOT_FOUND");
        }
    },
};

/**
 * @param {Message | CommandInteraction} arg0
 */
async function getHelpMenu({ client, guild }) {
    const { enabled_plugins } = await guild.getSettings("core");

    // Menu Row
    const options = [];
    for (const plugin of client.pluginManager.plugins.filter((p) => !p.ownerOnly)) {
        if (!enabled_plugins.includes(plugin.name)) continue;
        options.push({
            label: plugin.name,
            value: plugin.name,
            description: guild.getT("core:HELP.MENU_DESC", { plugin: plugin.name }),
            // emoji: v.emoji,
        });
    }

    const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("help-menu")
            .setPlaceholder(guild.getT("core:HELP.MENU_PLACEHOLDER"))
            .addOptions(options),
    );

    // Buttons Row
    let components = [];
    components.push(
        new ButtonBuilder()
            .setCustomId("previousBtn")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId("nextBtn")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
    );

    let buttonsRow = new ActionRowBuilder().addComponents(components);
    const config = await client.pluginManager.getPlugin("core").getConfig();
    const embed = EmbedUtils.embed()
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
            "**About Me:**\n" +
                `Hello I am ${guild.members.me.displayName}!\n` +
                "A cool multipurpose discord bot which can serve all your needs\n\n" +
                `**Invite Me:** [Here](${client.getInvite()})\n` +
                `**Support Server:** [Join](${config["SUPPORT_SERVER"]})`,
        );

    return {
        embeds: [embed],
        components: [menuRow, buttonsRow],
    };
}

/**
 * @param {Message} msg
 * @param {string} userId
 * @param {string} prefix
 * @param {string[]} disabledCmds
 */
const waiter = (msg, userId, prefix, disabledCmds) => {
    const collector = msg.channel.createMessageComponentCollector({
        filter: (reactor) => reactor.user.id === userId && msg.id === reactor.message.id,
        idle: IDLE_TIMEOUT * 1000,
        dispose: true,
        time: 5 * 60 * 1000,
    });

    let arrEmbeds = [];
    let currentPage = 0;
    let menuRow = msg.components[0];
    let buttonsRow = msg.components[1];

    collector.on("collect", async (response) => {
        if (!["help-menu", "previousBtn", "nextBtn"].includes(response.customId)) return;
        await response.deferUpdate();

        switch (response.customId) {
            case "help-menu": {
                const cat = response.values[0];
                arrEmbeds = prefix
                    ? getPrefixPluginCommandEmbed(msg.guild, cat, prefix, disabledCmds)
                    : getSlashPluginCommandsEmbed(msg.guild, cat, disabledCmds);
                currentPage = 0;

                // Buttons Row
                let components = [];
                buttonsRow.components.forEach((button) =>
                    components.push(
                        ButtonBuilder.from(button).setDisabled(arrEmbeds.length > 1 ? false : true),
                    ),
                );

                buttonsRow = new ActionRowBuilder().addComponents(components);
                msg.editable &&
                    (await msg.edit({
                        embeds: [arrEmbeds[currentPage]],
                        components: [menuRow, buttonsRow],
                    }));
                break;
            }

            case "previousBtn":
                if (currentPage !== 0) {
                    --currentPage;
                    msg.editable &&
                        (await msg.edit({
                            embeds: [arrEmbeds[currentPage]],
                            components: [menuRow, buttonsRow],
                        }));
                }
                break;

            case "nextBtn":
                if (currentPage < arrEmbeds.length - 1) {
                    currentPage++;
                    msg.editable &&
                        (await msg.edit({
                            embeds: [arrEmbeds[currentPage]],
                            components: [menuRow, buttonsRow],
                        }));
                }
                break;
        }
    });

    collector.on("end", () => {
        if (!msg.guild || !msg.channel) return;
        return msg.editable && msg.edit({ components: [] });
    });
};

/**
 * @param {import('discord.js').ChatInputCommandInteraction | import('discord.js').Message} arg0
 * @param {string} pluginName
 * @param {string} prefix
 * @param {string[]} disabledCmds
 */
const pluginWaiter = async (arg0, pluginName, prefix, disabledCmds) => {
    let arrEmbeds = prefix
        ? getPrefixPluginCommandEmbed(arg0.guild, pluginName, prefix, disabledCmds)
        : getSlashPluginCommandsEmbed(arg0.guild, pluginName, disabledCmds, disabledCmds);

    let currentPage = 0;
    let buttonsRow = [];

    if (arrEmbeds.length > 1) {
        buttonsRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId("previousBtn")
                .setEmoji("⬅️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId("nextBtn")
                .setEmoji("➡️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false),
        ]);
    }

    const reply = {
        embeds: [arrEmbeds[currentPage]],
        components: arrEmbeds.length > 1 ? [buttonsRow] : [],
    };

    const sentMsg = prefix ? await arg0.reply(reply) : await arg0.followUp(reply);
    const authorId = prefix ? arg0.author.id : arg0.user.id;
    if (arrEmbeds.length > 1) {
        const collector = arg0.channel.createMessageComponentCollector({
            filter: (reactor) => reactor.user.id === authorId && sentMsg.id === reactor.message.id,
            componentType: ComponentType.Button,
            idle: IDLE_TIMEOUT * 1000,
            dispose: true,
            time: 5 * 60 * 1000,
        });

        collector.on("collect", async (response) => {
            if (!["previousBtn", "nextBtn"].includes(response.customId)) return;
            await response.deferUpdate();

            switch (response.customId) {
                case "previousBtn":
                    if (currentPage !== 0) {
                        --currentPage;
                        if (sentMsg.editable) {
                            await sentMsg.edit({
                                embeds: [arrEmbeds[currentPage]],
                                components: [buttonsRow],
                            });
                        }
                    }
                    break;

                case "nextBtn":
                    if (currentPage < arrEmbeds.length - 1) {
                        currentPage++;
                        if (sentMsg.editable) {
                            await sentMsg.edit({
                                embeds: [arrEmbeds[currentPage]],
                                components: [buttonsRow],
                            });
                        }
                    }
                    break;
            }
        });

        collector.on("end", () => {
            if (!sentMsg.guild || !sentMsg.channel) return;
            return sentMsg.editable && sentMsg.edit({ components: [] });
        });
    }
};

/**
 * Returns an array of message embeds for a particular command category [SLASH COMMANDS]
 * @param {import('discord.js').Guild} guild
 * @param {string} pluginName
 * @param {string[]} disabledCmds
 */
function getSlashPluginCommandsEmbed(guild, pluginName, disabledCmds) {
    const commands = [
        ...guild.client.pluginManager.plugins.find((p) => p.name === pluginName).commands,
    ].filter((cmd) => cmd.slashCommand?.enabled && !disabledCmds.includes(cmd.name));

    if (commands.length === 0) {
        const embed = EmbedUtils.embed()
            // .setThumbnail(CommandCategory[category]?.image)
            .setAuthor({ name: `Plugin ${pluginName.toUpperCase()}` })
            .setDescription(guild.getT("core:HELP.EMPTY_CATEGORY"));

        return [embed];
    }

    const arrSplitted = [];
    const arrEmbeds = [];

    while (commands.length) {
        let toAdd = commands.splice(
            0,
            commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length,
        );

        toAdd = toAdd.map((cmd) => {
            const subCmds = cmd.slashCommand.options?.filter(
                (opt) => opt.type === ApplicationCommandOptionType.Subcommand,
            );
            const subCmdsString = subCmds?.map((s) => s.name).join(", ");
            return `\`/${cmd.name}\`\n ❯ **${guild.getT("core:HELP.CMD_DESC")}**: ${guild.getT(cmd.description)}\n ${
                !subCmds?.length
                    ? "\n"
                    : `❯ **${guild.getT("core:HELP.CMD_SUBCOMMANDS")} [${subCmds?.length}]**: ${subCmdsString}\n`
            } `;
        });

        arrSplitted.push(toAdd);
    }

    arrSplitted.forEach((item, index) => {
        const embed = EmbedUtils.embed()
            // .setThumbnail(CommandCategory[category]?.image)
            .setAuthor({ name: `Plugin ${pluginName.toUpperCase()}` })
            .setDescription(item.join("\n"))
            .setFooter({
                text: guild.getT("core:HELP.PLUGIN_EMBED_FOOTER", {
                    page: index + 1,
                    pages: arrSplitted.length,
                    prefix: "/",
                }),
            });
        arrEmbeds.push(embed);
    });

    return arrEmbeds;
}

/**
 * Returns an array of message embeds for a particular command category [MESSAGE COMMANDS]
 * @param {import('discord.js').Guild} guild
 * @param {string} pluginName
 * @param {string} prefix
 *
 */
function getPrefixPluginCommandEmbed(guild, pluginName, prefix, disabledCmds) {
    const commands = [
        ...guild.client.pluginManager.plugins.find((p) => p.name === pluginName).commands,
    ].filter((cmd) => cmd.command?.enabled && !disabledCmds.includes(cmd.name));

    if (commands.length === 0) {
        const embed = EmbedUtils.embed()
            // .setThumbnail(CommandCategory[pluginName]?.image)
            .setAuthor({ name: `Plugin ${guild.getT(pluginName.toLowerCase() + ":TITLE")}` })
            .setDescription(guild.getT("core:HELP.EMPTY_CATEGORY"));

        return [embed];
    }

    const arrSplitted = [];
    const arrEmbeds = [];

    while (commands.length) {
        let toAdd = commands.splice(
            0,
            commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length,
        );
        toAdd = toAdd.map((cmd) => {
            const subCmds = cmd.command.subcommands;
            const subCmdsString = subCmds?.map((s) => s.trigger.split(" ")[0]).join(", ");
            return `\`${prefix}${cmd.name}\`\n ❯ **${guild.getT("core:HELP.CMD_DESC")}**: ${guild.getT(cmd.description)}\n ${
                !subCmds?.length
                    ? "\n"
                    : `❯ **${guild.getT("core:HELP.CMD_SUBCOMMANDS")} [${subCmds?.length}]**: ${subCmdsString}\n`
            } `;
        });
        arrSplitted.push(toAdd);
    }

    arrSplitted.forEach((item, index) => {
        const embed = EmbedUtils.embed()
            // .setThumbnail(CommandCategory[pluginName]?.image)
            .setAuthor({ name: `Plugin ${guild.getT(pluginName.toLowerCase() + ":TITLE")}` })
            .setDescription(item.join("\n"))
            .setFooter({
                text: guild.getT("core:HELP.PLUGIN_EMBED_FOOTER", {
                    page: index + 1,
                    pages: arrSplitted.length,
                    prefix,
                }),
            });

        arrEmbeds.push(embed);
    });

    return arrEmbeds;
}
