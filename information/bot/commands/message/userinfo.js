const userInfo = require("../shared/user");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "userinfo",
    description: "information:INFO.SUB_USER_DESC",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "[@member|id]",
        aliases: ["uinfo", "memberinfo"],
    },

    async messageRun({ message, args }) {
        const target = (await message.guild.resolveMember(args[0])) || message.member;
        const response = userInfo(target);
        await message.reply(response);
    },
};
