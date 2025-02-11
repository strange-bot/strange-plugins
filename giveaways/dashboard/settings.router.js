const path = require("node:path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const [giveawaysResp, channelsResp, rolesResp] = await Promise.all([
        req.broadcast("getGiveawaysOf", res.locals.guild.id),
        req.broadcast("getChannelsOf", res.locals.guild.id),
        req.broadcast("getRolesOf", res.locals.guild.id),
    ]);

    const giveaways = giveawaysResp.find((d) => d.success)?.data;
    const channels = channelsResp.find((d) => d.success)?.data;
    const roles = rolesResp.find((d) => d.success)?.data;

    res.render(path.join(__dirname, "views/settings.ejs"), {
        giveaways,
        channels,
        roles,
        tabs: [req.translate("giveaways:LIST_TITLE")],
    });
});

router.post("/", async (req, res) => {
    const { guild, settings, plugin } = res.locals;
    const body = req.body;

    // settings
    if (Object.prototype.hasOwnProperty.call(body, "settings")) {
        if (body.reaction && body.reaction !== settings.reaction) {
            settings.reaction = body.reaction;
        }

        if (body.start_embed_color && body.start_embed_color !== settings.start_embed_color) {
            settings.start_embed_color = body.start_embed_color;
        }

        if (body.end_embed_color && body.end_embed_color !== settings.end_embed_color) {
            settings.end_embed_color = body.end_embed_color;
        }

        await plugin.updateSettings(guild.id, settings);
        return res.sendStatus(200);
    }

    // create
    if (Object.prototype.hasOwnProperty.call(body, "create_giveaway")) {
        await req.broadcast("giveawayStart", {
            guildId: res.locals.guild.id,
            memberId: req.session.user.info.id,
            channelId: body.channel,
            duration: body.duration,
            prize: body.prize,
            winners: body.winners,
            host: body.host,
            member_roles: body.member_roles,
        });
    }

    // pause
    if (Object.prototype.hasOwnProperty.call(body, "pause_giveaway")) {
        await req.broadcast("giveawayPause", {
            guildId: res.locals.guild.id,
            memberId: req.session.user.info.id,
            message_id: body.message_id,
        });
    }

    // resume
    if (Object.prototype.hasOwnProperty.call(body, "resume_giveaway")) {
        await req.broadcast("giveawayResume", {
            guildId: res.locals.guild.id,
            memberId: req.session.user.info.id,
            message_id: body.message_id,
        });
    }

    // end
    if (Object.prototype.hasOwnProperty.call(body, "end_giveaway")) {
        await req.broadcast("giveawayEnd", {
            guildId: res.locals.guild.id,
            memberId: req.session.user.info.id,
            message_id: body.message_id,
        });
    }

    return res.redirect(`/dashboard/${guild.id}/giveaways#giveaways`);
});

module.exports = router;
