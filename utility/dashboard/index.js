const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-screwdriver-wrench",
    baseDir: __dirname,
    adminRouter: require("./router"),
});
