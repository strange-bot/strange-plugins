const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    icon: "fa-solid fa-chart-line",
    settingsRouter: require("./settings.router"),
    adminRouter: require("./admin.router"),
});
