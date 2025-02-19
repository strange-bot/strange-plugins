const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    icon: "fa-solid fa-star",
    dashboardRouter: require("./settings.router"),
    adminRouter: require("./admin.router"),
    dbService: require("../db.service"),
});
