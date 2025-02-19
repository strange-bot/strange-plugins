const { EmbedUtils } = require("strange-sdk/utils");

/**
 * @type {import('strange-sdk').CommandType}
 */
module.exports = {
    name: "ping",
    description: "core:PING.DESCRIPTION",
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [],
    },

    async messageRun({ message }) {
        const now = Date.now();
        const guild = message.guild;

        const messageLatency = Math.max(0, (message.received_at || now) - message.createdTimestamp);
        const responseTime = Math.max(0, now - (message.received_at || now));
        const apiPing = Math.max(0, Math.floor(message.client.ws.ping));

        const embed = EmbedUtils.embed()
            .setTitle(guild.getT("core:PING.TITLE"))
            .addFields(
                {
                    name: guild.getT("core:PING.MESSAGE_LATENCY"),
                    value: `\`${messageLatency}ms\``,
                    inline: true,
                },
                {
                    name: guild.getT("core:PING.RESPONSE_TIME"),
                    value: `\`${responseTime}ms\``,
                    inline: true,
                },
                {
                    name: guild.getT("core:PING.API_LATENCY"),
                    value: `\`${apiPing}ms\``,
                    inline: true,
                },
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async interactionRun({ interaction }) {
        const apiPing = Math.floor(interaction.client.ws.ping);
        const embed = EmbedUtils.embed()
            .setTitle(interaction.guild.getT("core:PING.TITLE"))
            .addFields({
                name: interaction.guild.getT("core:PING.API_LATENCY"),
                value: `\`${apiPing}ms\``,
                inline: true,
            })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    },
};
