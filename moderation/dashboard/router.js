const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [ipcResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        db.getSettings(guildId),
    ]);
    const channels = ipcResp.success ? ipcResp.data : [];
    res.render(path.join(__dirname, "view.ejs"), { channels, settings });
});

router.put("/", async (req, res) => {
    const body = req.body;
    const settings = await db.getSettings(res.locals.guild);

    if (!body.log_channel) {
        settings.modlog_channel = null;
    } else {
        if (body.log_channel != settings.modlog_channel) {
            settings.modlog_channel = body.log_channel;
        }
    }

    if (
        body.maxwarn_count &&
        !isNaN(body.maxwarn_count) &&
        body.maxwarn_count != settings.max_warn.limit
    ) {
        settings.max_warn.limit = Number(body.maxwarn_count);
    }

    if (body.maxwarn_action && body.maxwarn_action != settings.max_warn.action) {
        settings.max_warn.action = body.maxwarn_action;
    }

    await settings.save();
    res.sendStatus(200);
});

module.exports = router;
