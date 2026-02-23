const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "teacher"],
            required: true,
        },

        points: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

userSchema.pre("validate", function () {
    if (this.role === "teacher") {
        if (!this.email) {
            this.invalidate("email", "Teachers must have an email.");
        }
        if (this.username) {
            this.invalidate("username", "Teachers should not have a username.");
        }
    }

    if (this.role === "student") {
        if (!this.username) {
            this.invalidate("username", "Students must have a username.");
        }
        if (this.email) {
            this.invalidate("email", "Students should not have an email.");
        }
    }
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await argon2.hash(this.password);
});

module.exports = mongoose.model("User", userSchema);