const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views", "settings.ejs"));
});

router.put("/", async (req, res) => {
    const { guild, plugin, settings } = res.locals;
    const body = req.body;

    if (
        (body.currency && typeof body.currency !== "string") ||
        (body.daily_coins && isNaN(body.daily_coins)) ||
        (body.min_beg_amount && isNaN(body.min_beg_amount)) ||
        (body.max_beg_amount && isNaN(body.max_beg_amount))
    ) {
        return res.status(400);
    }

    settings.currency = body.currency;
    settings.daily_coins = Number(body.daily_coins);
    settings.min_beg_amount = Number(body.min_beg_amount);
    settings.max_beg_amount = Number(body.max_beg_amount);

    await plugin.updateSettings(guild.id, settings);
    res.sendStatus(200);
});

module.exports = router;
