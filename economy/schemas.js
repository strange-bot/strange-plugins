module.exports = (config) => ({
    settings: {
        enabled: {
            type: Boolean,
            default: true,
        },
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
    },

    economy: {
        _id: String,
        coins: { type: Number, default: 0 },
        bank: { type: Number, default: 0 },
        daily: {
            streak: { type: Number, default: 0 },
            timestamp: Date,
        },
    },
});
