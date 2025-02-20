const { BotPlugin } = require("strange-sdk");

module.exports = new BotPlugin({
    dependencies: [],
    baseDir: __dirname,
    dbService: require("../db.service"),
    ipcHandler: {
        // TODO: Temporary logic, will be replaced with a better one in the future
        setGuildLocale: async (payload, client) => {
            const { guildId, locale } = payload;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return [];

            guild.locale = locale;
            return "OK";
        },
    },
});
