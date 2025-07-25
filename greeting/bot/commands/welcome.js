const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { MiscUtils } = require("strange-sdk/utils");
const { buildGreeting } = require("../utils");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "welcome",
    description: "greeting:WELCOME.DESCRIPTION",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
            {
                trigger: "status <on|off>",
                description: "greeting:WELCOME.SUB_STATUS",
            },
            {
                trigger: "channel <#channel>",
                description: "greeting:WELCOME.SUB_CHANNEL",
            },
            {
                trigger: "preview",
                description: "greeting:WELCOME.SUB_PREVIEW",
            },
            {
                trigger: "desc <text>",
                description: "greeting:WELCOME.SUB_DESC",
            },
            {
                trigger: "thumbnail <ON|OFF>",
                description: "greeting:WELCOME.SUB_THUMBNAIL",
            },
            {
                trigger: "color <hexcolor>",
                description: "greeting:WELCOME.SUB_COLOR",
            },
            {
                trigger: "footer <text>",
                description: "greeting:WELCOME.SUB_FOOTER",
            },
            {
                trigger: "image <url>",
                description: "greeting:WELCOME.SUB_IMAGE",
            },
        ],
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "status",
                description: "greeting:WELCOME.SUB_STATUS",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "status",
                        description: "greeting:WELCOME.SUB_STATUS_STATUS",
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
            {
                name: "preview",
                description: "greeting:WELCOME.SUB_PREVIEW",
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "message",
                description: "greeting:WELCOME.SUB_MSG",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "greeting:WELCOME.SUB_MSG_CHANNEL",
                        type: ApplicationCommandOptionType.Channel,
                        channelTypes: [ChannelType.GuildText],
                        required: true,
                    },
                    {
                        name: "description",
                        description: "greeting:WELCOME.SUB_MSG_DESC",
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: "status",
                        description: "greeting:WELCOME.SUB_MSG_THUMBNAIL",
                        type: ApplicationCommandOptionType.String,
                        required: true,
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
                    {
                        name: "hex-code",
                        description: "greeting:WELCOME.SUB_MSG_COLOR",
                        type: ApplicationCommandOptionType.String,
                        required: false,
                    },
                    {
                        name: "footer",
                        description: "greeting:WELCOME.SUB_MSG_FOOTER",
                        type: ApplicationCommandOptionType.String,
                        required: false,
                    },
                    {
                        name: "url",
                        description: "greeting:WELCOME.SUB_MSG_IMAGE",
                        type: ApplicationCommandOptionType.String,
                        required: false,
                    },
                ],
            },
        ],
    },

    async messageRun({ message, args }) {
        const settings = await db.getSettings(message.guild);
        const type = args[0].toLowerCase();
        let response;

        // preview
        if (type === "preview") {
            response = await sendPreview(settings, message.member, message.guild);
        }

        // status
        else if (type === "status") {
            const status = args[1]?.toUpperCase();
            if (!status || !["ON", "OFF"].includes(status))
                return message.replyT("greeting:WELCOME.INVALID_THUMBNAIL");
            response = await setStatus(settings, status, message.guild);
        }

        // channel
        else if (type === "channel") {
            const channel = message.mentions.channels.first();
            response = await setChannel(settings, channel, message.guild);
        }

        // desc
        else if (type === "desc") {
            if (args.length < 2) return message.replyT("greeting:WELCOME.INVALID_CONTENT");
            const desc = args.slice(1).join(" ");
            response = await setDescription(settings, desc, message.guild);
        }

        // thumbnail
        else if (type === "thumbnail") {
            const status = args[1]?.toUpperCase();
            if (!status || !["ON", "OFF"].includes(status))
                return message.replyT("greeting:WELCOME.INVALID_THUMBNAIL");
            response = await setThumbnail(settings, status, message.guild);
        }

        // color
        else if (type === "color") {
            response = await setColor(settings, args[1], message.guild);
        }

        // footer
        else if (type === "footer") {
            if (args.length < 2) return message.replyT("greeting:WELCOME.INVALID_CONTENT");
            const content = args.slice(1).join(" ");
            response = await setFooter(settings, content, message.guild);
        }

        // image
        else if (type === "image") {
            const url = args[1];
            if (!url) return message.replyT("greeting:WELCOME.INVALID_IMAGE");
            response = await setImage(settings, url, message.guild);
        }

        //
        else response = message.guild.getT("INVALID_SUBCOMMAND", { sub: type });
        return message.reply(response);
    },

    async interactionRun({ interaction }) {
        const settings = await db.getSettings(interaction.guild);
        const sub = interaction.options.getSubcommand();

        let response;
        switch (sub) {
            case "preview":
                response = await sendPreview(settings, interaction.member, interaction.guild);
                break;

            case "status":
                response = await setStatus(
                    settings,
                    interaction.options.getString("status"),
                    interaction.guild,
                );
                break;

            case "message":
                response = await setMessage(settings, interaction);
                break;

            default:
                response = interaction.guild.getT("INVALID_SUBCOMMAND", { sub });
        }

        return interaction.followUp(response);
    },
};

async function sendPreview(settings, member, guild) {
    if (!settings.welcome?.enabled) return guild.getT("greeting:WELCOME.WELCOME_DISABLED");

    const targetChannel = member.guild.channels.cache.get(settings.welcome.channel);
    if (!targetChannel) return guild.getT("greeting:WELCOME.CHANNEL_NOT_CONFIG");

    const response = await buildGreeting(member, "WELCOME", settings.welcome);
    await targetChannel.send(response);

    return guild.getT("greeting:WELCOME.PREVIEW_SENT", {
        channel: targetChannel.toString(),
    });
}

async function setStatus(settings, status, guild) {
    const enabled = status.toUpperCase() === "ON" ? true : false;
    settings.welcome.enabled = enabled;
    await settings.save();
    return status
        ? guild.getT("greeting:WELCOME.ENABLED")
        : guild.getT("greeting:WELCOME.DISABLED");
}

async function setChannel(settings, channel, guild) {
    if (!guild.canSendEmbeds(channel)) {
        return guild.getT("greeting:WELCOME.CHANNEL_NO_PERMS", {
            channel: channel.toString(),
        });
    }
    settings.welcome.channel = channel.id;
    await settings.save();
    return guild.getT("greeting:WELCOME.CHANNEL_SET", {
        channel: channel.toString(),
    });
}

async function setDescription(settings, desc, guild) {
    settings.welcome.embed.description = desc;
    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_UPDATED");
}

async function setThumbnail(settings, status, guild) {
    settings.welcome.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_UPDATED");
}

async function setColor(settings, color, guild) {
    if (!color || !MiscUtils.isHex(color)) return guild.getT("greeting:WELCOME.INVALID_COLOR");
    settings.welcome.embed.color = color;
    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_UPDATED");
}

async function setFooter(settings, content, guild) {
    settings.welcome.embed.footer = content;
    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_UPDATED");
}

async function setImage(settings, url, guild) {
    settings.welcome.embed.image = url;
    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_UPDATED");
}

async function setMessage(settings, interaction) {
    const channel = interaction.guild.channels.cache.get(
        interaction.options.getChannel("channel").id,
    );
    const status = interaction.options.getString("status") === "ON" ? true : false;
    const color = interaction.options.getString("hex-code");
    const footer = interaction.options.getString("footer");
    const url = interaction.options.getString("url");

    const { guild } = interaction;

    if (!guild.canSendEmbeds(channel)) {
        return guild.getT("greeting:WELCOME.CHANNEL_NO_PERMS", {
            channel: channel.toString(),
        });
    }

    if (color && !MiscUtils.isHex(color)) return guild.getT("greeting:WELCOME.INVALID_COLOR");

    settings.welcome.enabled = interaction.options.getChannel("channel").id;
    settings.welcome.channel = interaction.options.getString("description");
    settings.welcome.embed.thumbnail = status;
    if (color) settings.welcome.embed.color = color;
    if (footer) settings.welcome.embed.footer = footer;
    if (url) settings.welcome.embed.image = url;

    await settings.save();
    return guild.getT("greeting:WELCOME.CONFIG_SAVED", {
        channel: channel.toString(),
    });
}
