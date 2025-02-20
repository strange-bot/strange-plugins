const path = require("path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const [channelsResp, rolesResp] = await Promise.all([
        req.broadcast("getChannelsOf", res.locals.guild.id),
        req.broadcast("getRolesOf", res.locals.guild.id),
    ]);
    const channels = channelsResp.find((d) => d.success)?.data;
    const roles = rolesResp.find((d) => d.success)?.data;

    res.render(path.join(__dirname, "views/settings.ejs"), {
        channels,
        roles,
    });
});

router.put("/", async (req, res) => {
    const { settings } = res.locals;
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
