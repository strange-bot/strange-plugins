const { EmbedUtils } = require("strange-sdk/utils");
const db = require("../../../db.service");

module.exports = async (guild, user) => {
    const [settings, economy] = await Promise.all([db.getSettings(guild), db.getUser(user)]);

    const embed = EmbedUtils.embed()
        .setAuthor({ name: user.username })
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            {
                name: guild.getT("economy:BANK.WALLET"),
                value: `${economy?.coins || 0}${settings.currency}`,
                inline: true,
            },
            {
                name: guild.getT("economy:BANK.BANK"),
                value: `${economy?.bank || 0}${settings.currency}`,
                inline: true,
            },
            {
                name: guild.getT("economy:BANK.NET"),
                value: `${(economy?.coins || 0) + (economy?.bank || 0)}${settings.currency}`,
                inline: true,
            },
        );

    return { embeds: [embed] };
};
