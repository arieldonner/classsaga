const mongoose = require("mongoose");

const shopItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        category: {
            type: String,
            enum: ["food", "toy", "care", "cosmetic", "background", "accessory"],
            required: true,
        },
        itemType: {
            type: String,
            enum: ["consumable", "cosmetic"],
            required: true,
        },
        cost: {
            type: Number,
            required: true,
            min: 0,
        },
        effectType: {
            type: String,
            enum: ["hunger", "happiness", "cleanliness", "none"],
            default: "none",
        },
        effectValue: {
            type: Number,
            default: 0,
        },
        unlockLevel: {
            type: Number,
            default: 1,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        imageKey: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ShopItem", shopItemSchema);