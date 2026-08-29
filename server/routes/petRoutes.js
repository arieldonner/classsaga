const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const User = require("../models/User");
const DailyCareLog = require("../models/DailyCareLog");
const PointTransaction = require("../models/PointTransaction");
const { protect } = require("../middleware/authMiddleware");
const PET_TYPES = require("../config/petTypes");

const getTodayDateKey = () => {
    return new Date().toISOString().split("T")[0];
};

const clampStat = (value) => {
    return Math.max(0, Math.min(100, value));
};

const applyPetDecay = (pet) => {
    const now = new Date();
    const lastUpdated = pet.lastUpdated ? new Date(pet.lastUpdated) : new Date();

    const msElapsed = now - lastUpdated;
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

    if (daysElapsed <= 0) {
        return false;
    }

    const hungerDecay = daysElapsed * 10;
    const happinessDecay = daysElapsed * 8;
    const cleanlinessDecay = daysElapsed * 6;

    pet.hunger = clampStat(Math.round(pet.hunger - hungerDecay));
    pet.happiness = clampStat(Math.round(pet.happiness - happinessDecay));
    pet.cleanliness = clampStat(Math.round(pet.cleanliness - cleanlinessDecay));
    pet.lastUpdated = now;

    return true;
};

const applyLevelUps = (pet) => {
    while (pet.experience >= 100) {
        pet.experience -= 100;
        pet.level += 1;
        pet.strength += 1;
        pet.speed += 1;
        pet.defense += 1;
    }
};

// Get current student's pet
router.get("/my-pet", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have pets." });
        }

        const pet = await Pet.findOne({
            student: req.user._id,
            isActive: true,
        });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        const changed = applyPetDecay(pet);

        if (changed) {
            await pet.save();
        }

        const petType = PET_TYPES[pet.species];

        res.json({
            ...pet.toObject(),
            animationOffsets: petType?.animationOffsets || {},
            artFacing: petType?.artFacing || "left",
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch pet." });
    }
});

// Get all current student's pets
router.get("/my-pets", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have pets." });
        }

        const pets = await Pet.find({
            student: req.user._id,
        }).sort({ createdAt: 1 });

        res.json(pets);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch pets." });
    }
});

// Feed pet
router.post("/feed", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can feed pets." });
        }

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        applyPetDecay(pet);

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
        applyLevelUps(pet);
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

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        applyPetDecay(pet);

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
        applyLevelUps(pet);
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

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        applyPetDecay(pet);

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
        applyLevelUps(pet);
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

// Get starter pets
router.get("/starter-options", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can choose a starter pet." });
        }

        const starterPets = Object.values(PET_TYPES).filter((pet) => pet.isStarter);

        res.json(starterPets);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch starter pets." });
    }
});

// Choose starter pet
router.post("/choose-starter", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can choose a starter pet." });
        }

        const { species, name } = req.body;

        const petType = PET_TYPES[species];

        if (!petType || !petType.isStarter) {
            return res.status(400).json({ message: "Invalid starter pet." });
        }

        const existingPet = await Pet.findOne({
            student: req.user._id
        });

        if (existingPet) {
            return res.status(400).json({ message: "You already have a starter pet." });
        }

        const pet = await Pet.create({
            student: req.user._id,
            name: name?.trim() || petType.name,
            species: petType.species,
            isActive: true,
        });

        res.status(201).json(pet);
    } catch (err) {
        res.status(500).json({ message: "Failed to choose starter pet." });
    }
});

// Switch active pet
router.patch("/:petId/activate", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can switch pets." });
        }

        const pet = await Pet.findOne({
            _id: req.params.petId,
            student: req.user._id,
        });

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        await Pet.updateMany(
            { student: req.user._id, _id: { $ne: pet._id } },
            { isActive: false }
        );

        await Pet.updateOne({ _id: pet._id }, { isActive: true });

        res.json({
            message: `${pet.name} is now active.`,
            pet,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to switch pet." });
    }
});

// Rename pet
router.patch("/:id/rename", protect, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required." });
        }
        const pet = await Pet.findOneAndUpdate(
            { _id: req.params.id, student: req.user._id },
            { name: name.trim() },
            { new: true }
        );
        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }
        res.json(pet);
    } catch (err) {
        res.status(500).json({ message: "Failed to rename pet." });
    }
});


module.exports = router;