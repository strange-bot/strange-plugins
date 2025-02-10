const { BotPlugin } = require("strange-sdk");

const plugin = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,
});

module.exports = plugin;
