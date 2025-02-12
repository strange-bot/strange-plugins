const plugin = require("../index");
const Model = plugin.getModel("voice-logs");

module.exports = {
    create: async (doc) => new Model(doc).save(),
};
