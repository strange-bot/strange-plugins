const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (_req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    res.render(path.join(__dirname, "view.ejs"), { settings });
});

router.put("/", async (req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    const body = req.body;

    // Quick toggles
    body.flag_translation = body.flag_translation === true;
    if (body.flag_translation !== settings.flag_translation) {
        settings.flag_translation = body.flag_translation;

        await settings.save();
    }

    res.sendStatus(200);
});

module.exports = router;
