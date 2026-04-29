const mongoose = require("mongoose");

const petEquipmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pet",
            required: true,
        },
        slot: {
            type: String,
            enum: ["background", "accessory"],
            required: true,
        },
        shopItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShopItem",
            required: true,
        },
    },
    { timestamps: true }
);

petEquipmentSchema.index({ pet: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("PetEquipment", petEquipmentSchema);