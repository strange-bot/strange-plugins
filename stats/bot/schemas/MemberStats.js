const FixedSizeMap = require("fixedsize-map");
const cache = new FixedSizeMap(10000);

const plugin = require("../index");
const Model = plugin.getModel("member-stats");

module.exports = {
    getMemberStats: async (guildId, memberId) => {
        const key = `${guildId}|${memberId}`;
        if (cache.contains(key)) return cache.get(key);

        let member = await Model.findOne({ guild_id: guildId, member_id: memberId });
        if (!member) {
            member = new Model({
                guild_id: guildId,
                member_id: memberId,
            });
        }

        cache.add(key, member);
        return member;
    },

    getXpLb: async (guildId, limit = 10) =>
        Model.find({
            guild_id: guildId,
        })
            .limit(limit)
            .sort({ level: -1, xp: -1 })
            .lean(),
};
