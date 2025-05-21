const path = require("node:path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views/settings.ejs"));
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
                const ipcResp = await req.broadcast("setGuildLocale", {
                    guildId: res.locals.guild.id,
                    locale: body.locale,
                });

                const status = ipcResp.find((d) => d.success)?.data;
                if (status !== "OK") {
                    return res.status(500).json({ error: "Failed to set locale" });
                }

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
