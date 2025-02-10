const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "view.ejs"));
});

router.put("/", async (req, res) => {
    const body = req.body;
    const { plugin, config } = res.locals;

    if (body.api_key && typeof body.api_key !== "string") {
        return res.status(400);
    }

    config["WEATHERSTACK_KEY"] = body.api_key;
    await plugin.setConfig(config);

    res.sendStatus(200);
});

module.exports = router;
