const { ActivityType } = require("discord.js");
const plugin = require("../index");

/**
 * @param {import("discord.js").Client} client
 */
module.exports = async (client) => {
    async function updatePresence(client) {
        const config = await plugin.getConfig();
        let message = config["MESSAGE"];

        if (message.includes("{servers}")) {
            message = message.replaceAll("{servers}", client.guilds.cache.size);
        }

        if (message.includes("{members}")) {
            const members = client.guilds.cache
                .map((g) => g.memberCount)
                .reduce((partial_sum, a) => partial_sum + a, 0);
            message = message.replaceAll("{members}", members);
        }

        const getType = (type) => {
            switch (type) {
                case "COMPETING":
                    return ActivityType.Competing;

                case "LISTENING":
                    return ActivityType.Listening;

                case "PLAYING":
                    return ActivityType.Playing;

                case "WATCHING":
                    return ActivityType.Watching;
            }
        };

        client.logger.debug(`Updating presence with config: ${JSON.stringify(config)}`);
        client.user.setPresence({
            status: config["STATUS"],
            activities: [
                {
                    name: message,
                    type: getType(config["TYPE"]),
                },
            ],
        });
    }

    updatePresence(client);
    setInterval(() => updatePresence(client), 1000 * 60 * 10);
};
