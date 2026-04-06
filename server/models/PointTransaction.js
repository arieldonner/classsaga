const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
            default: null,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["award", "spend"],
            default: "award",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);