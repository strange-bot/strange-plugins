const path = require("node:path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [giveawaysResp, channelsResp, rolesResp, settings] = await Promise.all([
        req.broadcastOne("getGiveawaysOf", guildId, { guildId }),
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        req.broadcastOne("getRolesOf", guildId, { guildId }),
        db.getSettings(guildId),
    ]);

    const giveaways = giveawaysResp.success ? giveawaysResp.data : [];
    const channels = channelsResp.success ? channelsResp.data : [];
    const roles = rolesResp.success ? rolesResp.data : [];

    res.render(path.join(__dirname, "views/settings.ejs"), {
        giveaways: giveaways || [],
        channels,
        roles,
        settings,
        tabs: [req.translate("giveaways:LIST_TITLE")],
    });
});

router.post("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
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

        await settings.save();
        return res.sendStatus(200);
    }

    // create
    if (Object.prototype.hasOwnProperty.call(body, "create_giveaway")) {
        await req.broadcastOne(
            "giveawayStart",
            {
                guildId: res.locals.guild.id,
                memberId: req.session.user.info.id,
                channelId: body.channel,
                duration: body.duration,
                prize: body.prize,
                winners: body.winners,
                host: body.host,
                member_roles: body.member_roles,
            },
            { guildId },
        );
    }

    // pause
    if (Object.prototype.hasOwnProperty.call(body, "pause_giveaway")) {
        await req.broadcastOne(
            "giveawayPause",
            {
                guildId,
                memberId: req.session.user.info.id,
                message_id: body.message_id,
            },
            { guildId },
        );
    }

    // resume
    if (Object.prototype.hasOwnProperty.call(body, "resume_giveaway")) {
        await req.broadcastOne(
            "giveawayResume",
            {
                guildId,
                memberId: req.session.user.info.id,
                message_id: body.message_id,
            },
            { guildId },
        );
    }

    // end
    if (Object.prototype.hasOwnProperty.call(body, "end_giveaway")) {
        await req.broadcastOne(
            "giveawayEnd",
            {
                guildId,
                memberId: req.session.user.info.id,
                message_id: body.message_id,
            },
            { guildId },
        );
    }

    return res.redirect(`/dashboard/${guildId}/giveaways#giveaways`);
});

module.exports = router;
