const { DBService, Schema } = require("strange-sdk");

class GreetingService extends DBService {
    constructor(pluginName) {
        super(pluginName);
    }

    defineSchemas(_config) {
        return {
            settings: new Schema({
                _id: String,
                autorole_id: String,
                welcome: {
                    enabled: Boolean,
                    channel: String,
                    content: String,
                    embed: {
                        description: String,
                        color: String,
                        thumbnail: { type: Boolean, default: false },
                        footer: String,
                        image: String,
                    },
                },
                farewell: {
                    enabled: Boolean,
                    channel: String,
                    content: String,
                    embed: {
                        description: String,
                        color: String,
                        thumbnail: { type: Boolean, default: false },
                        footer: String,
                        image: String,
                    },
                },
            }),
        };
    }
}

module.exports = new GreetingService("greeting");
