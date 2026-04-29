const express = require("express");
const router = express.Router();

const ShopItem = require("../models/ShopItem");
const InventoryItem = require("../models/InventoryItem");
const Pet = require("../models/Pet");
const PointTransaction = require("../models/PointTransaction");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Get available shop items
router.get("/items", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can view the shop." });
        }

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const items = await ShopItem.find({
            isActive: true,
            unlockLevel: { $lte: pet.level },
        }).sort({ category: 1, cost: 1 });

        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch shop items." });
    }
});

// Buy item
router.post("/buy", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can buy items." });
        }

        const { shopItemId } = req.body;

        if (!shopItemId) {
            return res.status(400).json({ message: "Shop item is required." });
        }

        const student = await User.findById(req.user._id);
        const pet = await Pet.findOne({ student: req.user._id, isActive: true });
        const item = await ShopItem.findById(shopItemId);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        if (!item || !item.isActive) {
            return res.status(404).json({ message: "Item not found." });
        }

        if (pet.level < item.unlockLevel) {
            return res.status(403).json({ message: "This item is not unlocked yet." });
        }

        if (student.points < item.cost) {
            return res.status(400).json({ message: "Not enough points." });
        }

        student.points -= item.cost;

        let inventoryItem = await InventoryItem.findOne({
            student: student._id,
            shopItem: item._id,
        });

        if (inventoryItem) {
            if (item.itemType === "cosmetic") {
                return res.status(400).json({ message: "You already own this item." });
            }

            inventoryItem.quantity += 1;
            await inventoryItem.save();
        } else {
            inventoryItem = await InventoryItem.create({
                student: student._id,
                shopItem: item._id,
                quantity: 1,
            });
        }

        await PointTransaction.create({
            student: student._id,
            amount: -item.cost,
            reason: `Purchased ${item.name}`,
            type: "spend",
        });

        await student.save();
        await inventoryItem.save();

        res.status(201).json({
            message: "Item purchased successfully.",
            points: student.points,
            inventoryItem,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to buy item." });
    }
});

module.exports = router;