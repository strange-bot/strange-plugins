const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    dependencies: [],
    ownerOnly: true,
    baseDir: __dirname,
});
