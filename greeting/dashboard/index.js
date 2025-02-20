const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-user-plus",
    baseDir: __dirname,
    dashboardRouter: require("./router"),
    dbService: require("../db.service"),
});
