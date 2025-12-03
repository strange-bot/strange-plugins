const path = require("path");
const router = require("express").Router();
const db = require("../db.service");

router.get("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const [channelsResp, rolesResp, settings] = await Promise.all([
        req.broadcastOne("getChannelsOf", guildId, { guildId }),
        req.broadcastOne("getRolesOf", guildId, { guildId }),
        db.getSettings(guildId),
    ]);

    const categories = settings.categories;
    const roles = rolesResp.success ? rolesResp.data : [];
    const channels = channelsResp.success ? channelsResp.data : [];

    res.render(path.join(__dirname, "view.ejs"), {
        tabs: [req.translate("ticket:CATEGORY_TAB"), req.translate("ticket:TL_TAB")],
        categories,
        channels,
        roles,
        settings,
    });
});

router.put("/", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
    const body = req.body;

    // update embed colors if provided
    if (body.create_embed && settings.embed_colors.create !== body.create_embed) {
        settings.embed_colors.create = body.create_embed;
    }

    if (body.close_embed && settings.embed_colors.close !== body.close_embed) {
        settings.embed_colors.close = body.close_embed;
    }

    // log channel
    body.log_channel = body.log_channel ? body.log_channel : null;
    if (settings.log_channel !== body.log_channel) {
        settings.log_channel = body.log_channel;
    }

    // limit
    const limit = parseInt(body.limit);
    if (!isNaN(limit) && settings.limit !== limit) {
        settings.limit = limit;
    }

    await settings.save();
    return res.sendStatus(200);
});

router.get("/categories", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
    res.json(settings.categories);
});

router.post("/categories", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
    const body = req.body;

    // create category
    if (settings.categories.find((c) => c.name === body.name)) {
        return res.status(400).send("Category already exists");
    }

    const rolesResp = await req.broadcastOne("getRolesOf", guildId, { guildId });
    const roles = rolesResp.success ? rolesResp.data : [];
    const roleIds = roles.map((r) => String(r.id));

    body.staff_roles =
        typeof body.staff_roles === "string" ? [body.staff_roles] : body.staff_roles || [];
    body.member_roles =
        typeof body.member_roles === "string" ? [body.member_roles] : body.member_roles || [];

    const category = {
        name: body.name,
        description: body.description,
        staff_roles: body.staff_roles.filter((r) => roleIds.includes(String(r))),
        member_roles: body.member_roles.filter((r) => roleIds.includes(String(r))),
        open_msg: {
            title: body.embed_title,
            description: body.embed_description?.trim().replace(/\r?\n/g, "\\n"),
            footer: body.embed_footer,
        },
    };

    settings.categories.push(category);
    await settings.save();

    res.sendStatus(200);
});

router.put("/categories/:name", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
    const body = req.body;
    const category = settings.categories.find((c) => c.name === req.params.name);
    if (!category) {
        return res.status(400).send("Category not found");
    }

    const rolesResp = await req.broadcastOne("getRolesOf", guildId, { guildId });
    const roles = rolesResp.success ? rolesResp.data : [];
    const roleIds = roles.map((r) => String(r.id));

    body.staff_roles =
        typeof body.staff_roles === "string" ? [body.staff_roles] : body.staff_roles || [];
    body.member_roles =
        typeof body.member_roles === "string" ? [body.member_roles] : body.member_roles || [];

    category.description = body.description;
    category.staff_roles = body.staff_roles.filter((r) => roleIds.includes(String(r)));
    category.member_roles = body.member_roles.filter((r) => roleIds.includes(String(r)));
    category.open_msg = {
        title: body.embed_title,
        description: body.embed_description?.trim().replace(/\r?\n/g, "\\n"),
        footer: body.embed_footer,
    };

    await settings.save();
    res.sendStatus(200);
});

router.delete("/categories/:name", async (req, res) => {
    const guildId = res.locals.guild.id;
    const settings = await db.getSettings(guildId);
    const category = settings.categories.find((c) => c.name === req.params.name);
    if (!category) {
        return res.status(400).send("Category not found");
    }

    settings.categories = settings.categories.filter((c) => c.name !== req.params.name);
    await settings.save();
    res.sendStatus(200);
});

router.get("/logs", async (req, res) => {
    const guildId = res.locals.guild.id;
    try {
        // parse paging/filter params
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 25;
        const q = req.query.q || "";
        const status = req.query.status || "ALL";
        const { items, total } = await db.findLogsForGuildPaged(guildId, {
            page,
            perPage,
            q,
            status,
        });

        // ensure createdAt present
        const logs = (items || []).map((d) => {
            let createdAt = d.createdAt;
            if (!createdAt && d._id) {
                try {
                    createdAt = new Date(parseInt(String(d._id).substring(0, 8), 16) * 1000);
                } catch (e) {
                    createdAt = null;
                }
            }
            return {
                _id: d._id,
                ticket_id: d.ticket_id,
                status: d.status,
                category: d.category,
                opener_username: d.opener_username,
                opener_id: d.opener_id,
                channel_id: d.channel_id,
                reason: d.reason,
                close_time: d.close_time,
                close_reason: d.close_reason,
                closed_by_id: d.closed_by_id,
                createdAt,
            };
        });

        return res.json({ items: logs, total, page, perPage });
    } catch (err) {
        return res.status(500).send("Failed to fetch translation logs");
    }
});

// transcript-only endpoint (used by modal to lazily load large transcript)
router.get("/logs/:id/transcript", async (req, res) => {
    const guildId = res.locals.guild.id;
    try {
        const transcript = await db.getTranscriptForLogById(req.params.id, guildId);
        if (transcript === null) return res.status(404).send("Log not found");
        return res.json({ transcript });
    } catch (err) {
        return res.status(500).send("Failed to fetch transcript");
    }
});

router.get("/logs/:id", async (req, res) => {
    const guildId = res.locals.guild.id;
    try {
        const log = await db.getLogForGuildById(req.params.id, guildId);
        if (!log) return res.status(404).send("Log not found");
        return res.json(log);
    } catch (err) {
        return res.status(500).send("Failed to fetch translation log");
    }
});

router.delete("/logs/:id", async (req, res) => {
    const guildId = res.locals.guild.id;
    try {
        const result = await db.softDeleteLogById(req.params.id, guildId);
        // updateOne returns { n, nModified, ok } (depends on driver); check matched count
        if (!result || (result.n === 0 && result.matchedCount === 0)) {
            return res.status(404).send("Log not found");
        }
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).send("Failed to delete translation log");
    }
});

router.delete("/logs", async (req, res) => {
    const guildId = res.locals.guild.id;
    try {
        await db.softDeleteLogsForGuild(guildId);
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).send("Failed to clear translation logs");
    }
});

module.exports = router;
