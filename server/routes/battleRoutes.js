const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const BattleState = require("../models/BattleState");
const Pet = require("../models/Pet");
const { getMonster } = require("../config/monsters");
const InventoryItem = require("../models/InventoryItem");
const ShopItem = require("../models/ShopItem");

const PET_BATTLE_HP = 50;

const calculatePetDamage = (pet, monster) => {
    const base = Math.max(1, pet.strength - monster.defense) * 2;
    const lucky = Math.random() < pet.speed / 100;
    return lucky ? base * 2 : base;
};

const calculateMonsterDamage = (monster, pet) => {
    return Math.max(1, monster.attack - pet.defense) * 2;
};

router.get("/status", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can battle." });
        }

        let battleState = await BattleState.findOne({ student: req.user._id });

        if (!battleState) {
            battleState = await BattleState.create({ student: req.user._id });
        }

        const monster = getMonster(battleState.monsterIndex);

        if (battleState.currentMonsterHP === null) {
            battleState.currentMonsterHP = monster.maxHP;
            await battleState.save();
        }

        // Reset daily battle if it's a new day
        const today = new Date().toDateString();
        const lastBattle = battleState.lastBattleDate
            ? new Date(battleState.lastBattleDate).toDateString()
            : null;

        if (lastBattle !== today) {
            battleState.dailyBattleUsed = false;
            await battleState.save();
        }

        res.json({
            monster: { ...monster, currentHP: battleState.currentMonsterHP },
            dailyBattleUsed: battleState.dailyBattleUsed,
            petBattleHP: PET_BATTLE_HP,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to load battle status." });
    }
});

router.post("/attack", protect, async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can battle." });
        }

        let battleState = await BattleState.findOne({ student: req.user._id });
        if (!battleState) {
            battleState = await BattleState.create({ student: req.user._id });
        }

        // Reset daily battle if it's a new day
        const today = new Date().toDateString();
        const lastBattle = battleState.lastBattleDate
            ? new Date(battleState.lastBattleDate).toDateString()
            : null;

        if (lastBattle !== today) {
            battleState.dailyBattleUsed = false;
        }

        if (battleState.dailyBattleUsed) {
            return res.status(400).json({ message: "You have already battled today." });
        }

        const pet = await Pet.findOne({ student: req.user._id, isActive: true });
        if (!pet) {
            return res.status(404).json({ message: "No active pet found." });
        }

        const monster = getMonster(battleState.monsterIndex);

        if (battleState.currentMonsterHP === null) {
            battleState.currentMonsterHP = monster.maxHP;
        }

        let petHP = PET_BATTLE_HP;
        let monsterHP = battleState.currentMonsterHP;
        const rounds = [];
        let round = 1;
        let reward = null;

        while (petHP > 0 && monsterHP > 0) {
            const lines = [];

            // Pet attacks
            const petDamage = calculatePetDamage(pet, monster);
            const lucky = petDamage > Math.max(1, pet.strength - monster.defense) * 2;
            monsterHP = Math.max(0, monsterHP - petDamage);
            lines.push(
                lucky
                    ? `Round ${round}: ${pet.name} landed a lucky hit for ${petDamage} damage!`
                    : `Round ${round}: ${pet.name} dealt ${petDamage} damage.`
            );

            if (monsterHP <= 0) {
                rounds.push({ petHP, monsterHP, lines });
                break;
            }

            // Monster attacks
            const monsterDamage = calculateMonsterDamage(monster, pet);
            petHP = Math.max(0, petHP - monsterDamage);
            lines.push(`Round ${round}: ${monster.name} struck back for ${monsterDamage} damage.`);

            rounds.push({ petHP, monsterHP, lines });
            round++;
        }

        const petWon = monsterHP <= 0;

        battleState.currentMonsterHP = petWon ? null : monsterHP;
        battleState.dailyBattleUsed = true;
        battleState.lastBattleDate = new Date();
        if (petWon) battleState.monsterIndex += 1;

        await battleState.save();

        if (petWon) {
            // XP reward
            const prevLevel = pet.level;
            pet.experience += 20;
            while (pet.experience >= 100) {
                pet.experience -= 100;
                pet.level += 1;
                pet.strength += 1;
                pet.speed += 1;
                pet.defense += 1;
            }
            await pet.save();

            // Item drop - 70% consumable, 30% cosmetic
            const itemType = Math.random() < 0.7 ? "consumable" : "cosmetic";

            let droppableItems;
            if (itemType === "cosmetic") {
                const owned = await InventoryItem.find({ student: req.user._id }).select("shopItem");
                const ownedIds = owned.map(i => i.shopItem.toString());
                droppableItems = await ShopItem.find({ itemType: "cosmetic", isActive: true, _id: { $nin: ownedIds } });
                // Fall back to consumable if student owns all cosmetics
                if (droppableItems.length === 0) {
                    droppableItems = await ShopItem.find({ itemType: "consumable", isActive: true });
                }
            } else {
                droppableItems = await ShopItem.find({ itemType: "consumable", isActive: true });
            }

            const droppedItem = droppableItems.length
                ? droppableItems[Math.floor(Math.random() * droppableItems.length)]
                : null;

            if (droppedItem) {
                await InventoryItem.findOneAndUpdate(
                    { student: req.user._id, shopItem: droppedItem._id },
                    { $inc: { quantity: 1 } },
                    { upsert: true, new: true }
                );
            }

            reward = {
                xp: 20,
                leveledUp: pet.level > prevLevel,
                ...(droppedItem && { itemName: droppedItem.name, itemImage: droppedItem.imageKey }),
            };

        }

        res.json({
            petWon,
            rounds,
            reward,
            finalMonsterHP: petWon ? 0 : monsterHP,
            finalPetHP: petWon ? petHP : 0,
            petBattleHP: PET_BATTLE_HP,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to process battle." });
    }
});

module.exports = router;
