const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views", "admin.ejs"));
});

router.put("/", async (req, res) => {
    const body = req.body;
    const { plugin, config } = res.locals;

    if (
        (body.currency && typeof body.currency !== "string") ||
        (body.daily_coins && isNaN(body.daily_coins)) ||
        (body.min_beg_amount && isNaN(body.min_beg_amount)) ||
        (body.max_beg_amount && isNaN(body.max_beg_amount)) ||
        (body.beg_interval && isNaN(body.beg_interval))
    ) {
        return res.status(400);
    }

    config["CURRENCY"] = body.currency;
    config["DAILY_COINS"] = body.daily_coins;
    config["MIN_BEG_AMOUNT"] = body.min_beg_amount;
    config["MAX_BEG_AMOUNT"] = body.max_beg_amount;
    config["BEG_INTERVAL"] = body.beg_interval;

    await plugin.setConfig(config);
    res.sendStatus(200);
});

module.exports = router;
