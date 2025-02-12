const plugin = require("../index");
const Model = plugin.getModel("member-stats");

module.exports = {
    create: async (doc) => new Model(doc).save(),
};
