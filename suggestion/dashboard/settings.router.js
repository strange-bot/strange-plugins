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
    const { settings, guild, plugin } = res.locals;
    const body = req.body;

    // settings
    if (body.upvote_emoji && body.upvote_emoji !== settings.upvote_emoji) {
        settings.upvote_emoji = body.upvote_emoji;
    }

    if (body.downvote_emoji && body.downvote_emoji !== settings.downvote_emoji) {
        settings.downvote_emoji = body.downvote_emoji;
    }

    if (body.default_ch) {
        const ch = guild.channels.cache.get(body.default_ch);
        if (!ch) return res.status(400).send("Invalid channel ID");
        settings.channel_id = ch.id;
    }

    if (body.default_embed && body.default_embed !== settings.default_embed) {
        settings.default_embed = body.default_embed;
    }

    if (body.approved_ch) {
        const ch = guild.channels.cache.get(body.approved_ch);
        if (!ch) return res.status(400).send("Invalid channel ID");
        settings.approved_channel = ch.id;
    }

    if (body.approved_embed && body.approved_embed !== settings.approved_embed) {
        settings.approved_embed = body.approved_embed;
    }

    if (body.rejected_ch) {
        const ch = guild.channels.cache.get(body.rejected_ch);
        if (!ch) return res.status(400).send("Invalid channel ID");
        settings.rejected_channel = ch.id;
    }

    if (body.rejected_embed && body.rejected_embed !== settings.rejected_embed) {
        settings.rejected_embed = body.rejected_embed;
    }

    if (body.staff_roles) {
        body.staff_roles = Array.isArray(body.staff_roles) ? body.staff_roles : [body.staff_roles];
        const validRoles = body.staff_roles.filter((r) => guild.roles.cache.has(r));
        settings.staff_roles = validRoles;
    }

    await plugin.updateSettings(guild.id, settings);
    res.sendStatus(200);
});

module.exports = router;
