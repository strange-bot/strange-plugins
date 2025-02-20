const path = require("path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const ipcResp = await req.broadcast("getChannelsOf", res.locals.guild.id);
    const channels = ipcResp.find((d) => d.success)?.data;
    res.render(path.join(__dirname, "view.ejs"), { channels });
});

router.put("/", async (req, res) => {
    const body = req.body;
    const settings = res.locals.settings;

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
