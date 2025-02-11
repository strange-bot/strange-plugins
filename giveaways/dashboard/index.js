const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-gift",
    baseDir: __dirname,
    settingsRouter: require("./settings.router"),
    adminRouter: require("./admin.router"),
});
