const { ApplicationCommandOptionType } = require("discord.js");
const { EmbedUtils } = require("strange-sdk/utils");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "stats",
    description: "stats:STATS.DESCRIPTION",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "[@member|id]",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "user",
                description: "stats:STATS.USER_DESC",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ],
    },

    async messageRun({ message, args }) {
        const target = (await message.guild.resolveMember(args[0])) || message.member;
        const response = await stats(target);
        await message.reply(response);
    },

    async interactionRun({ interaction }) {
        const member = interaction.options.getMember("user") || interaction.member;
        const response = await stats(member);
        await interaction.followUp(response);
    },
};

/**
 * @param {import('discord.js').GuildMember} member
 */
async function stats(member) {
    const guild = member.guild;

    const memberStats = await db.getMemberStats(member.guild.id, member.id);
    const embed = EmbedUtils.embed()
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            {
                name: guild.getT("stats:STATS.NAME"),
                value: member.user.username,
                inline: true,
            },
            {
                name: guild.getT("stats:STATS.ID"),
                value: member.id,
                inline: true,
            },
            {
                name: guild.getT("stats:STATS.CREATED_AT"),
                value: member.joinedAt.toLocaleString(),
                inline: false,
            },
            {
                name: guild.getT("stats:STATS.MESSAGE_STATS_TITLE"),
                value: guild.getT("stats:STATS.MESSAGE_STATS", {
                    count: memberStats.messages,
                    prefix: memberStats.commands.prefix,
                    slash: memberStats.commands.slash,
                    xp: memberStats.xp,
                    level: memberStats.level,
                }),
                inline: false,
            },
            {
                name: guild.getT("stats:STATS.VOICE_STATS_TITLE"),
                value: guild.getT("stats:STATS.VOICE_STATS", {
                    connections: memberStats.voice.connections,
                    time: Math.floor(memberStats.voice.time / 60),
                }),
            },
        )
        .setFooter({ text: guild.getT("stats:STATS.FOOTER") })
        .setTimestamp();

    return { embeds: [embed] };
}
