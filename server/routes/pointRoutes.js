const express = require("express");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const PointTransaction = require("../models/PointTransaction");
const DailyCareLog = require("../models/DailyCareLog");
const { protect } = require("../middleware/authMiddleware");
const crypto = require("crypto");

const router = express.Router();

const getTodayDateKey = () => {
    return new Date().toISOString().split("T")[0];
};

const LOGIN_MESSAGES = [
    "Great to see you today!",
    "Ready for another day of adventure?",
    "Your pet missed you!",
    "Keep up the great work!",
    "Every day counts — welcome back!",
    "You're on a roll!",
    "Let's make today a good one.",
];

// Daily login
router.post("/daily-login", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can claim login bonuses." });
        }

        const dateKey = getTodayDateKey();

        let log = await DailyCareLog.findOne({ student: req.user._id, dateKey });

        if (!log) {
            log = await DailyCareLog.create({ student: req.user._id, dateKey });
        }

        if (log.loginBonusClaimed) {
            return res.json({ claimed: false, studentPoints: req.user.points });
        }

        const bonusAmount = 5;

        req.user.points += bonusAmount;
        await req.user.save();

        log.loginBonusClaimed = true;
        await log.save();

        await PointTransaction.create({
            student: req.user._id,
            amount: bonusAmount,
            reason: "Daily login bonus",
            type: "login",
        });

        res.json({
            claimed: true,
            pointsAwarded: bonusAmount,
            studentPoints: req.user.points,
            message: LOGIN_MESSAGES[Math.floor(Math.random() * LOGIN_MESSAGES.length)],
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to claim daily login bonus." });
    }
});


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

// Student gets their point history
router.get("/my-transactions", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can view transactions." });
        }

        const transactions = await PointTransaction.find({
            student: req.user._id,
        })
            .populate("teacher", "name")
            .populate("classroom", "name")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch transactions." });
    }
});

// Teacher views recent point activity for one classroom
router.get("/classroom/:classroomId", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can view classroom activity." });
        }

        const { classroomId } = req.params;

        const classroom = await Classroom.findById(classroomId);

        if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        const transactions = await PointTransaction.find({
            classroom: classroomId,
        })
            .populate("student", "name username")
            .populate("teacher", "name")
            .sort({ createdAt: -1 })
            .limit(50);

        const groupedMap = new Map();

        transactions.forEach((tx) => {
            const key = tx.batchId || tx._id.toString();

            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    _id: key,
                    batchId: tx.batchId,
                    amount: tx.amount,
                    reason: tx.reason,
                    teacher: tx.teacher,
                    students: [],
                    createdAt: tx.createdAt,
                });
            }

            groupedMap.get(key).students.push(tx.student);
        });

        const groupedActivity = Array.from(groupedMap.values()).slice(0, 10);

        res.json(groupedActivity);
        // const transactions = await PointTransaction.find({
        //     classroom: classroomId,
        // })
        //     .populate("student", "name username")
        //     .populate("teacher", "name")
        //     .sort({ createdAt: -1 })
        //     .limit(10);

        // res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch classroom activity." });
    }
});

router.post("/award-bulk", protect, async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can award points." });
        }

        const { classroomId, studentIds, amount, reason } = req.body;

        if (!classroomId || !studentIds?.length || !amount || !reason?.trim()) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const classroom = await Classroom.findById(classroomId);

        if (!classroom || classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Classroom not found." });
        }

        const batchId = crypto.randomUUID();

        const validStudentIds = studentIds.filter((studentId) =>
            classroom.students.some((id) => id.toString() === studentId)
        );

        if (validStudentIds.length === 0) {
            return res.status(400).json({ message: "No valid students selected." });
        }

        await User.updateMany(
            { _id: { $in: validStudentIds } },
            { $inc: { points: Number(amount) } }
        );

        const transactions = validStudentIds.map((studentId) => ({
            student: studentId,
            teacher: req.user._id,
            classroom: classroomId,
            amount: Number(amount),
            reason: reason.trim(),
            type: "award",
            batchId,
        }));

        await PointTransaction.insertMany(transactions);

        res.status(201).json({
            message: "Points awarded successfully.",
            batchId,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to award points." });
    }
});

module.exports = router;