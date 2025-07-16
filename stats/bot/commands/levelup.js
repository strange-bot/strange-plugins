const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "levelup",
    description: "stats:XP.DESCRIPTION",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
            {
                trigger: "message <new-message>",
                description: "stats:XP.SUB_MESSAGE",
            },
            {
                trigger: "channel <#channel|off>",
                description: "stats:XP.SUB_CHANNEL",
            },
        ],
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "message",
                description: "stats:XP.SUB_MESSAGE",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "message",
                        description: "stats:XP.SUB_MESSAGE_MESSAGE",
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
            {
                name: "channel",
                description: "stats:XP.SUB_CHANNEL",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "stats:XP.SUB_CHANNEL_CHANNEL",
                        type: ApplicationCommandOptionType.Channel,
                        channelTypes: [ChannelType.GuildText],
                        required: true,
                    },
                ],
            },
        ],
    },

    async messageRun({ message, args }) {
        const sub = args[0];
        const subcommandArgs = args.slice(1);
        const settings = await db.getSettings(message.guild);
        let response;

        // message
        if (sub === "message") {
            const msg = subcommandArgs.join(" ");
            response = await setMessage(message.guild, msg, settings);
        }

        // channel
        else if (sub === "channel") {
            const input = subcommandArgs[0];
            let channel;

            if (input === "off") channel = "off";
            else {
                const match = message.guild.findMatchingChannels(input);
                if (match.length === 0) return message.replyT("NO_MATCH_CHANNEL", { query: input });
                channel = match[0];
            }
            response = await setChannel(message.guild, channel, settings);
        }

        // invalid
        else response = message.guild.getT("INVALID_SUBCOMMAND", { sub });
        await message.reply(response);
    },

    async interactionRun({ interaction }) {
        const sub = interaction.options.getSubcommand();
        const settings = await db.getSettings(interaction.guild);
        let response;

        if (sub === "message") {
            response = await setMessage(
                interaction.guild,
                interaction.options.getString("message"),
                settings,
            );
        } else if (sub === "channel") {
            response = await setChannel(
                interaction.guild,
                interaction.options.getChannel("channel"),
                settings,
            );
        } else response = interaction.guild.getT("INVALID_SUBCOMMAND", { sub });

        await interaction.followUp(response);
    },
};

async function setMessage(guild, message, settings) {
    if (!message) return guild.getT("stats:XP.INVALID_MESSAGE");

    settings.xp.message = message;
    await settings.save();

    return guild.getT("stats:XP.MESSAGE_SAVED");
}

async function setChannel(guild, channel, settings) {
    if (!channel) return guild.getT("stats:XP.INVALID_CHANNEL");

    if (channel === "off") settings.xp.channel = null;
    else settings.xp.channel = channel.id;
    await settings.save();

    return guild.getT("stats:XP.CHANNEL_SAVED");
}
