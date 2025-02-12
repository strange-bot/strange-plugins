const path = require("path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const channelsResp = await req.broadcast("getChannelsOf", res.locals.guild.id);
    const channels = channelsResp.find((d) => d.success)?.data;

    res.render(path.join(__dirname, "views/settings.ejs"), {
        channels,
    });
});

router.put("/", async (req, res) => {
    const { guild, settings, plugin } = res.locals;
    const body = req.body;

    const xp_ch = body.xp_channel ? guild.channels.cache.get(body.xp_channel)?.id : null;
    if (xp_ch != settings.xp.channel) {
        settings.xp.channel = xp_ch;
    }

    if (body.cooldown && !isNaN(body.cooldown) && body.cooldown != settings.xp.cooldown) {
        settings.xp.cooldown = Number(body.cooldown);
    }

    if (body.xp_message && body.xp_message != settings.xp.message) {
        settings.xp.message = body.xp_message;
    }

    await plugin.updateSettings(guild.id, settings);
    res.sendStatus(200);
});

module.exports = router;
