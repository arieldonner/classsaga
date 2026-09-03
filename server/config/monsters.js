// const MONSTER_IMAGES = [
//     "/assets/monsters/Slime.png",
//     "/assets/monsters/GoblinScoutv2.png",
// ];

// const getMonster = (index) => {
//     return {
//         name: `Monster ${index + 1}`,
//         maxHP: 25 + (index * 15),
//         attack: 5 + (index * 2),
//         defense: 2 + Math.floor(index * 1.5),
//         imageKey: MONSTER_IMAGES[index % 2],
//     };
// };

// module.exports = { getMonster };

// Stats are provisional — tuned against the current growth rate of ~1 stat
// point per 4.5 days. Revisit once stat-granting items are designed.
const MONSTERS = [
    { image: "Slime.png",           name: "Slime",            artFacing: "right",  maxHP: 35,  attack: 4, defense: 1 },
    { image: "GoblinScoutv2.png",   name: "Goblin Scout",     artFacing: "left",  maxHP: 55,  attack: 5, defense: 2 },
    { image: "Zombie.png",          name: "Zombie",           artFacing: "right",  maxHP: 60,  attack: 5, defense: 3 },
    { image: "Skeleton.png",        name: "Skeleton",         artFacing: "right",  maxHP: 75,  attack: 5, defense: 4 },
    { image: "GoblinLeader.png",    name: "Goblin Leader",    artFacing: "left",  maxHP: 90,  attack: 6, defense: 5 },
    { image: "ZombieWarrior.png",   name: "Zombie Warrior",   artFacing: "right",  maxHP: 95,  attack: 6, defense: 6 },
    { image: "SkeletonWarrior.png", name: "Skeleton Warrior", artFacing: "right",  maxHP: 110, attack: 6, defense: 7 },
];

const getMonster = (index) => {
    const lap = Math.floor(index / MONSTERS.length);
    const m   = MONSTERS[index % MONSTERS.length];

    return {
        name:     lap === 0 ? m.name : `${m.name} +${lap}`,
        maxHP:    Math.round(m.maxHP   * (1 + lap * 0.8)),
        attack:   Math.round(m.attack  * (1 + lap * 0.4)),
        defense:  Math.round(m.defense * (1 + lap * 0.5)),
        artFacing: m.artFacing,
        imageKey: `/assets/monsters/${m.image}`,
    };
};

module.exports = { getMonster };
