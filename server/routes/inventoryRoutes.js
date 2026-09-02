const express = require("express");
const router = express.Router();

const InventoryItem = require("../models/InventoryItem");
const { protect } = require("../middleware/authMiddleware");
const Pet = require("../models/Pet");
const ShopItem = require("../models/ShopItem");
const PetEquipment = require("../models/PetEquipment");
const applyLevelUps = require("../utils/applyLevelUps");

// Get current student's inventory
router.get("/my-items", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have inventory." });
        }

        const items = await InventoryItem.find({
            student: req.user._id,
            quantity: { $gt: 0 },
        })
            .populate("shopItem")
            .sort({ updatedAt: -1 });

        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch inventory." });
    }
});

// Use a care item from inventory
router.post("/use", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can use items." });
        }

        const { inventoryItemId } = req.body;

        if (!inventoryItemId) {
            return res.status(400).json({ message: "Inventory item is required." });
        }

        const inventoryItem = await InventoryItem.findById(inventoryItemId).populate("shopItem");

        if (!inventoryItem || inventoryItem.student.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Item not found." });
        }

        const item = inventoryItem.shopItem;

        if (!item) {
            return res.status(400).json({ message: "Invalid item." });
        }

        if (item.itemType !== "consumable") {
            return res.status(400).json({ message: "This item cannot be used." });
        }

        if (inventoryItem.quantity <= 0) {
            return res.status(400).json({ message: "You do not have any left." });
        }

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        // Apply stat effect
        if (item.effectType === "hunger") {
            pet.hunger = Math.min(100, pet.hunger + item.effectValue);
        }

        if (item.effectType === "happiness") {
            pet.happiness = Math.min(100, pet.happiness + item.effectValue);
        }

        if (item.effectType === "cleanliness") {
            pet.cleanliness = Math.min(100, pet.cleanliness + item.effectValue);
        }

        // Apply xp
        if (item.xpValue) {
            pet.experience += item.xpValue;
        }

        // Apply battle stat
        if (item.strengthValue) pet.strength += item.strengthValue;
        if (item.speedValue) pet.speed += item.speedValue;
        if (item.defenseValue) pet.defense += item.defenseValue;

        // level up
        const leveledUp = applyLevelUps(pet);

        // Reduce inventory
        inventoryItem.quantity -= 1;

        await pet.save();
        await inventoryItem.save();

        res.json({
            message: "Item used successfully.",
            pet,
            inventoryItem,
            leveledUp,
        });

    } catch (err) {
        res.status(500).json({ message: "Failed to use item." });
    }
});

// Equip a cosmetic item
router.post("/equip", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can equip items." });
        }

        const { inventoryItemId } = req.body;

        if (!inventoryItemId) {
            return res.status(400).json({ message: "Inventory item is required." });
        }

        const inventoryItem = await InventoryItem.findById(inventoryItemId).populate("shopItem");

        if (!inventoryItem || inventoryItem.student.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Item not found." });
        }

        if (inventoryItem.quantity <= 0) {
            return res.status(400).json({ message: "You do not own this item." });
        }

        const item = inventoryItem.shopItem;

        if (!item || item.itemType !== "cosmetic") {
            return res.status(400).json({ message: "Only cosmetic items can be equipped." });
        }

        if (!item.equipSlot || item.equipSlot === "none") {
            return res.status(400).json({ message: "This item cannot be equipped." });
        }

        const pet = await Pet.findOne({
            student: req.user._id,
            isActive: true,
        });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const equipment = await PetEquipment.findOneAndUpdate(
            {
                student: req.user._id,
                pet: pet._id,
                slot: item.equipSlot,
            },
            {
                student: req.user._id,
                pet: pet._id,
                slot: item.equipSlot,
                shopItem: item._id,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        ).populate("shopItem");

        res.json({
            message: `${item.name} equipped.`,
            equipment,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to equip item." });
    }
});

// Get currently equipped items for active pet
router.get("/equipment", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have equipment." });
        }

        const pet = await Pet.findOne({
            student: req.user._id,
            isActive: true,
        });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const equipment = await PetEquipment.find({
            student: req.user._id,
            pet: pet._id,
        }).populate("shopItem");

        // Normalize into a slot map for easy UI use
        const slots = {
            background: null,
            accessory: null,
        };

        equipment.forEach((eq) => {
            slots[eq.slot] = eq;
        });

        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch equipment." });
    }
});

// Unequip item from active pet slot
router.post("/unequip", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can unequip items." });
        }

        const { slot } = req.body;

        if (!slot || !["background", "accessory"].includes(slot)) {
            return res.status(400).json({ message: "Valid equipment slot is required." });
        }

        const pet = await Pet.findOne({
            student: req.user._id,
            isActive: true,
        });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const removed = await PetEquipment.findOneAndDelete({
            student: req.user._id,
            pet: pet._id,
            slot,
        }).populate("shopItem");

        if (!removed) {
            return res.status(404).json({ message: "No item equipped in that slot." });
        }

        res.json({
            message: `${removed.shopItem.name} unequipped.`,
            slot,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to unequip item." });
    }
});

module.exports = router;