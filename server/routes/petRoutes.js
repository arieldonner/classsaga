const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const User = require("../models/User");
const DailyCareLog = require("../models/DailyCareLog");
const PointTransaction = require("../models/PointTransaction");
const { protect } = require("../middleware/authMiddleware");

const getTodayDateKey = () => {
    return new Date().toISOString().split("T")[0];
};

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

// Feed pet
router.post("/feed", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can feed pets." });
        }

        const pet = await Pet.findOne({ student: req.user._id });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const student = await User.findById(req.user._id);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        const dateKey = getTodayDateKey();

        let log = await DailyCareLog.findOne({
            student: req.user._id,
            dateKey,
        });

        if (!log) {
            log = await DailyCareLog.create({
                student: req.user._id,
                dateKey,
            });
        }

        const cost = 10;
        let actionType = "free";

        if (!log.feedUsed) {
            log.feedUsed = true;
        } else {
            if (student.points < cost) {
                return res.status(400).json({ message: "Not enough points." });
            }

            student.points -= cost;
            actionType = "paid";

            await PointTransaction.create({
                student: student._id,
                amount: -cost,
                reason: "Premium Feed",
                type: "spend",
            });
        }

        pet.hunger = Math.min(100, pet.hunger + 15);
        pet.experience += 5;
        pet.lastUpdated = new Date();

        await pet.save();
        await log.save();
        await student.save();

        res.json({
            pet,
            points: student.points,
            actionType,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to feed pet." });
    }
});

// Play with pet
router.post("/play", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can play with pets." });
        }

        const pet = await Pet.findOne({ student: req.user._id });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const student = await User.findById(req.user._id);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        const dateKey = getTodayDateKey();

        let log = await DailyCareLog.findOne({
            student: req.user._id,
            dateKey,
        });

        if (!log) {
            log = await DailyCareLog.create({
                student: req.user._id,
                dateKey,
            });
        }

        const cost = 10;
        let actionType = "free";

        if (!log.playUsed) {
            log.playUsed = true;
        } else {
            if (student.points < cost) {
                return res.status(400).json({ message: "Not enough points." });
            }

            student.points -= cost;
            actionType = "paid";

            await PointTransaction.create({
                student: student._id,
                amount: -cost,
                reason: "Premium Play",
                type: "spend",
            });
        }

        pet.happiness = Math.min(100, pet.happiness + 15);
        pet.experience += 5;
        pet.lastUpdated = new Date();

        await pet.save();
        await log.save();
        await student.save();

        res.json({
            pet,
            points: student.points,
            actionType,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to play with pet." });
    }
});

// Brush pet
router.post("/brush", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can brush pets." });
        }

        const pet = await Pet.findOne({ student: req.user._id });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const student = await User.findById(req.user._id);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        const dateKey = getTodayDateKey();

        let log = await DailyCareLog.findOne({
            student: req.user._id,
            dateKey,
        });

        if (!log) {
            log = await DailyCareLog.create({
                student: req.user._id,
                dateKey,
            });
        }

        const cost = 10;
        let actionType = "free";

        if (!log.brushUsed) {
            log.brushUsed = true;
        } else {
            if (student.points < cost) {
                return res.status(400).json({ message: "Not enough points." });
            }

            student.points -= cost;
            actionType = "paid";

            await PointTransaction.create({
                student: student._id,
                amount: -cost,
                reason: "Premium Brush",
                type: "spend",
            });
        }

        pet.cleanliness = Math.min(100, pet.cleanliness + 15);
        pet.experience += 5;
        pet.lastUpdated = new Date();

        await pet.save();
        await log.save();
        await student.save();

        res.json({
            pet,
            points: student.points,
            actionType,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to brush pet." });
    }
});

// Get today's care status
router.get("/daily-status", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have pet care." });
        }

        const dateKey = getTodayDateKey();

        let log = await DailyCareLog.findOne({
            student: req.user._id,
            dateKey,
        });

        if (!log) {
            // nothing used yet today
            return res.json({
                feedUsed: false,
                playUsed: false,
                brushUsed: false,
            });
        }

        res.json({
            feedUsed: log.feedUsed,
            playUsed: log.playUsed,
            brushUsed: log.brushUsed,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch daily status." });
    }
});

module.exports = router;