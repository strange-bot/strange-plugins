const { DBService, Schema } = require("strange-sdk");

class CoreService extends DBService {
    constructor(pluginName) {
        super(pluginName);
    }

    defineSchemas(config) {
        return {
            settings: new Schema({
                _id: String,
                prefix: {
                    type: String,
                    default: config["PREFIX_COMMANDS"]["DEFAULT_PREFIX"],
                },
                locale: {
                    type: String,
                    default: config["LOCALE"]["DEFAULT"],
                },
                enabled_plugins: {
                    type: [String],
                    default: ["core"],
                },
                disabled_prefix: [String],
                disabled_slash: [String],
            }),

            guilds: new Schema(
                {
                    _id: String,
                    guild_name: String,
                    joined_at: Date,
                    left_at: Date,
                },
                {
                    timestamps: true,
                },
            ),
        };
    }
}

module.exports = new CoreService("core");
