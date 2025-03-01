const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EmbedUtils } = require("strange-sdk/utils");

module.exports = async ({ client, guild }) => {
    const coreConfig = await client.pluginManager.getPlugin("core").getConfig();

    const embed = EmbedUtils.embed()
        .setAuthor({ name: guild.getT("information:BOT.INVITE_EMBED_TITLE") })
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(guild.getT("information:BOT.INVITE_EMBED_DESC"));

    // Buttons
    let components = [];
    components.push(
        new ButtonBuilder()
            .setLabel(guild.getT("information:BOT.INVITE_BTN_LABEL"))
            .setURL(client.getInvite())
            .setStyle(ButtonStyle.Link),
    );

    if (coreConfig["SUPPORT_SERVER"]) {
        components.push(
            new ButtonBuilder()
                .setLabel(guild.getT("information:BOT.INVITE_BTN_SUPPORT"))
                .setURL(coreConfig["SUPPORT_SERVER"])
                .setStyle(ButtonStyle.Link),
        );
    }

    let buttonsRow = new ActionRowBuilder().addComponents(components);
    return { embeds: [embed], components: [buttonsRow] };
};
