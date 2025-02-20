const db = require("../../db.service");

/**
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel && !newChannel) return;
    if (!newState.member) return;

    const now = Date.now();
    const member = await newState.member.fetch().catch(() => {});
    if (!member || member.user.bot) return;

    // Member joined a voice channel
    if (!oldChannel && newChannel) {
        const statsDb = await db.getMemberStats(member.guild.id, member.id);
        statsDb.voice.connections += 1;
        await statsDb.save();
        await db.saveVoiceState(member, now);
    }

    // Member left a voice channel
    if (oldChannel && !newChannel) {
        const statsDb = await db.getMemberStats(member.guild.id, member.id);
        const cachedState = await db.getVoiceState(member);
        if (cachedState) {
            const time = now - Number(cachedState);
            statsDb.voice.time += time / 1000; // add time in seconds

            // Save Logs to DB
            await statsDb.save();

            await db.getModel("voice-logs").create({
                guild_id: member.guild.id,
                channel_id: oldChannel.id,
                member_id: member.id,
                connected_at: cachedState,
                disconnected_at: now,
                connection_time: time,
            });
            await db.deleteVoiceState(member);
        }
    }

    // TODO: Check this logic
    // Member switched voice channels
    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        const cachedState = await db.getVoiceState(member);
        if (cachedState) {
            const time = now - Number(cachedState);

            // Save Logs to DB
            const statsDb = await db.getMemberStats(member.guild.id, member.id);
            statsDb.voice.time += time / 1000; // add time in seconds
            await statsDb.save();

            await db.getModel("voice-logs").create({
                guild_id: member.guild.id,
                channel_id: oldChannel.id,
                member_id: member.id,
                connected_at: cachedState,
                disconnected_at: now,
                connection_time: time,
            });

            await db.saveVoiceState(member, now);
        }
    }
};
