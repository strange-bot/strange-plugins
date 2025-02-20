const { DashboardPlugin } = require("strange-sdk");

module.exports = new DashboardPlugin({
    baseDir: __dirname,
    icon: "fa-solid fa-people-arrows",
    dbService: require("../db.service"),
});
