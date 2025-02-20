const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "view.ejs"));
});

router.put("/", async (req, res) => {
    const { status, type, message } = req.body;

    if (
        !status ||
        !type ||
        !message ||
        typeof status !== "string" ||
        typeof type !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    try {
        const config = res.locals.config;
        config.STATUS = status;
        config.TYPE = type;
        config.MESSAGE = message;

        await config.save();
        res.json({ success: true });
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
