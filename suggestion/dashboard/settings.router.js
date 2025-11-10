const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [channelsResp, rolesResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        req.broadcastOne("getRolesOf", guildId),
        db.getSettings(guildId),
    ]);
    const channels = channelsResp.success ? channelsResp.data : [];
    const roles = rolesResp.success ? rolesResp.data : [];

    res.render(path.join(__dirname, "views/settings.ejs"), {
        channels,
        roles,
        settings,
    });
});

router.put("/", async (req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    const body = req.body;

    // settings
    if (body.upvote_emoji && body.upvote_emoji !== settings.upvote_emoji) {
        settings.upvote_emoji = body.upvote_emoji;
    }

    if (body.downvote_emoji && body.downvote_emoji !== settings.downvote_emoji) {
        settings.downvote_emoji = body.downvote_emoji;
    }

    if (body.default_ch && body.default_ch !== settings.channel_id) {
        settings.channel_id = body.default_ch;
    }

    if (body.default_embed && body.default_embed !== settings.default_embed) {
        settings.default_embed = body.default_embed;
    }

    if (body.approved_ch && body.approved_ch !== settings.approved_channel) {
        settings.approved_channel = body.approved_ch;
    }

    if (body.approved_embed && body.approved_embed !== settings.approved_embed) {
        settings.approved_embed = body.approved_embed;
    }

    if (body.rejected_ch && body.rejected_ch !== settings.rejected_channel) {
        settings.rejected_channel = body.rejected_ch;
    }

    if (body.rejected_embed && body.rejected_embed !== settings.rejected_embed) {
        settings.rejected_embed = body.rejected_embed;
    }

    if (body.staff_roles) {
        body.staff_roles = Array.isArray(body.staff_roles) ? body.staff_roles : [body.staff_roles];
        settings.staff_roles = body.staff_roles;
    }

    await settings.save();
    res.sendStatus(200);
});

module.exports = router;
