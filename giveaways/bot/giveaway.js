const { GiveawaysManager } = require("discord-giveaways");
const db = require("../db.service");

class MongooseGiveaways extends GiveawaysManager {
    /**
     * @param {import("discord.js").Client} client
     */
    constructor(client) {
        super(
            client,
            {
                default: {
                    botsCanWin: false,
                },
            },
            false, // do not initialize manager yet
        );
        this.Model = db.getModel("giveaways");
    }

    async getAllGiveaways() {
        return await this.Model.find().lean().exec();
    }

    async saveGiveaway(_messageId, giveawayData) {
        await this.Model.create(giveawayData);
        return true;
    }

    async editGiveaway(messageId, giveawayData) {
        await this.Model.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
        return true;
    }

    async deleteGiveaway(messageId) {
        await this.Model.deleteOne({ messageId }).exec();
        return true;
    }
}

module.exports = (client) => new MongooseGiveaways(client);
