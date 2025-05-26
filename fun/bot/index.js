const { BotPlugin } = require("strange-sdk");
const { DiscordTogether } = require("discord-together");

module.exports = new BotPlugin({
    icon: "fa-solid fa-face-grin-tears",
    dependencies: [],
    baseDir: __dirname,

    onEnable: (client) => {
        client.discordTogether = new DiscordTogether(client);
    },
});
