const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [channelsResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        db.getSettings(guildId),
    ]);

    const channels = channelsResp.success ? channelsResp.data : [];

    res.render(path.join(__dirname, "view.ejs"), {
        channels,
        settings,
    });
});

router.put("/", async (req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    const body = req.body;

    // Basic settings
    if (Object.prototype.hasOwnProperty.call(body, "basic_settings")) {
        if (!body.log_channel) {
            settings.log_channel = null;
        } else {
            if (body.log_channel != settings.log_channel) {
                settings.log_channel = body.log_channel;
            }
        }

        if (body.max_strikes && body.max_strikes != settings.strikes) {
            settings.strikes = body.max_strikes;
        }

        if (body.automod_action && body.automod_action != settings.action) {
            settings.action = body.automod_action;
        }

        if (body.log_embed && body.log_embed != settings.embed_colors.log) {
            settings.embed_colors.log = body.log_embed;
        }

        if (body.dm_embed && body.dm_embed != settings.embed_colors.dm) {
            settings.embed_colors.dm = body.dm_embed;
        }

        if (!body.wh_channels) body.wh_channels = [];
        if (typeof body.wh_channels === "string") body.wh_channels = [body.wh_channels];
        settings.wh_channels = body.wh_channels;
    }

    // Quick toggles
    if (Object.prototype.hasOwnProperty.call(body, "automod_toggle")) {
        if (body.max_lines && !isNaN(body.max_lines) && body.max_lines != settings.max_lines) {
            settings.max_lines = Number(body.max_lines);
        }

        if (body.debug != settings.debug) {
            settings.debug = body.debug;
        }

        if (body.anti_attachments != settings.anti_attachments) {
            settings.anti_attachments = body.anti_attachments;
        }

        if (body.anti_invites != settings.anti_invites) {
            settings.anti_invites = body.anti_invites;
        }

        if (body.anti_links != settings.anti_links) {
            settings.anti_links = body.anti_links;
        }

        if (body.anti_spam != settings.anti_spam) {
            settings.anti_spam = body.anti_spam;
        }

        if (body.anti_ghostping != settings.anti_ghostping) {
            settings.anti_ghostping = body.anti_ghostping;
        }

        if (body.anti_massmention != settings.anti_massmention) {
            settings.anti_massmention = body.anti_massmention;
        }

        if (
            body.anti_massmention_threshold &&
            !isNaN(body.anti_massmention_threshold) &&
            body.anti_massmention_threshold != settings.anti_massmention_threshold
        ) {
            settings.anti_massmention_threshold = Number(body.anti_massmention_threshold);
        }
    }

    await settings.save();
    res.sendStatus(200);
});

module.exports = router;
