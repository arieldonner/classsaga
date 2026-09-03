const applyLevelUps = (pet) => {
    let leveledUp = false;

    while (pet.experience >= 100) {
        pet.experience -= 100;
        pet.level += 1;
        pet.strength += 1;
        pet.speed += 1;
        pet.defense += 1;
        leveledUp = true;
    }

    return leveledUp;
};

module.exports = applyLevelUps;
