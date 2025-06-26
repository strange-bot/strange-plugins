const path = require("path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const [channelsResp, rolesResp] = await Promise.all([
        req.broadcast("getChannelsOf", res.locals.guild.id),
        req.broadcast("getRolesOf", res.locals.guild.id),
    ]);

    const channels = channelsResp.find((d) => d.success)?.data;
    const roles = rolesResp.find((d) => d.success)?.data;

    res.render(path.join(__dirname, "view.ejs"), {
        channels,
        roles,
        tabs: ["Autorole"],
    });
});

router.put("/", async (req, res) => {
    const { settings } = res.locals;
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
        if (body.welcome_content) {
            body.welcome_content = body.welcome_content.trim().replace(/\r?\n/g, "\\n");
            if (body.welcome_content !== settings.welcome.content) {
                settings.welcome.content = body.welcome_content;
            }
        }
        if (body.welcome_embed_content) {
            body.welcome_embed_content = body.welcome_embed_content.trim().replace(/\r?\n/g, "\\n");
            if (body.welcome_embed_content !== settings.welcome.embed.description) {
                settings.welcome.embed.description = body.welcome_embed_content;
            }
        }
        if (body.welcome_embed_footer) {
            body.welcome_embed_footer = body.welcome_embed_footer.trim();
            if (body.welcome_embed_footer !== settings.welcome.embed.footer) {
                settings.welcome.embed.footer = body.welcome_embed_footer;
            }
        }
        if (body.welcome_embed_thumbnail) {
            const status = body.welcome_embed_thumbnail === "on";
            if (status !== settings.welcome.embed.thumbnail) {
                settings.welcome.embed.thumbnail = status;
            }
        }
        if (body.welcome_embed_color && body.welcome_embed_color !== settings.welcome.embed.color) {
            settings.welcome.embed.color = body.welcome_embed_color;
        }
        if (body.welcome_embed_image && body.welcome_embed_image !== settings.welcome.embed.image) {
            settings.welcome.embed.image = body.welcome_embed_image;
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
        if (body.farewell_embed_content) {
            body.farewell_embed_content = body.farewell_embed_content
                .trim()
                .replace(/\r?\n/g, "\\n");
            if (body.farewell_embed_content !== settings.farewell.embed.description) {
                settings.farewell.embed.description = body.farewell_embed_content;
            }
        }
        if (body.farewell_embed_footer) {
            body.farewell_embed_footer = body.farewell_embed_footer.trim();
            if (body.farewell_embed_footer !== settings.farewell.embed.footer) {
                settings.farewell.embed.footer = body.farewell_embed_footer;
            }
        }
        if (body.farewell_embed_thumbnail) {
            const status = body.farewell_embed_thumbnail === "on";
            if (status !== settings.farewell.embed.thumbnail) {
                settings.farewell.embed.thumbnail = status;
            }
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
