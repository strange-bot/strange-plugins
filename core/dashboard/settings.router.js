const path = require("node:path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (_req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    res.render(path.join(__dirname, "views/settings.ejs"), { settings });
});

router.put("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
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
                const ipcResp = await req.broadcastOne(
                    "setGuildLocale",
                    {
                        guildId: res.locals.guild.id,
                        locale: body.locale,
                    },
                    { guildId },
                );

                const status = ipcResp.success ? ipcResp.data : "ERROR";
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
