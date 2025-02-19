const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    icon: "fa-solid fa-robot",
    dashboardRouter: require("./router"),
    dbService: require("../db.service"),
});
