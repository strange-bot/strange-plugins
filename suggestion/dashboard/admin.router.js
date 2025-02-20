const path = require("path");
const router = require("express").Router();

router.get("/", (_req, res) => {
    res.render(path.join(__dirname, "views/admin.ejs"));
});

router.put("/", async (req, res) => {
    const body = req.body;
    const { config } = res.locals;

    // Update config values if changed
    if (body.upvote_emoji && body.upvote_emoji !== config.UPVOTE_EMOJI) {
        config.UPVOTE_EMOJI = body.upvote_emoji;
    }

    if (body.downvote_emoji && body.downvote_emoji !== config.DOWNVOTE_EMOJI) {
        config.DOWNVOTE_EMOJI = body.downvote_emoji;
    }

    if (body.default_embed && body.default_embed !== config.DEFAULT_EMBED) {
        config.DEFAULT_EMBED = body.default_embed;
    }

    if (body.approved_embed && body.approved_embed !== config.APPROVED_EMBED) {
        config.APPROVED_EMBED = body.approved_embed;
    }

    if (body.rejected_embed && body.rejected_embed !== config.DENIED_EMBED) {
        config.DENIED_EMBED = body.rejected_embed;
    }

    await config.save();
    res.sendStatus(200);
});

module.exports = router;
