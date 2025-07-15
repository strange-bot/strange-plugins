const { DBService, Schema } = require("strange-sdk");

class SocialService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(_config) {
        return {
            profiles: new Schema({
                _id: String,
                reputation: {
                    received: { type: Number, default: 0 },
                    given: { type: Number, default: 0 },
                    timestamp: Date,
                },
            }),
        };
    }

    async getSocial(user) {
        if (!user) throw new Error("User is required.");
        if (!user.id) throw new Error("User Id is required.");

        return this.getModel("profiles").findOne({ id: user.id });
    }

    async getReputationLb(limit = 10) {
        return this.getModel("profiles").find({}).sort({ "reputation.received": -1 }).limit(limit);
    }
}

module.exports = new SocialService();
