const Pet = require("../models/Pet");

const XP_PER_LEVEL = 100;

// A student's level is derived from the lifetime XP of every pet they own,
// so caring for any pet makes progress rather than only the active one.
const getStudentLevel = async (studentId) => {
    const pets = await Pet.find({ student: studentId }, { level: 1, experience: 1 }).lean();

    const totalXp = pets.reduce(
        (sum, pet) => sum + (pet.level - 1) * XP_PER_LEVEL + pet.experience,
        0
    );

    return {
        level: Math.floor(totalXp / XP_PER_LEVEL) + 1,
        totalXp,
        xpIntoLevel: totalXp % XP_PER_LEVEL,
        xpForNext: XP_PER_LEVEL,
    };
};

module.exports = getStudentLevel;
