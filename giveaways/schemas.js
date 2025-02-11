const { SchemaTypes } = require("mongoose");

module.exports = (config) => ({
    settings: {
        enabled: {
            type: Boolean,
            default: true,
        },
        reaction: {
            type: String,
            default: config["DEFAULT_EMOJI"],
        },
        start_embed_color: {
            type: String,
            default: config["START_EMBED_COLOR"],
        },
        end_embed_color: {
            type: String,
            default: config["END_EMBED_COLOR"],
        },
    },

    giveaways: {
        messageId: String,
        channelId: String,
        guildId: String,
        startAt: Number,
        endAt: Number,
        ended: Boolean,
        winnerCount: Number,
        prize: String,
        messages: {
            giveaway: String,
            giveawayEnded: String,
            inviteToParticipate: String,
            drawing: String,
            dropMessage: String,
            winMessage: SchemaTypes.Mixed,
            embedFooter: SchemaTypes.Mixed,
            noWinner: String,
            winners: String,
            endedAt: String,
            hostedBy: String,
        },
        thumbnail: String,
        hostedBy: String,
        winnerIds: { type: [String], default: undefined },
        reaction: SchemaTypes.Mixed,
        botsCanWin: Boolean,
        embedColor: SchemaTypes.Mixed,
        embedColorEnd: SchemaTypes.Mixed,
        exemptPermissions: { type: [], default: undefined },
        exemptMembers: String,
        bonusEntries: String,
        extraData: SchemaTypes.Mixed,
        lastChance: {
            enabled: Boolean,
            content: String,
            threshold: Number,
            embedColor: SchemaTypes.Mixed,
        },
        pauseOptions: {
            isPaused: Boolean,
            content: String,
            unPauseAfter: Number,
            embedColor: SchemaTypes.Mixed,
            durationAfterPause: Number,
        },
        isDrop: Boolean,
        allowedMentions: {
            parse: { type: [String], default: undefined },
            users: { type: [String], default: undefined },
            roles: { type: [String], default: undefined },
        },
    },
});
