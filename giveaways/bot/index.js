const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    icon: "fa-solid fa-gift",
    dependencies: [],
    baseDir: __dirname,

    init(client) {
        client.giveawaysManager = require("./giveaway")(client, this);
    },

    ipcHandler: require("./ipcHandler"),
});
