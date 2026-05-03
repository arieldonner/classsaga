const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        species: {
            type: String,
            required: true,
            enum: ["wolfy", "pengu", "snazake"],
            trim: true,
        },

        name: {
            type: String,
            default: "My Pet",
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        hunger: {
            type: Number,
            default: 80,
            min: 0,
            max: 100,
        },
        happiness: {
            type: Number,
            default: 80,
            min: 0,
            max: 100,
        },
        cleanliness: {
            type: Number,
            default: 80,
            min: 0,
            max: 100,
        },

        level: {
            type: Number,
            default: 1,
            min: 1,
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
        },

        strength: {
            type: Number,
            default: 1,
            min: 0,
        },
        speed: {
            type: Number,
            default: 1,
            min: 0,
        },
        defense: {
            type: Number,
            default: 1,
            min: 0,
        },

        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);