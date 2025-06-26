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
                    enabled: { type: Boolean, default: false },
                    channel: String,
                    content: String,
                    embed: {
                        title: String,
                        description: String,
                        color: String,
                        fields: [
                            {
                                name: String,
                                value: String,
                                inline: { type: Boolean, default: false },
                            },
                        ],
                        footer: String,
                        thumbnail: String,
                        image: String,
                        author: String,
                        author_icon: String,
                        footer_icon: String,
                        timestamp: { type: Boolean, default: false },
                    },
                },
                farewell: {
                    enabled: { type: Boolean, default: false },
                    channel: String,
                    content: String,
                    embed: {
                        title: String,
                        description: String,
                        color: String,
                        fields: [
                            {
                                name: String,
                                value: String,
                                inline: { type: Boolean, default: false },
                            },
                        ],
                        footer: String,
                        thumbnail: String,
                        image: String,
                        author: String,
                        author_icon: String,
                        footer_icon: String,
                        timestamp: { type: Boolean, default: false },
                    },
                },
            }),
        };
    }
}

module.exports = new GreetingService("greeting");
