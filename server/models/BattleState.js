const mongoose = require("mongoose");

const battleStateSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        monsterIndex: {
            type: Number,
            default: 0,
        },
        currentMonsterHP: {
            type: Number,
            default: null,
        },
        dailyBattleUsed: {
            type: Boolean,
            default: false,
        },
        lastBattleDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("BattleState", battleStateSchema);
