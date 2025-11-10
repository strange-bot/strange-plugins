const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [channelsResp, rolesResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        req.broadcastOne("getRolesOf", guildId, { guildId }),
        db.getSettings(res.locals.guild),
    ]);

    const channels = channelsResp.success ? channelsResp.data : [];
    const roles = rolesResp.success ? rolesResp.data : [];

    res.render(path.join(__dirname, "view.ejs"), {
        channels,
        roles,
        settings,
        settingsTab: false,
        tabs: ["Welcome", "Farewell", "Autorole"],
    });
});

router.put("/", async (req, res) => {
    const settings = await db.getSettings(res.locals.guild);
    const body = req.body;

    // Welcome settings
    if (
        body.action === "welcome_enable" ||
        body.action === "welcome_update" ||
        body.action === "welcome_disable"
    ) {
        if (body.action === "welcome_enable") {
            settings.welcome.enabled = true;
        }
        if (body.action === "welcome_disable") {
            settings.welcome.enabled = false;
            settings.welcome.channel = null;
        }
        if (body.welcome_channel && body.welcome_channel !== settings.welcome.channel) {
            settings.welcome.enabled = true;
            settings.welcome.channel = body.welcome_channel;
        }
        if (body.welcome_content !== undefined) {
            body.welcome_content = body.welcome_content.trim().replace(/\r?\n/g, "\\n");
            if (body.welcome_content !== settings.welcome.content) {
                settings.welcome.content = body.welcome_content;
            }
        }
        if (body.welcome_embed_description !== undefined) {
            body.welcome_embed_description = body.welcome_embed_description
                .trim()
                .replace(/\r?\n/g, "\\n");
            if (body.welcome_embed_description !== settings.welcome.embed.description) {
                settings.welcome.embed.description = body.welcome_embed_description;
            }
        }
        if (body.welcome_embed_footer !== undefined) {
            body.welcome_embed_footer = body.welcome_embed_footer.trim();
            if (body.welcome_embed_footer !== settings.welcome.embed.footer.text) {
                settings.welcome.embed.footer.text = body.welcome_embed_footer;
            }
        }
        if (
            body.welcome_embed_thumbnail !== undefined &&
            body.welcome_embed_thumbnail !== settings.welcome.embed.thumbnail
        ) {
            settings.welcome.embed.thumbnail = body.welcome_embed_thumbnail;
        }
        if (
            body.welcome_embed_color !== undefined &&
            body.welcome_embed_color !== settings.welcome.embed.color
        ) {
            settings.welcome.embed.color = body.welcome_embed_color;
        }
        if (
            body.welcome_embed_image != null &&
            body.welcome_embed_image !== settings.welcome.embed.image
        ) {
            settings.welcome.embed.image = body.welcome_embed_image;
        }
        if (
            body.welcome_embed_title != null &&
            body.welcome_embed_title !== settings.welcome.embed.title
        ) {
            settings.welcome.embed.title = body.welcome_embed_title;
        }
        if (body.welcome_embed_fields != null) {
            const fields = body.welcome_embed_fields;
            if (JSON.stringify(fields) !== JSON.stringify(settings.welcome.embed.fields)) {
                settings.welcome.embed.fields = fields;
            }
        }
        if (
            body.welcome_embed_author != null &&
            body.welcome_embed_author !== settings.welcome.embed.author.name
        ) {
            settings.welcome.embed.author.name = body.welcome_embed_author;
        }
        if (
            body.welcome_embed_author_icon != null &&
            body.welcome_embed_author_icon !== settings.welcome.embed.author.iconURL
        ) {
            settings.welcome.embed.author.iconURL = body.welcome_embed_author_icon;
        }
        if (
            body.welcome_embed_footer_icon != null &&
            body.welcome_embed_footer_icon !== settings.welcome.embed.footer.iconURL
        ) {
            settings.welcome.embed.footer.iconURL = body.welcome_embed_footer_icon;
        }
        if (typeof body.welcome_embed_timestamp !== "undefined") {
            const status =
                body.welcome_embed_timestamp === "true" || body.welcome_embed_timestamp === true;
            if (status !== settings.welcome.embed.timestamp) {
                settings.welcome.embed.timestamp = status;
            }
        }
    }

    // Farewell settings
    if (
        body.action === "farewell_enable" ||
        body.action === "farewell_update" ||
        body.action === "farewell_disable"
    ) {
        if (body.action === "farewell_enable") {
            settings.farewell.enabled = true;
        }
        if (body.action === "farewell_disable") {
            settings.farewell.enabled = false;
            settings.farewell.channel = null;
        }
        if (body.farewell_channel && body.farewell_channel !== settings.farewell.channel) {
            settings.farewell.channel = body.farewell_channel;
        }
        if (body.farewell_content) {
            body.farewell_content = body.farewell_content.trim().replace(/\r?\n/g, "\\n");
            if (body.farewell_content !== settings.farewell.content) {
                settings.farewell.content = body.farewell_content;
            }
        }
        if (body.farewell_embed_description) {
            body.farewell_embed_description = body.farewell_embed_description
                .trim()
                .replace(/\r?\n/g, "\\n");
            if (body.farewell_embed_description !== settings.farewell.embed.description) {
                settings.farewell.embed.description = body.farewell_embed_description;
            }
        }
        if (body.farewell_embed_footer) {
            body.farewell_embed_footer = body.farewell_embed_footer.trim();
            if (body.farewell_embed_footer !== settings.farewell.embed.footer.text) {
                settings.farewell.embed.footer.text = body.farewell_embed_footer;
            }
        }
        if (
            body.farewell_embed_thumbnail !== undefined &&
            body.farewell_embed_thumbnail !== settings.farewell.embed.thumbnail
        ) {
            settings.farewell.embed.thumbnail = body.farewell_embed_thumbnail;
        }
        if (
            body.farewell_embed_color &&
            body.farewell_embed_color !== settings.farewell.embed.color
        ) {
            settings.farewell.embed.color = body.farewell_embed_color;
        }
        if (
            body.farewell_embed_image &&
            body.farewell_embed_image !== settings.farewell.embed.image
        ) {
            settings.farewell.embed.image = body.farewell_embed_image;
        }
        if (
            body.farewell_embed_title &&
            body.farewell_embed_title !== settings.farewell.embed.title
        ) {
            settings.farewell.embed.title = body.farewell_embed_title;
        }
        if (body.farewell_embed_fields != null) {
            const fields = body.farewell_embed_fields;
            if (JSON.stringify(fields) !== JSON.stringify(settings.farewell.embed.fields)) {
                settings.farewell.embed.fields = fields;
            }
        }
        if (
            body.farewell_embed_author != null &&
            body.farewell_embed_author !== settings.farewell.embed.author.name
        ) {
            settings.farewell.embed.author.name = body.farewell_embed_author;
        }
        if (
            body.farewell_embed_author_icon != null &&
            body.farewell_embed_author_icon !== settings.farewell.embed.author.iconURL
        ) {
            settings.farewell.embed.author.iconURL = body.farewell_embed_author_icon;
        }
        if (
            body.farewell_embed_footer_icon != null &&
            body.farewell_embed_footer_icon !== settings.farewell.embed.footer.iconURL
        ) {
            settings.farewell.embed.footer.iconURL = body.farewell_embed_footer_icon;
        }
        if (typeof body.farewell_embed_timestamp !== "undefined") {
            const status =
                body.farewell_embed_timestamp === "true" || body.farewell_embed_timestamp === true;
            if (status !== settings.farewell.embed.timestamp) {
                settings.farewell.embed.timestamp = status;
            }
        }
    }

    // Autorole settings
    if (body.action === "autorole") {
        // validations
        if (!body.autorole_id) return res.status(400).send("No role provided");
        if (body.autorole_id != settings.autorole_id) {
            settings.autorole_id = body.autorole_id;
        }
    }

    await settings.save();
    return res.sendStatus(200);
});

module.exports = router;
