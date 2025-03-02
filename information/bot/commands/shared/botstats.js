const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { MiscUtils, EmbedUtils } = require("strange-sdk/utils");
const { stripIndent } = require("common-tags");

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
module.exports = async ({ client, guild }) => {
    const coreConfig = await client.pluginManager.getPlugin("core").getConfig();
    const isSharded = !!client.shard;

    let totalGuilds = 0;
    let totalChannels = 0;
    let totalUsers = 0;
    let avgPing = 0;
    let totalShards = isSharded ? client.shard.count : 1;

    if (isSharded) {
        // Fetch data from all shards
        const shardData = await client.shard.fetchClientValues("guilds.cache.size");
        const channelData = await client.shard.fetchClientValues("channels.cache.size");
        const guildData = await client.shard.broadcastEval((c) =>
            c.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
        );
        const pingData = await client.shard.fetchClientValues("ws.ping");

        // Calculate totals
        totalGuilds = shardData.reduce((acc, guildCount) => acc + guildCount, 0);
        totalChannels = channelData.reduce((acc, channelCount) => acc + channelCount, 0);
        totalUsers = guildData.reduce((acc, memberCount) => acc + memberCount, 0);
        avgPing = Math.round(pingData.reduce((acc, ping) => acc + ping, 0) / pingData.length);
    } else {
        // Fallback to non-sharded stats
        totalGuilds = client.guilds.cache.size;
        totalChannels = client.channels.cache.size;
        totalUsers = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
        avgPing = client.ws.ping;
    }

    // CPU
    const cpuUsage = `${((process.cpuUsage().system + process.cpuUsage().user) / 1000000).toFixed(2)}%`;

    // RAM calculations
    let averageRamUsage = 0;
    let totalRamUsed = 0;
    let totalRamAvailable = 0;

    if (isSharded) {
        // Get RAM usage from all shards
        const memoryData = await client.shard.broadcastEval(() => ({
            used: process.memoryUsage().heapUsed / 1024 / 1024,
            total: process.memoryUsage().heapTotal / 1024 / 1024,
            rss: process.memoryUsage().rss / 1024 / 1024,
        }));

        // Calculate total and average RAM usage
        totalRamUsed = memoryData.reduce((acc, mem) => acc + mem.used, 0);
        const totalRamTotal = memoryData.reduce((acc, mem) => acc + mem.total, 0);

        averageRamUsage = (totalRamUsed / totalShards).toFixed(2);
        totalRamUsed = totalRamUsed.toFixed(2);

        // Use the total heap for all shards as available RAM
        totalRamAvailable = totalRamTotal.toFixed(2);

        // Alternatively, if you want to show system RAM
        // const systemMemory = os.totalmem() / 1024 / 1024;
        // totalRamAvailable = systemMemory.toFixed(2);
    } else {
        const ramUsed = process.memoryUsage().heapUsed / 1024 / 1024;
        const ramTotal = process.memoryUsage().heapTotal / 1024 / 1024;

        averageRamUsage = ramUsed.toFixed(2);
        totalRamUsed = ramUsed.toFixed(2);
        totalRamAvailable = ramTotal.toFixed(2);
    }

    // Description for embed
    let desc = "";
    desc += `❒ ${guild.getT("information:BOT.STATS_TOTAL_SHARDS")}: ${totalShards}\n`;
    desc += `❒ ${guild.getT("information:BOT.STATS_GUILD_COUNT", { count: totalGuilds })}\n`;
    desc += `❒ ${guild.getT("information:BOT.STATS_USER_COUNT", { count: totalUsers })}\n`;
    desc += `❒ ${guild.getT("information:BOT.STATS_CHANNEL_COUNT", { count: totalChannels })}\n`;
    desc += `❒ ${guild.getT("information:BOT.STATS_AVG_PING", { ping: avgPing })}\n`;
    desc += "\n";

    const embed = EmbedUtils.embed()
        .setTitle(guild.getT("information:BOT.STATS_EMBED_TITLE"))
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(desc)
        .addFields(
            {
                name: guild.getT("information:BOT.STATS_USAGE_INFO"),
                value: stripIndent`
                ❯ **${guild.getT("information:BOT.STATS_CPU_USAGE")}:** ${cpuUsage}
                ❯ **${guild.getT("information:BOT.STATS_RAM_USAGE")}:** ${averageRamUsage} MB / ${totalRamAvailable} MB
                `,
                inline: true,
            },
            {
                name: guild.getT("information:BOT.STATS_VERSION_INFO"),
                value: stripIndent`
                ❯ **${guild.getT("information:BOT.STATS_NODE_VERSION")}:** ${process.versions.node}
                ❯ **${guild.getT("information:BOT.STATS_DISCORD_VERSION")}:** ${require("discord.js").version}
                ❯ **${guild.getT("information:BOT.STATS_UPTIME")}:** ${MiscUtils.timeformat(process.uptime())}
                `,
                inline: false,
            },
        );

    // Buttons
    let components = [];
    components.push(
        new ButtonBuilder()
            .setLabel(guild.getT("information:BOT.STATS_BTN_INVITE"))
            .setURL(client.getInvite())
            .setStyle(ButtonStyle.Link),
    );

    if (coreConfig["SUPPORT_SERVER"]) {
        components.push(
            new ButtonBuilder()
                .setLabel(guild.getT("information:BOT.STATS_BTN_SUPPORT"))
                .setURL(coreConfig["SUPPORT_SERVER"])
                .setStyle(ButtonStyle.Link),
        );
    }

    let buttonsRow = new ActionRowBuilder().addComponents(components);

    return { embeds: [embed], components: [buttonsRow] };
};
