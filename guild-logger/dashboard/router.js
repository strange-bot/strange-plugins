const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", async (_req, res) => {
    res.render(path.join(__dirname, "view.ejs"), {
        config: res.locals.config,
    });
});

router.put("/", async (req, res) => {
    const { webhook_url } = req.body;
    const { config } = res.locals;

    // Validate webhook URL if provided
    if (webhook_url && typeof webhook_url !== "string") {
        return res.status(400).json({ error: "Invalid webhook URL" });
    }

    config.webhook_url = webhook_url || "";
    await config.save();

    res.sendStatus(200);
});

module.exports = router;
