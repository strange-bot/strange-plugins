const { DBService, Schema } = require("strange-sdk");

class EconomyService extends DBService {
    constructor() {
        super(__dirname);
    }

    defineSchemas(config) {
        return {
            settings: new Schema({
                _id: String,
                currency: {
                    type: String,
                    default: config["CURRENCY"],
                },
                daily_coins: {
                    type: Number,
                    default: config["DAILY_COINS"],
                },
                min_beg_amount: {
                    type: Number,
                    default: config["MIN_BEG_AMOUNT"],
                },
                max_beg_amount: {
                    type: Number,
                    default: config["MAX_BEG_AMOUNT"],
                },
            }),

            economy: new Schema({
                _id: String,
                coins: { type: Number, default: 0 },
                bank: { type: Number, default: 0 },
                daily: {
                    streak: { type: Number, default: config.dailyStreak },
                    timestamp: Date,
                },
            }).post("save", async (doc) => {
                await this.cache(doc._id, doc);
            }),
        };
    }

    /**
     * @param {import('discord.js').User} user
     */
    async getUser(user) {
        if (!user) throw new Error("User is required.");
        if (!user.id) throw new Error("User Id is required.");
        const Model = this.getModel("economy");

        const cached = await this.getCache(user.id);
        if (cached) {
            return cached === "null"
                ? new Model({
                      _id: user.id,
                      username: user.username,
                      discriminator: user.discriminator,
                  })
                : Model.hydrate(JSON.parse(cached));
        }

        let userDb = await Model.findById(user.id);
        await this.cache(user.id, userDb);
        return (
            userDb ||
            new Model({
                _id: user.id,
                username: user.username,
                discriminator: user.discriminator,
            })
        );
    }
}

module.exports = new EconomyService();
