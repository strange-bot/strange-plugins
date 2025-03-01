/**
 * @param {import('discord.js').Client} client
 */
module.exports = async (client) => {
    client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.logger.info(`Serving ${client.guilds.cache.size} servers`);

    // Set language on client, guilds (TODO: Better logic in the future)
    const config = await client.coreConfig();
    client.defaultLanguage = config["LOCALE"]["DEFAULT"];
    for (const guild of client.guilds.cache.values()) {
        const settings = await guild.getSettings("core");
        guild.locale = settings.locale || client.defaultLanguage;
    }

    // Register Interactions
    client.wait(5000).then(() => {
        client.guilds.cache.forEach(async (guild) => {
            await client.commandManager.registerInteractions(guild.id);
        });

        client.logger.success("Successfully registered interactions");
    });
};
