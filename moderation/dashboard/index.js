const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-user-shield",
    baseDir: __dirname,
    enabled: true,
    dashboardRouter: require("./router"),
});
