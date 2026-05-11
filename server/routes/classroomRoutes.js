const express = require("express");
const Classroom = require("../models/Classroom");
const Pet = require("../models/Pet");
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

        const classrooms = await Classroom.find({ teacher: req.user._id, $or: [{ isArchived: false }, { isArchived: { $exists: false } }, ], }).sort({
            createdAt: -1,
        });

        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch classrooms." });
    }
});

// Student joins a classroom by join code
router.post("/join", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can join classrooms." });
        }

        const { joinCode } = req.body;

        if (!joinCode) {
            return res.status(400).json({ message: "Join code is required." });
        }

        const classroom = await Classroom.findOne({
            joinCode: joinCode.toUpperCase(),
        });

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        const alreadyJoined = classroom.students.some(
            (studentId) => studentId.toString() === req.user._id.toString()
        );

        if (alreadyJoined) {
            return res.status(400).json({ message: "You have already joined this classroom." });
        }

        classroom.students.push(req.user._id);
        await classroom.save();

        res.json({
            message: "Joined classroom successfully.",
            classroom,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to join classroom." });
    }
});

// Student views joined classrooms
router.get("/student-classrooms", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can view joined classrooms." });
        }

        const classrooms = await Classroom.find({
            students: req.user._id,
        })
            .populate("teacher", "name")
            .sort({ createdAt: -1 });

        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch joined classrooms." });
    }
});

// Get single classroom (teacher)
router.get("/:id", protect, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate("students", "name username points")
            .populate("teacher", "name");

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        // Only the teacher who owns the class can view it
        if (classroom.teacher._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this classroom." });
        }

        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch classroom." });
    }
});

// Archive a classroom (teacher)
router.patch("/:id/archive", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can archive classrooms." });
        }

        const classroom = await Classroom.findById(req.params.id);

        if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        classroom.isArchived = true;
        await classroom.save();

        res.json({ message: "Classroom archived successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to archive classroom." });
    }
});

// Edit classroom (teacher)
router.put("/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can edit classrooms." });
        }

        const { name, description } = req.body;

        const classroom = await Classroom.findById(req.params.id);

        if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        if (name) classroom.name = name;
        if (description !== undefined) classroom.description = description;

        await classroom.save();

        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: "Failed to update classroom." });
    }
});

router.get("/:id/students-overview", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can view student overview." });
        }

        const classroom = await Classroom.findById(req.params.id)
            .populate({
                path: "students",
                select: "name username points",
            });

        if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        // Get pets for these students
        const studentIds = classroom.students.map((s) => s._id);

        const pets = await Pet.find({
            student: { $in: studentIds },
            isActive: true,
        });

        // Map pets to students
        const studentData = classroom.students.map((student) => {
            const pet = pets.find((p) => p.student.toString() === student._id.toString());

            return {
                _id: student._id,
                name: student.name,
                username: student.username,
                points: student.points,
                pet: pet
                    ? {
                            name: pet.name,
                            level: pet.level,
                            hunger: pet.hunger,
                            happiness: pet.happiness,
                            cleanliness: pet.cleanliness,
                            updatedAt: pet.updatedAt,
                      }
                    : null,
            };
        });

        res.json(studentData);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student overview." });
    }
});

// Remove student from classroom
router.delete("/:id/students/:studentId", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can remove students." });
        }

        const classroom = await Classroom.findOneAndUpdate(
            { _id: req.params.id, teacher: req.user._id },
            { $pull: { students: req.params.studentId } },
            { new: true }
        ).populate("students", "name username points");

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: "Failed to remove student." });
    }
});


module.exports = router;