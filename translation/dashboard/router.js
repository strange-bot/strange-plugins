const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "view.ejs"));
});

router.put("/", async (req, res) => {
    const { settings } = res.locals;
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
