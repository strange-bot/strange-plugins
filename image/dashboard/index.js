const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    icon: "fa-solid fa-image",
    baseDir: __dirname,
    adminRouter: require("./router"),
});
