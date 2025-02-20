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
    const { settings } = res.locals;
    const body = req.body;

    if (body.xp_channel != settings.xp.channel) {
        settings.xp.channel = body.xp_channel;
    }

    if (body.cooldown && !isNaN(body.cooldown) && body.cooldown != settings.xp.cooldown) {
        settings.xp.cooldown = Number(body.cooldown);
    }

    if (body.xp_message && body.xp_message != settings.xp.message) {
        settings.xp.message = body.xp_message;
    }

    await settings.save();
    res.sendStatus(200);
});

module.exports = router;
