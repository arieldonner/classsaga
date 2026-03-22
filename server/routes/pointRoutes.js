const express = require("express");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const PointTransaction = require("../models/PointTransaction");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Teacher awards points to one student in a classroom
router.post("/award", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can award points." });
        }

        const { classroomId, studentId, amount, reason } = req.body;

        if (!classroomId || !studentId || amount === undefined || !reason) {
            return res.status(400).json({ message: "Classroom, student, amount, and reason are required." });
        }

        if (Number(amount) < 1) {
            return res.status(400).json({ message: "Amount must be at least 1." });
        }

        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        if (classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to award points in this classroom." });
        }

        const studentInClassroom = classroom.students.some(
            (id) => id.toString() === studentId
        );

        if (!studentInClassroom) {
            return res.status(400).json({ message: "Student is not in this classroom." });
        }

        const student = await User.findById(studentId);

        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found." });
        }

        student.points += Number(amount);
        await student.save();

        const transaction = await PointTransaction.create({
            student: student._id,
            teacher: req.user._id,
            classroom: classroom._id,
            amount: Number(amount),
            reason,
            type: "award",
        });

        res.status(201).json({
            message: "Points awarded successfully.",
            studentPoints: student.points,
            transaction,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to award points." });
    }
});

module.exports = router;