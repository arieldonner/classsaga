import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

// import wolfyImage from "../../assets/pets/wolfy.png";
// import penguImage from "../../assets/pets/Pengu.png";
// import snazakeImage from "../../assets/pets/Snazake.png";

import "./StudentPet.css";

export default function StudentPet() {
    const [pet, setPet] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");
    const [messages, setMessages] = useState([]);
    const { user, updateUser } = useAuth();
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);
    const logRef = useRef(null);
    const [hopDirection, setHopDirection] = useState("");
    const [reaction, setReaction] = useState("");
    const [activeTab, setActiveTab] = useState("care");
    const [inventory, setInventory] = useState([]);
    const [statChanges, setStatChanges] = useState({});
    const [ownedPets, setOwnedPets] = useState([]);

    const navigate = useNavigate();

    const [dailyStatus, setDailyStatus] = useState({
        feedUsed: false,
        playUsed: false,
        brushUsed: false,
    });

     const [equipment, setEquipment] = useState({
        background: null,
        accessory: null,
    });

    // Temporary use of imageKeys and css for background/accessories
    const backgroundStyles = {
    forest: { background: "linear-gradient(135deg, #2e7d32, #81c784)" },
    beach: { background: "linear-gradient(135deg, #0288d1, #b3e5fc)" },
    night: { background: "linear-gradient(135deg, #263238, #546e7a)" },
    };

    const bgKey = equipment.background?.shopItem?.imageKey;

    const petSceneStyle = backgroundStyles[bgKey] || {
        background: "#f8f9fa",
    };

    const accessory = equipment.accessory?.shopItem;

    const formatLogTime = () => {
        return new Date().toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const addMessage = (text) => {
        setMessages((prev) => [
            ...prev.slice(-19),
            { id: Date.now(), text: `[${formatLogTime()}] ${text}`, }, 
        ]);
    };

    const fetchInventory = async () => {
        try {
            const res = await api.get("/api/inventory/my-items");
            setInventory(res.data);
        } catch (err) {
            console.error("Failed to load inventory");
        }
    };

    const fetchOwnedPets = async () => {
        try {
            const res = await api.get("/api/pets/my-pets");
            setOwnedPets(res.data);
        } catch (err) {
            console.error("Failed to load pets");
        }
    };

    const showStatChanges = (changes) => {
        setStatChanges(changes);

        setTimeout(() => {
            setStatChanges({});
        }, 8000);
    };

    const fetchEquipment = async () => {
        try {
            const res = await api.get("/api/inventory/equipment");
            setEquipment(res.data);
        } catch (err) {
            console.error("Failed to load equipment");
        }
    };

    const isItemEquipped = (inventoryItem) => {
        return Object.values(equipment).some(
            (eq) => eq?.shopItem?._id === inventoryItem.shopItem?._id
        );
    };

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const res = await api.get("/api/pets/my-pet");
                setPet(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    navigate("/student/choose-starter");
                } else {
                    setError(err.response?.data?.message || "Failed to load pet.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
        fetchInventory();
        fetchOwnedPets();
        fetchEquipment();
    }, []);

    useEffect(() => {
        const fetchDailyStatus = async () => {
            try {
            const res = await api.get("/api/pets/daily-status");
            setDailyStatus(res.data);
            } catch (err) {
            console.error("Failed to load daily status");
            }
        };

        fetchDailyStatus();
    }, []);

    useEffect(() => {
        const storedMessages = localStorage.getItem("petMessages");
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("petMessages", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (reaction) return;
            const direction = Math.random() > 0.5 ? "hop-right" : "hop-left";
            setHopDirection(direction);

            setTimeout(() => {
                setHopDirection("");
            }, 600);
        }, 9000);

        return () => clearInterval(interval);
    }, [reaction]);

    const handleFeed = async () => {
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousHunger = pet.hunger;
            
            const res = await api.post("/api/pets/feed");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            feedUsed: true,
            }));

            const hungerIncrease = res.data.pet.hunger - previousHunger;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Fed ${res.data.pet.name} (Free) • Hunger +${hungerIncrease}`
                    : `Fed ${res.data.pet.name} (-10 pts) • Hunger +${hungerIncrease}`;

            addMessage(actionMessage);

            if (res.data.pet.level > previousLevel) {
                addMessage(`Level Up! ${res.data.pet.name} reached Level ${res.data.pet.level}`);
                addMessage(
                    `${res.data.pet.name} Battle Stats Increased • STR ${res.data.pet.strength} • SPD ${res.data.pet.speed} • DEF ${res.data.pet.defense}`
                );
            }
            setReaction("react-feed");
            setTimeout(() => {
                setReaction("");
            }, 500);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to feed pet.");
        }
    };

    const handlePlay = async () => {
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousHappiness = pet.happiness;

            const res = await api.post("/api/pets/play");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            playUsed: true,
            }));

            const happinessIncrease = res.data.pet.happiness - previousHappiness;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Played with ${res.data.pet.name} (Free) • Happiness +${happinessIncrease}`
                    : `Played with ${res.data.pet.name} (-10 pts) • Happiness +${happinessIncrease}`;

            addMessage(actionMessage);

            if (res.data.pet.level > previousLevel) {
                addMessage(`Level Up! ${pet.name} reached Level ${res.data.pet.level}`);
                addMessage(
                    `Battle Stats Increased • STR ${res.data.pet.strength} • SPD ${res.data.pet.speed} • DEF ${res.data.pet.defense}`
                );
            }

            setReaction("react-play");
            setTimeout(() => {
                setReaction("");
            }, 600);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to play with pet.");
        }
    };

    const handleBrush = async () => {
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousCleanliness = pet.cleanliness;    

            const res = await api.post("/api/pets/brush");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            brushUsed: true,
            }));

            const cleanlinessIncrease = res.data.pet.cleanliness - previousCleanliness;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Brushed ${res.data.pet.name} (Free) • Cleanliness +${cleanlinessIncrease}`
                    : `Brushed ${res.data.pet.name} (-10 pts) • Cleanliness +${cleanlinessIncrease}`;

            addMessage(actionMessage);

            if (res.data.pet.level > previousLevel) {
                addMessage(`Level Up! ${pet.name} reached Level ${res.data.pet.level}`);
                addMessage(
                    `Battle Stats Increased • STR ${res.data.pet.strength} • SPD ${res.data.pet.speed} • DEF ${res.data.pet.defense}`
                );
            }

            setReaction("react-brush");
            setTimeout(() => {
                setReaction("");
            }, 400);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to brush pet.");
        }
    };

    const handleUseItem = async (inventoryItem) => {
        setActionError("");
        setActiveTab("care");

        try {
            const previousPet = { ...pet };
            const res = await api.post("/api/inventory/use", {
                inventoryItemId: inventoryItem._id,
            });

            const updatedPet = res.data.pet;
            setTimeout(() => {
                setPet(updatedPet);
            }, 100);
            await fetchInventory();

            const item = inventoryItem.shopItem;

            const messages = [`Used ${item.name} on ${updatedPet.name}`];

            const changes = {};

            if (updatedPet.hunger > previousPet.hunger) {
                messages.push(`Hunger +${updatedPet.hunger - previousPet.hunger}`);
                changes.hunger = updatedPet.hunger - previousPet.hunger;
            }

            if (updatedPet.happiness > previousPet.happiness) {
                messages.push(`Happiness +${updatedPet.happiness - previousPet.happiness}`);
                changes.happiness = updatedPet.happiness - previousPet.happiness;
            }

            if (updatedPet.cleanliness > previousPet.cleanliness) {
                messages.push(`Cleanliness +${updatedPet.cleanliness - previousPet.cleanliness}`);
                changes.cleanliness = updatedPet.cleanliness - previousPet.cleanliness;
            }

            if (updatedPet.experience > previousPet.experience) {
                messages.push(`XP +${updatedPet.experience - previousPet.experience}`);
                changes.experience = item.xpValue;
            }

            if (updatedPet.strength > previousPet.strength) {
                messages.push(`STR +${updatedPet.strength - previousPet.strength}`);
                changes.strength = item.strengthValue;
            }

            if (updatedPet.speed > previousPet.speed) {
                messages.push(`SPD +${updatedPet.speed - previousPet.speed}`);
                changes.speed = item.speedValue;
            }

            if (updatedPet.defense > previousPet.defense) {
                messages.push(`DEF +${updatedPet.defense - previousPet.defense}`);
                changes.defense = item.defenseValue;
            }

            addMessage(messages.join(" • "));

            if (updatedPet.level > previousPet.level) {
                addMessage(`Level Up! ${updatedPet.name} reached Lv ${updatedPet.level}`);
            }

            showStatChanges(changes);

        } catch (err) {
            console.error(err.response?.data?.message);
        }
    };

    const handleEquipItem = async (inventoryItem) => {
        try {
            const res = await api.post("/api/inventory/equip", {
                inventoryItemId: inventoryItem._id,
            });

            await fetchEquipment();

            addMessage(res.data.message);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to equip item.");
        }
    };

    const handleUnequipItem = async (slot) => {
        setActionError("");

        try {
            const res = await api.post("/api/inventory/unequip", { slot });

            await fetchEquipment();
            addMessage(res.data.message);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to unequip item.");
        }
    };

    const handleSwitchPet = async (petId) => {
        setActionError("");
        setStatChanges({});
        
        try {
            const res = await api.patch(`/api/pets/${petId}/activate`);

            setPet(res.data.pet);
            await fetchOwnedPets();
            await fetchEquipment();

            addMessage(res.data.message);
            setActiveTab("care");
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to switch pet.");
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Pet</h2>
                <Link to="/student" className="btn btn-outline-secondary">
                Back to Dashboard
                </Link>
            </div>

            {loading && <p>Loading pet...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && pet && (
                <>
                    <div className="row g-4 mb-4">
                        {/* Pet Card */}
                        <div className="col-md-6">
                            <div className="card shadow-sm p-4 h-100">
                                <div className="pet-scene-wrapper position-relative">
                                    {activeTab === "inventory" && (
                                        <div className="equipment-slots">
                                            <div
                                                className={`equipment-slot ${equipment.background ? "filled" : ""}`}
                                                onClick={() =>
                                                    equipment.background && handleUnequipItem("background")
                                                }
                                            >
                                                <div className="slot-icon">
                                                    {equipment.background?.shopItem?.imageKey && (
                                                        <img
                                                            src={equipment.background.shopItem.imageKey}
                                                            alt={equipment.background.shopItem.name}
                                                            className="slot-img"
                                                        />
                                                    )}
                                                </div>

                                                <div className="slot-label">Background</div>

                                                <div className="slot-value">
                                                    {equipment.background?.shopItem?.name || "Empty"}
                                                </div>
                                            </div>

                                            <div
                                                className={`equipment-slot ${equipment.accessory ? "filled" : ""}`}
                                                onClick={() =>
                                                    equipment.accessory && handleUnequipItem("accessory")
                                                }
                                            >
                                                <div className="slot-icon">
                                                    {equipment.accessory?.shopItem?.imageKey && (
                                                        <img
                                                            src={equipment.accessory.shopItem.imageKey}
                                                            alt={equipment.accessory.shopItem.name}
                                                            className="slot-img"
                                                        />
                                                    )}
                                                </div>

                                                <div className="slot-label">Accessory</div>

                                                <div className="slot-value">
                                                    {equipment.accessory?.shopItem?.name || "Empty"}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className="border rounded d-flex align-items-center justify-content-center h-100"
                                        style={{ minHeight: "420px", ...petSceneStyle }}
                                    >
                                        <div className={`pet-container ${hopDirection} ${reaction}`}>
                                            <div className="pet-sprite pet-idle">
                                                <img
                                                    src={`/assets/pets/${pet.species}.png`}
                                                    alt="Pet"
                                                    className="img-fluid"
                                                    style={{ maxHeight: "340px" }}
                                                />

                                                {accessory?.imageKey && (
                                                    <img
                                                        src={accessory.imageKey}
                                                        alt={accessory.name}
                                                        className="pet-accessory"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Inventory Card */}
                        <div className="col-md-6">
                            <div className="card shadow-sm p-4 h-100">

                                {/* Top Header Row */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h3 className="mb-1">{pet.name}</h3>
                                        <p className="text-muted mb-1">Species: {pet.species}</p>

                                        <p className="mb-1">
                                            <strong>Level:</strong> {pet.level}
                                        </p>
                                    </div>

                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className={`btn ${
                                                activeTab === "care"
                                                    ? "btn-primary"
                                                    : "btn-outline-primary"
                                            }`}
                                            onClick={() => setActiveTab("care")}
                                        >
                                            Care
                                        </button>

                                        <button
                                            className={`btn ${
                                                activeTab === "inventory"
                                                    ? "btn-primary"
                                                    : "btn-outline-primary"
                                            }`}
                                            onClick={() => setActiveTab("inventory")}
                                        >
                                            Inventory
                                        </button>

                                        <button
                                            className={`btn ${
                                                activeTab === "pets"
                                                    ? "btn-primary"
                                                    : "btn-outline-primary"
                                            }`}
                                            onClick={() => setActiveTab("pets")}
                                        >
                                            Pets
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        XP ({pet.experience} / 100)
                                        {statChanges.experience && (
                                            <span className="text-success ms-2">+{statChanges.experience}</span>
                                        )}
                                    </label>

                                    <div className="progress">
                                        <div
                                            className="progress-bar bg-info"
                                            role="progressbar"
                                            style={{ width: `${pet.experience}%` }}
                                            aria-valuenow={pet.experience}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            {pet.experience}
                                        </div>
                                    </div>
                                </div>

                                {/* CARE TAB */}
                                {activeTab === "care" && (
                                    <>
                                        <div className="mb-4">
                                            <h5 className="mb-2">Battle Stats</h5>

                                            <div className="d-flex gap-4 flex-wrap">
                                                <div>
                                                    <span className="fw-semibold">STR:</span> {pet.strength}
                                                    {statChanges.strength && (
                                                        <span className="text-success ms-2">+{statChanges.strength}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="fw-semibold">SPD:</span> {pet.speed}
                                                    {statChanges.speed && (
                                                        <span className="text-success ms-2">+{statChanges.speed}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="fw-semibold">DEF:</span> {pet.defense}
                                                    {statChanges.defense && (
                                                        <span className="text-success ms-2">+{statChanges.defense}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Hunger{" "}
                                                {statChanges.hunger && (
                                                    <span className="text-success ms-2">+{statChanges.hunger}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.hunger}%` }}
                                                >
                                                    {pet.hunger}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Happiness{" "}
                                                {statChanges.happiness && (
                                                    <span className="text-success ms-2">+{statChanges.happiness}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.happiness}%` }}
                                                >
                                                    {pet.happiness}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Cleanliness{" "}
                                                {statChanges.cleanliness && (
                                                    <span className="text-success ms-2">+{statChanges.cleanliness}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.cleanliness}%` }}
                                                >
                                                    {pet.cleanliness}
                                                </div>
                                            </div>
                                        </div>

                                        {actionError && (
                                            <div className="alert alert-danger mt-3">
                                                {actionError}
                                            </div>
                                        )}

                                        <div className="mt-3 d-flex gap-2 flex-wrap">
                                            <button
                                                className="btn btn-success"
                                                onClick={handleFeed}
                                                disabled={dailyStatus.feedUsed && currentPoints < 10}
                                            >
                                                {dailyStatus.feedUsed ? "Feed (10 pts)" : "Feed (Free)"}
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={handlePlay}
                                                disabled={dailyStatus.playUsed && currentPoints < 10}
                                            >
                                                {dailyStatus.playUsed ? "Play (10 pts)" : "Play (Free)"}
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleBrush}
                                                disabled={dailyStatus.brushUsed && currentPoints < 10}
                                            >
                                                {dailyStatus.brushUsed ? "Brush (10 pts)" : "Brush (Free)"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* INVENTORY TAB */}
                                {activeTab === "inventory" && (
                                    <div>
                                        <h5 className="mb-3">Inventory</h5>

                                        {inventory.length === 0 ? (
                                            <p className="mb-0">You do not own any items yet.</p>
                                        ) : (
                                            <div className="inventory-grid">
                                                {inventory.map((inv) => {
                                                    const item = inv.shopItem;

                                                    return (
                                                        <div className="inventory-tile" key={inv._id}>
                                                            <div className="tile-image">
                                                                {item.imageKey ? (
                                                                    <img
                                                                        src={item.imageKey}
                                                                        alt={item.name}
                                                                        className="tile-img"
                                                                    />
                                                                ) : (
                                                                    item.name
                                                                )}
                                                            </div>

                                                            {item.itemType === "consumable" && (
                                                                <span className="tile-quantity">
                                                                    x{inv.quantity}
                                                                </span>
                                                            )}

                                                            <div className="tile-name">
                                                                {item.name}
                                                            </div>

                                                            <div className="tile-effect">
                                                                {item.itemType === "consumable" ? (
                                                                    <>
                                                                        {item.effectType !== "none" && (
                                                                            <div>
                                                                                {item.effectType} +{item.effectValue}
                                                                            </div>
                                                                        )}

                                                                        {item.xpValue > 0 && (
                                                                            <div>
                                                                                XP +{item.xpValue}
                                                                            </div>
                                                                        )}

                                                                        {(item.strengthValue > 0 ||
                                                                            item.speedValue > 0 ||
                                                                            item.defenseValue > 0) && (
                                                                            <div>
                                                                                {item.strengthValue > 0 && `STR +${item.strengthValue} `}
                                                                                {item.speedValue > 0 && `SPD +${item.speedValue} `}
                                                                                {item.defenseValue > 0 && `DEF +${item.defenseValue}`}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div>{item.equipSlot}</div>
                                                                )}
                                                            </div>

                                                            <div className="tile-actions">
                                                                {item.itemType === "consumable" && (
                                                                    <button
                                                                        className="btn btn-sm btn-success w-100"
                                                                        onClick={() => handleUseItem(inv)}
                                                                    >
                                                                        Use
                                                                    </button>
                                                                )}

                                                                {item.itemType === "cosmetic" && (
                                                                    isItemEquipped(inv) ? (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger w-100"
                                                                            onClick={() => handleUnequipItem(item.equipSlot)}
                                                                        >
                                                                            Unequip
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary w-100"
                                                                            onClick={() => handleEquipItem(inv)}
                                                                        >
                                                                            Equip
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "pets" && (
                                    <div>
                                        <h5 className="mb-3">My Pets</h5>

                                        {ownedPets.length === 0 ? (
                                            <p className="mb-0">You do not own any pets yet.</p>
                                        ) : (
                                            <div className="inventory-grid">
                                                {ownedPets.map((ownedPet) => (
                                                    <div className="inventory-tile" key={ownedPet._id}>
                                                        <div className="tile-image">
                                                            <img
                                                                src={`/assets/pets/${ownedPet.species}.png`}
                                                                alt={ownedPet.name}
                                                                className="tile-img"
                                                            />
                                                        </div>

                                                        <div className="tile-name">
                                                            {ownedPet.name}
                                                        </div>

                                                        <div className="tile-effect">
                                                            <div>Level {ownedPet.level}</div>
                                                        </div>

                                                        <div className="tile-actions">
                                                            {ownedPet.isActive ? (
                                                                <button
                                                                    className="btn btn-sm btn-secondary w-100"
                                                                    disabled
                                                                >
                                                                    Active
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary w-100"
                                                                    onClick={() => handleSwitchPet(ownedPet._id)}
                                                                >
                                                                    Switch
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Activity Log */}
                    <div className="card shadow-sm p-4">
                        <h5 className="mb-2">Activity Log</h5>

                        <textarea
                            ref={logRef}
                            className="form-control bg-light"
                            value={
                                messages.length === 0
                                    ? "No recent activity."
                                    : messages.map((msg) => msg.text).join("\n")
                            }
                            readOnly
                            rows={5}
                        />
                    </div>
                </>
            )}
        </div>
    );
}