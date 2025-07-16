const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { isValidEmoji, getLanguagesFromEmoji } = require("country-emoji-languages");
const { translate } = require("../utils");
const { MiscUtils, EmbedUtils } = require("strange-sdk/utils");
const data = require("../../data.json");
const db = require("../../db.service");

/**
 * @param {import('discord.js').MessageReaction|import('discord.js').PartialMessageReaction} reaction
 * @param {import('discord.js').User|import('discord.js').PartialUser} user
 */
module.exports = async (reaction, user) => {
    if (!reaction.message.guild) return;
    const settings = await db.getSettings(reaction.message.guild);
    if (!settings.flag_translation) return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (ex) {
            return; // Failed to fetch message (maybe deleted)
        }
    }
    if (user.partial) await user.fetch();
    if (user.bot) return;

    const { message, emoji } = reaction;

    if (emoji.id || !message.content || !isValidEmoji(emoji.name)) return;

    // cooldown check
    const remaining = await db.getCooldown(user);
    if (remaining > 0) {
        return message.channel.send(
            message.guild.getT("translation:TR_COOLDOWN", {
                user: user.username,
                time: MiscUtils.timeformat(remaining),
            }),
            5,
        );
    }

    if (await db.isTranslated(message, emoji)) return;

    const languages = getLanguagesFromEmoji(emoji.name);

    // filter languages for which google translation is available
    const targetCodes = languages.filter(
        (language) => data.GOOGLE_TRANSLATE[language] !== undefined,
    );
    if (targetCodes.length === 0) return;

    // remove english if there are other language codes
    if (targetCodes.length > 1 && targetCodes.includes("en")) {
        targetCodes.splice(targetCodes.indexOf("en"), 1);
    }

    let src;
    let desc = "";
    let translated = 0;
    for (const tc of targetCodes) {
        const response = await translate(message.content, tc);
        if (!response) continue;
        src = response.inputLang;
        desc += `**${response.outputLang}:**\n${response.output}\n\n`;
        translated += 1;
    }

    if (translated === 0) return;

    const btnRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
            url: message.url,
            label: message.guild.getT("translation:TR_BTN_LABEL"),
            style: ButtonStyle.Link,
        }),
    );

    const embed = EmbedUtils.embed()
        .setAuthor({ name: message.guild.getT("translation:TR_EMBED_TITLE", { lng: src }) })
        .setDescription(desc)
        .setFooter({
            text: message.guild.getT("translation:TR_EMBED_FOOTER", { user: user.username }),
            iconURL: user.displayAvatarURL(),
        });

    message.channel.send({ embeds: [embed], components: [btnRow] }).then(
        () => db.addCooldown(Date.now()), // set cooldown
    );

    db.logTranslation(message, emoji);
};
