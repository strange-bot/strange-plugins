module.exports = () => ({
    social: {
        _id: String,
        reputation: {
            received: { type: Number, default: 0 },
            given: { type: Number, default: 0 },
            timestamp: Date,
        },
    },
});
