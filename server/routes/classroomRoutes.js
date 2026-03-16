const express = require("express");
const Classroom = require("../models/Classroom");
const generateJoinCode = require("../utils/generateJoinCode");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Teacher creates a classroom
router.post("/", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create classrooms." });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Classroom name is required." });
        }

        let joinCode;
        let existingClassroom;

        do {
            joinCode = generateJoinCode();
            existingClassroom = await Classroom.findOne({ joinCode });
        } while (existingClassroom);

        const classroom = await Classroom.create({
            name,
            description,
            teacher: req.user._id,
            joinCode,
            students: [], 
        });

        res.status(201).json(classroom);
    } catch (err) {
        res.status(500).json({ message: "Failed to create classroom." });
    }
});

// Teacher sees their classrooms
router.get("/my-classrooms", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can view teacher classrooms." });
        }

        const classrooms = await Classroom.find({ teacher: req.user._id }).sort({
            createdAt: -1,
        });

        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch classrooms." });
    }
});

module.exports = router;