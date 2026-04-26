const express = require("express");
const router = express.Router();

const InventoryItem = require("../models/InventoryItem");
const { protect } = require("../middleware/authMiddleware");

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

module.exports = router;