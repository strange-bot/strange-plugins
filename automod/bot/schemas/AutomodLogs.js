const plugin = require("../index");
const Model = plugin.getModel("automod-logs");

module.exports = {
    addAutoModLogToDb: async (member, content, reason, strikes) => {
        if (!member) throw new Error("Member is undefined");
        await new Model({
            guild_id: member.guild.id,
            member_id: member.id,
            content,
            reason,
            strikes,
        }).save();
    },
};
