const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    ownerOnly: true,
    baseDir: __dirname,
    adminRouter: require("./router"),
});
