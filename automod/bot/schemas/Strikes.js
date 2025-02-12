const FixedSizeMap = require("fixedsize-map");

const plugin = require("../index");
const Model = plugin.getModel("strikes");

const cache = new FixedSizeMap(10000);

module.exports = {
    getMember: async (guildId, memberId) => {
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
};
