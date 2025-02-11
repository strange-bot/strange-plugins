const { ChannelType } = require("discord.js");
const ems = require("enhanced-ms");

// Subcommands
const start = require("./commands/sub/start");
const pause = require("./commands/sub/pause");
const resume = require("./commands/sub/resume");
const end = require("./commands/sub/end");

module.exports = {
    getGiveawaysOf: async (payload, client) => {
        return client.giveawaysManager.giveaways
            .filter((g) => g.guildId === payload && !g.ended)
            .map((g) => {
                return {
                    prize: g.prize,
                    winnerCount: g.winnerCount,
                    extraData: g.extraData,
                    hostedBy: g.hostedBy,
                    channelId: g.channelId,
                    pauseOptions: g.pauseOptions,
                    messageId: g.messageId,
                    timeRemaining:
                        g.endAt !== Infinity
                            ? ems(g.endAt - Date.now(), { shortFormat: true })
                            : "∞",
                };
            });
    },

    getChannelsOf: async (payload, client) => {
        const guild = client.guilds.cache.get(payload);
        if (!guild) return [];

        return guild.channels.cache
            .filter((channel) => channel.type === ChannelType.GuildText)
            .map((channel) => ({
                id: channel.id,
                name: channel.name,
            }));
    },

    getRolesOf: async (payload, client) => {
        const guild = client.guilds.cache.get(payload);
        if (!guild) return [];

        return guild.roles.cache
            .filter(
                (r) =>
                    r != guild.roles.everyone &&
                    guild.members.me.roles.highest.position > r.position &&
                    !r.managed,
            )
            .map((r) => ({
                id: r.id,
                name: r.name,
            }));
    },

    giveawayStart: async (payload, client) => {
        const guild = client.guilds.cache.get(payload.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(payload.channelId);
        const member = guild.members.cache.get(payload.memberId);

        await start(
            member,
            channel,
            payload.duration,
            payload.prize,
            Number(payload.winners),
            payload.host,
            payload.member_roles,
        );
    },

    giveawayPause: async (payload, client) => {
        const guild = client.guilds.cache.get(payload.guildId);
        if (!guild) return;

        const member = guild.members.cache.get(payload.memberId);
        await pause(member, payload.message_id);
    },

    giveawayResume: async (payload, client) => {
        const guild = client.guilds.cache.get(payload.guildId);
        if (!guild) return;
        const member = guild.members.cache.get(payload.memberId);
        await resume(member, payload.message_id);
    },

    giveawayEnd: async (payload, client) => {
        const guild = client.guilds.cache.get(payload.guildId);
        if (!guild) return;
        const member = guild.members.cache.get(payload.memberId);
        await end(member, payload.message_id);
    },
};
