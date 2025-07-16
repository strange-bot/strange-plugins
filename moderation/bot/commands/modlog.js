const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "modlog",
    description: "moderation:MODLOG.DESCRIPTION",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        usage: "<#channel|off>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "channel",
                description: "moderation:MODLOG.CHANNEL_DESC",
                required: false,
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText],
            },
        ],
    },

    async messageRun({ message, args }) {
        const input = args[0].toLowerCase();
        let targetChannel;

        if (input === "none" || input === "off" || input === "disable") targetChannel = null;
        else {
            if (message.mentions.channels.size === 0) return message.replyT("");
            targetChannel = message.mentions.channels.first();
        }

        const response = await setChannel(message, targetChannel);
        return message.reply(response);
    },

    async interactionRun({ interaction }) {
        const channel = interaction.options.getChannel("channel");
        const response = await setChannel(interaction, channel);
        return interaction.followUp(response);
    },
};

/**
 * @param {import('discord.js').CommandInteraction|import('discord.js').Message} message
 * @param {import('discord.js').Channel} targetChannel
 */
async function setChannel({ guild }, targetChannel) {
    const settings = await db.getSettings(guild);
    if (!targetChannel && !settings.modlog_channel) {
        return guild.getT("moderation:MODLOG.ALREADY_DISABLED");
    }

    if (targetChannel && !guild.canSendEmbeds(targetChannel)) {
        return guild.getT("moderation:MODLOG.CHANNEL_PERMS");
    }

    settings.modlog_channel = targetChannel?.id;
    await settings.save();

    return targetChannel
        ? guild.getT("moderation:MODLOG.SUCCESS", { channel: targetChannel.toString() })
        : guild.getT("moderation:MODLOG.DISABLED");
}
