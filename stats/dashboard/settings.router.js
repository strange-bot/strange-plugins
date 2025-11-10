const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [channelsResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        db.getSettings(guildId),
    ]);
    const channels = channelsResp.success ? channelsResp.data : [];

    res.render(path.join(__dirname, "views/settings.ejs"), {
        channels,
        settings,
    });
});

router.put("/", async (req, res) => {
    const settings = await db.getSettings(res.locals.guild);
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
