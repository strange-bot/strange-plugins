const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "view.ejs"));
});

router.put("/", async (req, res) => {
    const { settings } = res.locals;
    const body = req.body;

    // Quick toggles
    if (Object.prototype.hasOwnProperty.call(body, "settings")) {
        body.flag_tr = body.flag_tr === "on" ? true : false;
        if (body.flag_tr != settings.flag_translation) {
            settings.flag_translation = body.flag_tr;
        }

        await settings.save();
    }

    res.sendStatus(200);
});

module.exports = router;
