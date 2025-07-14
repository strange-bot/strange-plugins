const { BotPlugin } = require("strange-sdk");
const { cleanupCache } = require("./utils");

module.exports = new BotPlugin({
    baseDir: __dirname,

    onEnable: (_client) => {
        cleanupCache();
    },

    dbService: require("../db.service"),
});
