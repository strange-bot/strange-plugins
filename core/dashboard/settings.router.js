const path = require("node:path");
const router = require("express").Router();

router.get("/", (req, res) => {
    res.render(path.join(__dirname, "views/settings.ejs"), {
        languages: req.app.i18n.availableLanguages,
    });
});

router.put("/", async (req, res) => {
    const { settings } = res.locals;
    const body = req.body;

    try {
        if (body.prefix && settings.prefix !== body.prefix) {
            settings.prefix = body.prefix;
        }

        if (body.locale) {
            if (!req.app.i18n.availableLanguages.find((lang) => lang === body.locale)) {
                return res.status(400).json({ error: "Invalid language" });
            }
            if (settings.locale !== body.locale) {
                settings.locale = body.locale;
            }
        }

        settings.save();
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
