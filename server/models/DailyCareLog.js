const mongoose = require("mongoose");

const dailyCareLogSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        dateKey: {
            type: String,
            required: true,
        },
        feedUsed: {
            type: Boolean,
            default: false,
        },
        playUsed: {
            type: Boolean,
            default: false,
        },
        brushUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

dailyCareLogSchema.index({ student: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("DailyCareLog", dailyCareLogSchema);