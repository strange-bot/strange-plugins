const path = require("node:path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views/admin.ejs"));
});

router.put("/", async (req, res) => {
    const { config } = res.locals;
    const body = req.body;

    if (body.reaction && body.reaction !== config["DEFAULT_EMOJI"]) {
        config["DEFAULT_EMOJI"] = body.reaction;
    }

    if (body.start_embed_color && body.start_embed_color !== config["START_EMBED_COLOR"]) {
        config["START_EMBED_COLOR"] = body.start_embed_color;
    }

    if (body.end_embed_color && body.end_embed_color !== config["END_EMBED_COLOR"]) {
        config["END_EMBED_COLOR"] = body.end_embed_color;
    }

    await config.save();
    res.sendStatus(200);
});

module.exports = router;
