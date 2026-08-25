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
            enum: ["food", "toy", "care", "background", "accessory", "pet"],
            required: true,
        },
        itemType: {
            type: String,
            enum: ["consumable", "cosmetic", "pet"],
            required: true,
        },
        equipSlot: {
            type: String,
            enum: ["none", "background", "accessory"],
            default: "none",
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
        xpValue: {
            type: Number,
            default: 0,
        },
        strengthValue: {
            type: Number,
            default: 0,
        },
        speedValue: {
            type: Number,
            default: 0,
        },
        defenseValue: {
            type: Number,
            default: 0,
        },
        petSpecies: {
            type: String,
            enum: ["wolfy", "pengu", "snazake", "slimepet", "prickling", "dustbunny", "babydragon", "none"],
            default: "none",
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
        animationType: {
            type: String,
            default: "none",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ShopItem", shopItemSchema);