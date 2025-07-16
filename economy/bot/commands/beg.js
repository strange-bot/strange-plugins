const { EmbedUtils } = require("strange-sdk/utils");
const db = require("../../db.service");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "beg",
    description: "economy:BEG.DESCRIPTION",
    cooldown: 12 * 60 * 60,
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
    },

    async messageRun({ message }) {
        const response = await beg(message.guild, message.author);
        await message.reply(response);
    },

    async interactionRun({ interaction }) {
        const response = await beg(interaction.guild, interaction.user);
        await interaction.followUp(response);
    },
};

async function beg(guild, user) {
    const settings = await db.getSettings(guild);
    let users = [
        "PewDiePie",
        "T-Series",
        "Sans",
        "RLX",
        "Pro Gamer 711",
        "Zenitsu",
        "Jake Paul",
        "Kaneki Ken",
        "KSI",
        "Naruto",
        "Mr. Beast",
        "Ur Mom",
        "A Broke Person",
        "Giyu Tomiaka",
        "Bejing Embacy",
        "A Random Asian Mom",
        "Ur Step Sis",
        "Jin Mori",
        "Sakura (AKA Trash Can)",
        "Hammy The Hamster",
        "Kakashi Sensei",
        "Minato",
        "Tanjiro",
        "ZHC",
        "The IRS",
        "Joe Mama",
    ];

    let amount = Math.floor(
        Math.random() * `${settings.max_beg_amount}` + `${settings.min_beg_amount}`,
    );
    const userDb = await db.getUser(user);
    userDb.coins += amount;
    await userDb.save();

    const embed = EmbedUtils.embed()
        .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL() })
        .setDescription(
            guild.getT("economy:BEG.SUCCESS", {
                random: users[Math.floor(Math.random() * users.length)],
                amount,
                coins: userDb.coins,
                currency: settings.currency,
            }),
        );

    return { embeds: [embed] };
}
