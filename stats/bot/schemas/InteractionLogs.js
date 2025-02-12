const plugin = require("../index");
const Model = plugin.getModel("interaction-logs");

module.exports = {
    create: async (doc) => new Model(doc).save(),
};
