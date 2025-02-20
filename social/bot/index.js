const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    baseDir: __dirname,
    dbService: require("../db.service"),
});
