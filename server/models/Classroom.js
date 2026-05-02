const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joinCode: {
            type: String,
            required: true,
            unique: true,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);