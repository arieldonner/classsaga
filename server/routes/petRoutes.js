const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const User = require("../models/User");
const DailyCareLog = require("../models/DailyCareLog");
const PointTransaction = require("../models/PointTransaction");
const { protect } = require("../middleware/authMiddleware");
const PET_TYPES = require("../config/petTypes");
const applyLevelUps = require("../utils/applyLevelUps");
const logActivity = require("../utils/logActivity");
const getStudentLevel = require("../utils/getStudentLevel");

const CARE_XP = 5;

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

        const studentLevel = await getStudentLevel(req.user._id);

        res.json({
            ...pet.toObject(),
            studentLevel,
            hurtAdjust: petType?.hurtAdjust || null,
            animationOffsets: petType?.animationOffsets || {},
            artFacing: petType?.artFacing || "left",
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch pet." });
    }
});

// Student level derived from all owned pets
router.get("/my-level", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students have a level." });
        }

        res.json(await getStudentLevel(req.user._id));
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student level." });
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

        const dateKey = getTodayDateKey();

        const [pet, student, existingLog] = await Promise.all([
            Pet.findOne({ student: req.user._id, isActive: true }),
            User.findById(req.user._id),
            DailyCareLog.findOne({ student: req.user._id, dateKey }),
        ]);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        applyPetDecay(pet);

        const log =
            existingLog ||
            (await DailyCareLog.create({ student: req.user._id, dateKey }));

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

        const prevHunger = pet.hunger;
        const prevLevel = pet.level;
        const prevStats = { strength: pet.strength, speed: pet.speed, defense: pet.defense };

        pet.hunger = Math.min(100, pet.hunger + 15);
        pet.experience += CARE_XP;
        applyLevelUps(pet);
        pet.lastUpdated = new Date();

        const hungerGain = pet.hunger - prevHunger;
        logActivity(
            pet,
            `Fed ${pet.name}${actionType === "paid" ? " (-10 pts)" : " (Free)"} • ${hungerGain > 0 ? `Hunger +${hungerGain}` : "Hunger already full"} • XP +${CARE_XP}`,
            actionType === "paid" ? "cost" : "reward"
        );

        if (pet.level > prevLevel) {
            logActivity(pet, `Level Up! ${pet.name} reached Level ${pet.level}`, "reward");
            logActivity(
                pet,
                `Battle stats increased • STR +${pet.strength - prevStats.strength} • SPD +${pet.speed - prevStats.speed} • DEF +${pet.defense - prevStats.defense}`,
                "reward"
            );
        }

        await Promise.all([pet.save(), log.save(), student.save()]);

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

        const dateKey = getTodayDateKey();

        const [pet, student, existingLog] = await Promise.all([
            Pet.findOne({ student: req.user._id, isActive: true }),
            User.findById(req.user._id),
            DailyCareLog.findOne({ student: req.user._id, dateKey }),
        ]);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        applyPetDecay(pet);

        const log =
            existingLog ||
            (await DailyCareLog.create({ student: req.user._id, dateKey }));

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

        const prevHappiness = pet.happiness;
        const prevLevel = pet.level;
        const prevStats = { strength: pet.strength, speed: pet.speed, defense: pet.defense };

        pet.happiness = Math.min(100, pet.happiness + 15);
        pet.experience += CARE_XP;
        applyLevelUps(pet);
        pet.lastUpdated = new Date();

        const happinessGain = pet.happiness - prevHappiness;
        logActivity(
            pet,
            `Played with ${pet.name}${actionType === "paid" ? " (-10 pts)" : " (Free)"} • ${happinessGain > 0 ? `Happiness +${happinessGain}` : "Happiness already full"} • XP +${CARE_XP}`,
            actionType === "paid" ? "cost" : "reward"
        );

        if (pet.level > prevLevel) {
            logActivity(pet, `Level Up! ${pet.name} reached Level ${pet.level}`, "reward");
            logActivity(
                pet,
                `Battle stats increased • STR +${pet.strength - prevStats.strength} • SPD +${pet.speed - prevStats.speed} • DEF +${pet.defense - prevStats.defense}`,
                "reward"
            );
        }

        await Promise.all([pet.save(), log.save(), student.save()]);

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

        const dateKey = getTodayDateKey();

        const [pet, student, existingLog] = await Promise.all([
            Pet.findOne({ student: req.user._id, isActive: true }),
            User.findById(req.user._id),
            DailyCareLog.findOne({ student: req.user._id, dateKey }),
        ]);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found." });
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        applyPetDecay(pet);

        const log =
            existingLog ||
            (await DailyCareLog.create({ student: req.user._id, dateKey }));

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

        const prevCleanliness = pet.cleanliness;
        const prevLevel = pet.level;
        const prevStats = { strength: pet.strength, speed: pet.speed, defense: pet.defense };

        pet.cleanliness = Math.min(100, pet.cleanliness + 15);
        pet.experience += CARE_XP;
        applyLevelUps(pet);
        pet.lastUpdated = new Date();

        const cleanlinessGain = pet.cleanliness - prevCleanliness;
        logActivity(
            pet,
            `Brushed ${pet.name}${actionType === "paid" ? " (-10 pts)" : " (Free)"} • ${cleanlinessGain > 0 ? `Cleanliness +${cleanlinessGain}` : "Cleanliness already full"} • XP +${CARE_XP}`,
            actionType === "paid" ? "cost" : "reward"
        );

        if (pet.level > prevLevel) {
            logActivity(pet, `Level Up! ${pet.name} reached Level ${pet.level}`, "reward");
            logActivity(
                pet,
                `Battle stats increased • STR +${pet.strength - prevStats.strength} • SPD +${pet.speed - prevStats.speed} • DEF +${pet.defense - prevStats.defense}`,
                "reward"
            );
        }

        await Promise.all([pet.save(), log.save(), student.save()]);

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

        const outgoing = await Pet.findOne({ student: req.user._id, isActive: true });

        if (outgoing && !outgoing._id.equals(pet._id)) {
            if (applyPetDecay(outgoing)) {
                await outgoing.save();
            }
        }

        await Pet.updateMany(
            { student: req.user._id, _id: { $ne: pet._id } },
            { isActive: false }
        );

        await Pet.updateOne(
            { _id: pet._id },
            { isActive: true, lastUpdated: new Date() }
        );

        pet.isActive = true;
        pet.lastUpdated = new Date();

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