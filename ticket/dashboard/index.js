const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-ticket",
    baseDir: __dirname,
    settingsRouter: require("./router"),
});
