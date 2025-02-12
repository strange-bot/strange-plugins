const FixedSizeMap = require("fixedsize-map");
const cache = new FixedSizeMap(1000);
const plugin = require("../index");

const Model = plugin.getModel("economy");

module.exports = {
    /**
     * @param {import('discord.js').User} user
     */
    getUser: async (user) => {
        if (!user) throw new Error("User is required.");
        if (!user.id) throw new Error("User Id is required.");

        const cached = cache.get(user.id);
        if (cached) return cached;

        let userDb = await Model.findById(user.id);
        if (!userDb) {
            userDb = new Model({
                _id: user.id,
                username: user.username,
                discriminator: user.discriminator,
            });
        }

        cache.add(user.id, userDb);
        return userDb;
    },
};
