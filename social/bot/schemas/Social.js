const plugin = require("../index");
const Model = plugin.getModel("social");

module.exports = {
    getSocial: async (user) => {
        if (!user) throw new Error("User is required.");
        if (!user.id) throw new Error("User Id is required.");

        return Model.findOne({ id: user.id });
    },

    getReputationLb: async (limit = 10) => {
        return Model.find({}).sort({ "reputation.received": -1 }).limit(limit);
    },
};
