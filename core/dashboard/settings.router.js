const path = require("node:path");
const router = require("express").Router();
const languages = require("strange-i18n/languages-meta.json");

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views/settings.ejs"), {
        languages: languages.map((lang) => lang.name),
    });
});

router.put("/", async (req, res) => {
    const { guild, settings, plugin } = res.locals;
    const body = req.body;

    try {
        if (body.prefix && settings.prefix !== body.prefix) {
            settings.prefix = body.prefix;
        }

        if (body.locale) {
            if (!languages.find((lang) => lang.name === body.locale)) {
                return res.status(400).json({ error: "Invalid language" });
            }
            if (settings.locale !== body.locale) {
                settings.locale = body.locale;
            }
        }

        await plugin.updateSettings(guild.id, settings);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
