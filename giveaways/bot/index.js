const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,

    init: (client) => {
        client.giveawaysManager = require("./giveaway")(client);
    },

    ipcHandler: require("./ipcHandler"),
    dbService: require("../db.service"),
});
