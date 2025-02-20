const path = require("path");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const [channelsResp, rolesResp] = await Promise.all([
        req.broadcast("getChannelsOf", res.locals.guild.id),
        req.broadcast("getRolesOf", res.locals.guild.id),
    ]);

    const categories = res.locals.settings.categories;
    const roles = rolesResp.find((d) => d.success)?.data;
    const channels = channelsResp.find((d) => d.success)?.data;

    res.render(path.join(__dirname, "view.ejs"), {
        tabs: [req.translate("ticket:CATEGORY_TITLE")],
        categories,
        channels,
        roles,
    });
});

router.post("/", async (req, res) => {
    const { guild, settings } = res.locals;
    const body = req.body;

    // settings
    if (Object.prototype.hasOwnProperty.call(body, "settings")) {
        body.create_embed = body.create_embed === "on";
        if (body.create_embed && settings.embed_colors.create !== body.create_embed_color) {
            settings.embed_colors.create = body.create_embed_color;
        }

        body.close_embed = body.close_embed === "on";
        if (body.close_embed && settings.embed_colors.close !== body.close_embed_color) {
            settings.embed_colors.close = body.close_embed_color;
        }

        body.log_channel = body.log_channel ? body.log_channel : null;
        if (settings.log_channel !== body.log_channel) {
            settings.log_channel = body.log_channel;
        }

        body.limit = parseInt(body.limit);
        if (!isNaN(body.limit) && settings.limit !== body.limit) {
            settings.limit = body.limit;
        }

        await settings.save();
        return res.sendStatus(200);
    }

    const rolesResp = await req.broadcast("getRolesOf", guild.id);
    const roles = rolesResp.find((d) => d.success)?.data;

    // create category
    if (Object.prototype.hasOwnProperty.call(body, "create_category")) {
        if (settings.categories.find((c) => c.name === body.name)) {
            return res.status(400).send("Category already exists");
        }

        body.staff_roles =
            typeof body.staff_roles === "string" ? [body.staff_roles] : body.staff_roles || [];
        body.member_roles =
            typeof body.member_roles === "string" ? [body.member_roles] : body.member_roles || [];

        const category = {
            name: body.name,
            description: body.description,
            staff_roles: body.staff_roles.filter((r) => roles.includes(r)),
            member_roles: body.member_roles.filter((r) => roles.includes(r)),
            open_msg: {
                title: body.embed_title,
                description: body.embed_description?.trim().replace(/\r?\n/g, "\\n"),
                footer: body.embed_footer,
            },
        };

        settings.categories.push(category);
        await settings.save();
    }

    // update category
    if (Object.prototype.hasOwnProperty.call(body, "update_category")) {
        const category = settings.categories.find((c) => c.name === body.name);
        if (!category) {
            return res.status(400).send("Category not found");
        }

        body.staff_roles =
            typeof body.staff_roles === "string" ? [body.staff_roles] : body.staff_roles || [];
        body.member_roles =
            typeof body.member_roles === "string" ? [body.member_roles] : body.member_roles || [];

        category.description = body.description;
        category.staff_roles = body.staff_roles.filter((r) => roles.includes(r));
        category.member_roles = body.member_roles.filter((r) => roles.includes(r));
        category.open_msg = {
            title: body.embed_title,
            description: body.embed_description?.trim().replace(/\r?\n/g, "\\n"),
            footer: body.embed_footer,
        };

        await settings.save();
    }

    // delete category
    if (Object.prototype.hasOwnProperty.call(body, "delete_category")) {
        const category = settings.categories.find((c) => c.name === body.name);
        if (!category) {
            return res.status(400).send("Category not found");
        }

        settings.categories = settings.categories.filter((c) => c.name !== body.name);
        await settings.save();
    }

    res.redirect("/dashboard/" + guild.id + "/ticket");
});

module.exports = router;
