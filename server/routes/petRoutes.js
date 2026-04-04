const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const { protect } = require("../middleware/authMiddleware");

// Get current student's pet
router.get("/my-pet", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have pets." });
        }

        const pet = await Pet.findOne({ student: req.user._id });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        res.json(pet);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch pet." });
    }
});

module.exports = router;