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

userSchema.pre("validate", function (next) {
    if (this.role === "teacher") {
        if (!this.email) {
            return next(new Error("Teachers must have an email."));
        }
        if (this.username) {
            return next(new Error("Teachers should not have a username."));
        }
    }

    if (this.role === "student") {
        if (!this.username) {
            return next(new Error("Students must have a username."));
        }
        if (this.email) {
            return next(new Error("Students should not have an email."));
        }
    }

    next();
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await argon2.hash(this.password);
});

module.exports = mongoose.model("User", userSchema);