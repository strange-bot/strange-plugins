const { EmbedBuilder } = require("discord.js");

/**
 * @param {string} content
 * @param {import('discord.js').GuildMember} member
 * @param {Object} inviterData
 */
const parse = async (content, member, inviterData = {}) => {
    const inviteData = {};

    const getEffectiveInvites = (inviteData = {}) =>
        inviteData.tracked + inviteData.added - inviteData.fake - inviteData.left || 0;

    if (content.includes("{inviter:")) {
        const inviterId = inviterData.member_id || "NA";
        if (inviterId !== "VANITY" && inviterId !== "NA") {
            try {
                const inviter = await member.client.users.fetch(inviterId);
                inviteData.name = inviter.username;
                inviteData.tag = inviter.tag;
            } catch (ex) {
                member.client.logger.error(`Parsing inviterId: ${inviterId}`, ex);
                inviteData.name = "NA";
                inviteData.tag = "NA";
            }
        } else if (member.user.bot) {
            inviteData.name = "OAuth";
            inviteData.tag = "OAuth";
        } else {
            inviteData.name = inviterId;
            inviteData.tag = inviterId;
        }
    }
    return content
        .replaceAll(/\\n/g, "\n")
        .replaceAll(/{server}/g, member.guild.name)
        .replaceAll(/{count}/g, member.guild.memberCount)
        .replaceAll(/{member:nick}/g, member.displayName)
        .replaceAll(/{member:name}/g, member.user.username)
        .replaceAll(/{member:dis}/g, member.user.discriminator)
        .replaceAll(/{member:tag}/g, member.user.tag)
        .replaceAll(/{member:mention}/g, member.toString())
        .replaceAll(/{member:avatar}/g, member.displayAvatarURL())
        .replaceAll(/{inviter:name}/g, inviteData.name)
        .replaceAll(/{inviter:tag}/g, inviteData.tag)
        .replaceAll(/{invites}/g, getEffectiveInvites(inviterData.invite_data));
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {"WELCOME"|"FAREWELL"} type
 * @param {Object} config
 * @param {Object} inviterData
 */
const buildGreeting = async (member, type, config, inviterData) => {
    if (!config) return;
    let content;

    // build content
    if (config.content) content = await parse(config.content, member, inviterData);

    // build embed
    const embed = new EmbedBuilder();
    if (config.embed.title) embed.setTitle(config.embed.title);
    if (config.embed.description) {
        const parsed = await parse(config.embed.description, member, inviterData);
        embed.setDescription(parsed);
    }
    if (config.embed.color) embed.setColor(config.embed.color);
    if (config.embed.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
    if (config.embed.footer) {
        const parsed = await parse(config.embed.footer.text, member, inviterData);
        embed.setFooter({ text: parsed, iconURL: config.embed.footer.iconURL || null });
    }
    if (config.embed.image) {
        const parsed = await parse(config.embed.image, member);
        embed.setImage(parsed);
    }
    if (config.embed.author) {
        embed.setAuthor({
            name: config.embed.author.name,
            iconURL: config.embed.author_icon || null,
        });
    }
    if (config.embed.fields && Array.isArray(config.embed.fields)) {
        config.embed.fields.forEach((field) => {
            embed.addFields({ name: field.name, value: field.value, inline: field.inline });
        });
    }
    if (config.embed.timestamp) embed.setTimestamp();

    // set default message
    if (!config.content && !config.embed.description && !config.embed.footer) {
        content =
            type === "WELCOME"
                ? `Welcome to the server, ${member.displayName} 🎉`
                : `${member.user.username} has left the server 👋`;
        return { content };
    }

    return { content, embeds: [embed] };
};

module.exports = {
    parse,
    buildGreeting,
};
