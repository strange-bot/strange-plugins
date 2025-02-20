const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    icon: "fa-solid fa-chart-line",
    dashboardRouter: require("./settings.router"),
    adminRouter: require("./admin.router"),
    dbService: require("../db.service"),
});
