const { EmbedBuilder } = require("discord.js");

/**
 * @param {string} content
 * @param {import('discord.js').GuildMember} member
 * @param {Object} inviterData
 */
const parse = async (content, member, inviterData = {}) => {
    if (!content) return "";
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

    const embed = new EmbedBuilder();
    let hasEmbed = false;

    if (config.embed.title) {
        embed.setTitle(config.embed.title);
        hasEmbed = true;
    }
    if (config.embed.description) {
        const parsed = await parse(config.embed.description, member, inviterData);
        embed.setDescription(parsed);
        hasEmbed = true;
    }
    if (config.embed.color) {
        embed.setColor(config.embed.color);
    }
    if (config.embed.thumbnail) {
        embed.setThumbnail(member.user.displayAvatarURL());
        hasEmbed = true;
    }
    if (config.embed.footer?.text) {
        const parsed = await parse(config.embed.footer.text, member, inviterData);
        if (parsed !== "") {
            embed.setFooter({ text: parsed, iconURL: config.embed.footer.iconURL || null });
            hasEmbed = true;
        }
    }
    if (config.embed.image) {
        const parsed = await parse(config.embed.image, member);
        embed.setImage(parsed);
        hasEmbed = true;
    }
    if (config.embed.author?.name) {
        embed.setAuthor({
            name: config.embed.author.name,
            iconURL: config.embed.author.iconURL || null,
        });
        hasEmbed = true;
    }
    if (
        config.embed.fields &&
        Array.isArray(config.embed.fields) &&
        config.embed.fields.length > 0
    ) {
        config.embed.fields.forEach((field) => {
            embed.addFields({ name: field.name, value: field.value, inline: field.inline });
        });
        hasEmbed = true;
    }
    if (config.embed.timestamp) {
        embed.setTimestamp();
        hasEmbed = true;
    }

    // set default message if no content or embed provided
    if (!content && !hasEmbed) {
        content =
            type === "WELCOME"
                ? `Welcome to the server, ${member.displayName} 🎉`
                : `${member.user.username} has left the server 👋`;
        return { content };
    }

    // return appropriate response based on what was configured
    const response = {};
    if (content) response.content = content;
    if (hasEmbed) response.embeds = [embed];

    return response;
};

module.exports = {
    parse,
    buildGreeting,
};
