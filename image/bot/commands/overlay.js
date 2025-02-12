const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { HttpUtils } = require("strange-sdk/utils");
const { getImageFromMessage } = require("../utils");
const plugin = require("../index");

const availableOverlays = [
    "approved",
    "brazzers",
    "gay",
    "halloween",
    "rejected",
    "thuglife",
    "to-be-continued",
    "wasted",
];

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "overlay",
    description: "image:OVERLAY_DESCRIPTION",
    cooldown: 5,
    botPermissions: ["EmbedLinks", "AttachFiles"],
    command: {
        enabled: true,
        aliases: availableOverlays,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "name",
                description: "image:OVERLAY_NAME",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: availableOverlays.map((overlay) => ({ name: overlay, value: overlay })),
            },
            {
                name: "user",
                description: "image:OVERLAY_USER",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
            {
                name: "link",
                description: "image:OVERLAY_LINK",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },

    async messageRun({ message, args, invoke }) {
        const image = await getImageFromMessage(message, args);
        const config = await plugin.getConfig();
        const { STRANGE_API_URL, STRANGE_API_KEY, EMBED_COLOR } = config;

        // use invoke as an endpoint
        const url = getOverlay(invoke.toLowerCase(), image, STRANGE_API_URL);
        const response = await HttpUtils.getBuffer(url, {
            headers: {
                Authorization: `Bearer ${STRANGE_API_KEY}`,
            },
        });

        if (!response.success) return message.replyT("image:OVERLAY_FAIL");

        const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setImage("attachment://attachment.png")
            .setFooter({
                text: message.guild.getT("REQUESTED_BY", { user: message.author.username }),
            });

        await message.reply({ embeds: [embed], files: [attachment] });
    },

    async interactionRun({ interaction }) {
        const { author, guild } = interaction;

        const user = interaction.options.getUser("user");
        const imageLink = interaction.options.getString("link");
        const filter = interaction.options.getString("name");
        const config = await plugin.getConfig();

        const { STRANGE_API_URL, STRANGE_API_KEY, EMBED_COLOR } = config;

        let image;
        if (user) image = user.displayAvatarURL({ size: 256, extension: "png" });
        if (!image && imageLink) image = imageLink;
        if (!image) image = author.displayAvatarURL({ size: 256, extension: "png" });

        const url = getOverlay(filter, image, STRANGE_API_URL);
        const response = await HttpUtils.getBuffer(url, {
            headers: {
                Authorization: `Bearer ${STRANGE_API_KEY}`,
            },
        });

        if (!response.success) return interaction.followUp(guild.getT("image:OVERLAY_FAIL"));

        const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setImage("attachment://attachment.png")
            .setFooter({ text: guild.getT("REQUESTED_BY", { user: author.username }) });

        await interaction.followUp({ embeds: [embed], files: [attachment] });
    },
};

function getOverlay(filter, image, STRANGE_API_URL) {
    const endpoint = new URL(`${STRANGE_API_URL}/overlays/${filter}`);
    endpoint.searchParams.append("image", image);
    return endpoint.href;
}
