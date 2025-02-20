const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views/admin.ejs"));
});

router.put("/", async (req, res) => {
    const { config } = res.locals;
    const body = req.body;

    if (
        (body.message && typeof body.message !== "string") ||
        (body.api_url && typeof body.api_url !== "string") ||
        (body.api_key && typeof body.api_key !== "string")
    ) {
        return res.status(400);
    }

    config["LEVEL_UP_MESSAGE"] = body.message;
    config["STRANGE_API_URL"] = body.api_url;
    config["STRANGE_API_KEY"] = body.api_key;

    await config.save();
    res.sendStatus(200);
});

module.exports = router;
