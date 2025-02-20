const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-language",
    dependencies: [],
    baseDir: __dirname,
    dashboardRouter: require("./router"),
    dbService: require("../db.service"),
});
