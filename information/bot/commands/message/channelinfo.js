const channelInfo = require("../shared/channel");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "channelinfo",
    description: "information:INFO.SUB_CHANNEL_DESC",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "[#channel|id]",
        aliases: ["chinfo"],
    },

    async messageRun({ message, args }) {
        let targetChannel;

        if (message.mentions.channels.size > 0) {
            targetChannel = message.mentions.channels.first();
        }

        // find channel by name/ID
        else if (args.length > 0) {
            const search = args.join(" ");
            const tcByName = message.guild.findMatchingChannels(search);
            if (tcByName.length === 0)
                return message.reply(`No channels found matching \`${search}\`!`);
            if (tcByName.length > 1)
                return message.reply(`Multiple channels found matching \`${search}\`!`);
            [targetChannel] = tcByName;
        } else {
            targetChannel = message.channel;
        }

        const response = channelInfo(targetChannel);
        await message.reply(response);
    },
};
