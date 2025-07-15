const { DBService, Schema } = require("strange-sdk");

class GreetingService extends DBService {
    constructor() {
        super(__dirname);
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
                        _id: false,
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
                        footer: {
                            _id: false,
                            text: String,
                            iconURL: String,
                        },
                        thumbnail: String,
                        image: String,
                        author: {
                            _id: false,
                            name: String,
                            iconURL: String,
                        },
                        timestamp: { type: Boolean, default: false },
                    },
                },
                farewell: {
                    enabled: { type: Boolean, default: false },
                    channel: String,
                    content: String,
                    embed: {
                        _id: false,
                        title: String,
                        description: String,
                        color: String,
                        fields: [
                            {
                                _id: false,
                                name: String,
                                value: String,
                                inline: { type: Boolean, default: false },
                            },
                        ],
                        footer: {
                            _id: false,
                            text: String,
                            iconURL: String,
                        },
                        thumbnail: String,
                        image: String,
                        author: {
                            _id: false,
                            name: String,
                            iconURL: String,
                        },
                        timestamp: { type: Boolean, default: false },
                    },
                },
            }),
        };
    }
}

module.exports = new GreetingService();
