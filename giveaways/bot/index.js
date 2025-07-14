const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,

    onEnable: (client) => {
        client.giveawaysManager = require("./giveaway")(client);
    },

    dbService: require("../db.service"),
});
