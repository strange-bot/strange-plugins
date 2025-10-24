const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    adminRouter: require("./router"),
});
