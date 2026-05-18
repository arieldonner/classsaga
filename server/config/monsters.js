const MONSTER_IMAGES = [
    "/assets/monsters/Slime.png",
    "/assets/monsters/GoblinScoutv2.png",
];

const getMonster = (index) => {
    return {
        name: `Monster ${index + 1}`,
        maxHP: 25 + (index * 15),
        attack: 5 + (index * 2),
        defense: 2 + Math.floor(index * 1.5),
        imageKey: MONSTER_IMAGES[index % 2],
    };
};

module.exports = { getMonster };
