const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shopItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShopItem",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0,
        },
    },
    { timestamps: true }
);

inventoryItemSchema.index(
    { student: 1, shopItem: 1 },
    { unique: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);