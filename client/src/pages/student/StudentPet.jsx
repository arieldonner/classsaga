import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./StudentPet.css";
import AnchorTuner from "../../components/dev/AnchorTuner";
import StatIcon from "../../components/StatIcon";


const withRoam = (offset, roamX) => {
  if (!offset) return offset;
  const o = { ...offset };
  if (o.left)  o.left  = `calc(${o.left} + ${roamX}px)`;
  if (o.right) o.right = `calc(${o.right} - ${roamX}px)`;
  return o;
};

const addOffset = (base, delta) => {
    const d = String(delta ?? "0%").trim();
    return d.startsWith("-")
        ? `calc(${base} - ${d.slice(1)})`
        : `calc(${base} + ${d})`;
};

const ACCESSORY_SLOTS = ["headSide", "headTop", "eyes"];
const SLOT_ORDER = ["background", "headTop", "headSide", "eyes"];
const LOG_ICONS = {
    reward: "bi-arrow-up-circle-fill",
    cost: "bi-dash-circle-fill",
    neutral: "bi-dot",
};

const SLOT_LABELS = {
    background: "Background",
    headSide: "Side",
    headTop: "Head",
    eyes: "Face",
};

const resolveAccessory = (item, offsets, slot) => {
    if (!item || !slot) return undefined;

    const tuned = offsets?.accessoryOverrides?.[item.name]?.[slot];

    if (tuned) {
        return {
            left: tuned.x,
            top: tuned.y,
            width: tuned.width,
            translate: "-50% -50%",
            transform: tuned.flipX ? "scaleX(-1)" : undefined,
        };
    }

    const anchor = offsets?.anchors?.[slot];
    if (!anchor) return undefined;

    return {
        left: addOffset(anchor.x, item.offsetX),
        top: addOffset(anchor.y, item.offsetY),
        width: item.accessoryWidth ?? "20%",
        translate: "-50% -50%",
    };
};

export default function StudentPet() {
    const [pet, setPet] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");
    const [messages, setMessages] = useState([]);
    const { user, updateUser } = useAuth();
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);
    const logRef = useRef(null);
    const [roamX, setRoamX] = useState(0);
    const [facing, setFacing] = useState("right");
    const [traveling, setTraveling] = useState(false);
    const roamXRef = useRef(0);      // avoids a stale-closure read in the scheduler
    const [reaction, setReaction] = useState("");
    const [activeTab, setActiveTab] = useState("care");
    const [inventory, setInventory] = useState([]);
    const [statChanges, setStatChanges] = useState({});
    const [ownedPets, setOwnedPets] = useState([]);
    const [feedEffect, setFeedEffect] = useState(null);
    const [brushEffect, setBrushEffect] = useState(null);
    const [showBall, setShowBall] = useState(false);
    const [bookEffect, setBookEffect] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [selectedInventoryCategory, setSelectedInventoryCategory] = useState("all");
    const [animationOffsets, setAnimationOffsets] = useState({});
    const [artFacing, setArtFacing] = useState("left");
    const [travelDur, setTravelDur] = useState(1.1);

    const busy = Boolean(reaction || feedEffect || showBall || brushEffect || bookEffect);
    const [tuning, setTuning] = useState(false);
    const [pending, setPending] = useState(null);
    const flipped = (facing === "right") !== (artFacing === "right");

    const ROAM_RANGE = 140;   // px each side of center

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

    const bgKey = equipment.background?.shopItem?.imageKey;

    const petSceneStyle = bgKey
        ? { backgroundImage: `url(${bgKey})`, backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
        : { background: "var(--color-panel)" };

    const formatLogTime = (at) => {
        return new Date(at ?? Date.now()).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };


    const tunerAccessories = ACCESSORY_SLOTS
        .map((slot) => {
            const item = equipment[slot]?.shopItem;
            if (!item) return null;

            const tuned = animationOffsets?.accessoryOverrides?.[item.name]?.[slot];
            const anchor = animationOffsets?.anchors?.[slot];

            return {
                slot,
                name: item.name,
                imageKey: item.imageKey,
                start: tuned ?? {
                    x: anchor?.x ?? "50%",
                    y: anchor?.y ?? "30%",
                    width: item.accessoryWidth ?? "20%",
                },
            };
        })
        .filter(Boolean);

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

    const fetchPet = async () => {
            try {
                const res = await api.get("/api/pets/my-pet");
                setPet(res.data);
                setAnimationOffsets(res.data.animationOffsets || {});
                setArtFacing(res.data.artFacing || "left");
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

    useEffect(() => {
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
        setMessages(pet?.activityLog ?? []);
    }, [pet]);

    useEffect(() => {
        if (!pet?._id) return;
        setOwnedPets((prev) =>
            prev.map((owned) => (owned._id === pet._id ? { ...owned, ...pet } : owned))
        );
    }, [pet]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = 0;
        }
    }, [messages]);

    useEffect(() => {
        if (busy || tuning) { setTraveling(false); return; }
        let nextId, travelId;

        const schedule = () => {
            nextId = setTimeout(() => {
            const target = Math.round((Math.random() * 2 - 1) * ROAM_RANGE);
            const dist   = Math.abs(target - roamXRef.current);
            const dur    = Math.min(1.1, Math.max(0.6, dist / 130));   // ~130px/s

            setFacing(target > roamXRef.current ? "right" : "left");
            roamXRef.current = target;
            setRoamX(target);
            setTravelDur(dur);

            setTraveling(true);
            travelId = setTimeout(() => setTraveling(false), dur * 1000);   // was hardcoded 1100


            schedule();
            }, 3000 + Math.random() * 4000);                            // 3–7s, aperiodic
        };

        schedule();
        return () => { clearTimeout(nextId); clearTimeout(travelId); };
        }, [busy, tuning]);

    useEffect(() => {
        if (busy) setFacing("left");
    }, [busy]);


    const handleFeed = async () => {
        if (pending === "feed") return;
        setPending("feed");
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousHunger = pet.hunger;
            const previousExperience = pet.experience;
            
            const res = await api.post("/api/pets/feed");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            feedUsed: true,
            }));

            const hungerIncrease = res.data.pet.hunger - previousHunger;

            const xpGain = res.data.pet.level > previousLevel
                ? (100 - previousExperience) + res.data.pet.experience
                : res.data.pet.experience - previousExperience;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Fed ${res.data.pet.name} (Free) • Hunger +${hungerIncrease}`
                    : `Fed ${res.data.pet.name} (-10 pts) • Hunger +${hungerIncrease}`;

            showStatChanges({ hunger: hungerIncrease, experience: xpGain });

            if (res.data.pet.level > previousLevel) {
                triggerLevelUp();
            }
            setFeedEffect("/assets/effects/PetFood.png");
            setTimeout(() => {
                setFeedEffect(null);
                setReaction("react-feed");
                setTimeout(() => setReaction(""), 800);
            }, 2500);

        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to feed pet.");
        } finally {
            setPending(null);
        }
    };

    const handlePlay = async () => {
        if (pending === "play") return;
        setPending("play");
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousHappiness = pet.happiness;
            const previousExperience = pet.experience;

            const res = await api.post("/api/pets/play");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            playUsed: true,
            }));

            const happinessIncrease = res.data.pet.happiness - previousHappiness;

            const xpGain = res.data.pet.level > previousLevel
                ? (100 - previousExperience) + res.data.pet.experience
                : res.data.pet.experience - previousExperience;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Played with ${res.data.pet.name} (Free) • Happiness +${happinessIncrease}`
                    : `Played with ${res.data.pet.name} (-10 pts) • Happiness +${happinessIncrease}`;

            showStatChanges({ happiness: happinessIncrease, experience: xpGain });

            if (res.data.pet.level > previousLevel) {
                triggerLevelUp();
            }

            setShowBall(true);
            setTimeout(() => {
                setShowBall(false);
                setReaction("react-play");
                setTimeout(() => setReaction(""), 800);
            }, 2500);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to play with pet.");
        } finally {
            setPending(null);
        }
    };

    const handleBrush = async () => {
        if (pending === "brush") return;
        setPending("brush");
        setActionError("");

        try {
            const previousLevel = pet.level;
            const previousCleanliness = pet.cleanliness;   
            const previousExperience = pet.experience; 

            const res = await api.post("/api/pets/brush");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            brushUsed: true,
            }));

            const cleanlinessIncrease = res.data.pet.cleanliness - previousCleanliness;

            const xpGain = res.data.pet.level > previousLevel
                ? (100 - previousExperience) + res.data.pet.experience
                : res.data.pet.experience - previousExperience;

            const actionMessage =
                res.data.actionType === "free"
                    ? `Brushed ${res.data.pet.name} (Free) • Cleanliness +${cleanlinessIncrease}`
                    : `Brushed ${res.data.pet.name} (-10 pts) • Cleanliness +${cleanlinessIncrease}`;

            showStatChanges({ cleanliness: cleanlinessIncrease, experience: xpGain });

            if (res.data.pet.level > previousLevel) {
                triggerLevelUp();
            }

            setBrushEffect("/assets/effects/HairBrush.png");
            setTimeout(() => {
                setBrushEffect(null);
                setReaction("react-brush");
                setTimeout(() => setReaction(""), 800);
            }, 2500);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to brush pet.");
        } finally {
            setPending(null);
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
            const item = inventoryItem.shopItem;

            setTimeout(() => {
                setPet(updatedPet);
                if (item.animationType === "feed") {
                    setFeedEffect(item.imageKey);
                    setTimeout(() => setFeedEffect(null), 2500);
                } else if (item.animationType === "play") {
                    setShowBall(true);
                    setTimeout(() => setShowBall(false), 2500);
                } else if (item.animationType === "brush") {
                    setBrushEffect(item.imageKey);
                    setTimeout(() => setBrushEffect(null), 2500);
                } else if (item.animationType === "book") {
                    setBookEffect(item.imageKey);
                    setTimeout(() => setBookEffect(null), 2500);
                }
            }, 100);
            await fetchInventory();

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


            if (updatedPet.level > previousPet.level) {
                triggerLevelUp();
            }

            showStatChanges(changes);

        } catch (err) {
            console.error(err.response?.data?.message);
        }
    };

    const handleEquipItem = async (inventoryItem, slot) => {
        try {
            const res = await api.post("/api/inventory/equip", {
                inventoryItemId: inventoryItem._id,
                slot,
            });

            await fetchEquipment();

        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to equip item.");
        }
    };

    const slotOfItem = (shopItemId) =>
        SLOT_ORDER.find((s) => equipment[s]?.shopItem?._id === shopItemId);

    const handleUnequipItem = async (slot) => {
        setActionError("");

        try {
            const res = await api.post("/api/inventory/unequip", { slot });

            await fetchEquipment();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to unequip item.");
        }
    };

    const handleSwitchPet = async (petId) => {
        setActionError("");
        setStatChanges({});
        
        try {
            const res = await api.patch(`/api/pets/${petId}/activate`);

            await fetchPet();
            await fetchOwnedPets();
            await fetchEquipment();

            setActiveTab("care");
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to switch pet.");
        }
    };

    const handleRenamePet = async () => {
        if (!nameInput.trim()) return setIsEditingName(false);
        try {
            const res = await api.patch(`/api/pets/${pet._id}/rename`, { name: nameInput });
            setPet(res.data);
            setIsEditingName(false);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to rename pet.");
        }
    };

    const triggerLevelUp = () => {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
    };

    const statColor = (value) => {
        if (value >= 60) return "#4a9e6b";
        if (value >= 30) return "#c8922a";
        return "#c0392b";
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
                            <div className="card shadow-sm p-4">
                                <div className="pet-scene-wrapper position-relative">
                                    {activeTab === "inventory" && (
                                        <div className="equipment-slots">
                                            {SLOT_ORDER.map((slot) => (
                                                <div
                                                    key={slot}
                                                    className={`equipment-slot ${equipment[slot] ? "filled" : ""}`}
                                                    onClick={() => equipment[slot] && handleUnequipItem(slot)}
                                                >
                                                    <div className="slot-icon">
                                                        {equipment[slot]?.shopItem?.imageKey && (
                                                            <img
                                                                src={equipment[slot].shopItem.imageKey}
                                                                alt={equipment[slot].shopItem.name}
                                                                className="slot-img"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="slot-label">{SLOT_LABELS[slot]}</div>
                                                    <div className="slot-value">{equipment[slot]?.shopItem?.name || "Empty"}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div
                                        className="border rounded d-flex align-items-center justify-content-center"
                                        style={{ height: "500px", ...petSceneStyle }}
                                    >
                                        <div
                                            className={`pet-roamer ${traveling && !busy ? "traveling" : ""}`}
                                            style={{
                                                "--travel-dur": `${travelDur}s`,
                                                translate: tuning ? "0px 0" : `${roamX}px 0`,
                                                scale:     tuning ? "1 1"   : (flipped ? "-1 1" : "1 1"),
                                            }}
                                        >
                                            <div className="pet-shadow" style={animationOffsets?.shadow} />
                                            <div className={`pet-container ${reaction} ${feedEffect ? "eating" : ""} ${showBall ? "playing" : ""} ${brushEffect ? "brushing" : ""} ${bookEffect ? "playing" : ""}`  }>
                                                <div className={`pet-sprite ${tuning ? "" : "pet-idle"}`}>
                                                    <img
                                                        src={`/assets/pets/${pet.species}.png`}
                                                        alt="Pet"
                                                        className="img-fluid"
                                                        style={{ maxHeight: "340px" }}
                                                    />

                                                    {!tuning && ACCESSORY_SLOTS.map((slot) => {
                                                        const item = equipment[slot]?.shopItem;
                                                        if (!item?.imageKey) return null;
                                                        return (
                                                            <img
                                                                key={slot}
                                                                src={item.imageKey}
                                                                alt={item.name}
                                                                className="pet-accessory"
                                                                style={resolveAccessory(item, animationOffsets, slot)}
                                                            />
                                                        );
                                                    })}
                                                    {import.meta.env.DEV && (
                                                        <AnchorTuner
                                                            anchors={animationOffsets?.anchors}
                                                            species={pet.species}
                                                            onVisibilityChange={setTuning}
                                                            accessories={tunerAccessories}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                {feedEffect && (
                                    <img 
                                        src={feedEffect} 
                                        alt="Food" 
                                        className="pet-food-anim" 
                                        style={withRoam(animationOffsets?.feed,  roamX)}
                                    />
                                )}
                                {showBall && (
                                    <img
                                        src="/assets/effects/BallOfSlime.png"
                                        alt="Ball"
                                        className="pet-ball-anim"
                                        style={withRoam(animationOffsets?.ball,  roamX)}
                                    />
                                )}
                                {brushEffect && (
                                    <img
                                        src={brushEffect}
                                        alt="Brush"
                                        className="pet-brush-anim"
                                        style={withRoam(animationOffsets?.brush, roamX)}
                                    />
                                )}
                                {bookEffect && (
                                    <img
                                        src={bookEffect}
                                        alt="Book"
                                        className="pet-book-anim"
                                        style={withRoam(animationOffsets?.book,  roamX)}
                                    />
                                )}
                                {showLevelUp && (
                                    <div className="level-up-anim">Level Up!</div>
                                )}
                                </div>
                            </div>
                        </div>

                        {/* Stats / Inventory Card */}
                        <div className="col-md-6">
                            <div className="card shadow-sm p-4 h-100">

                                {/* Top Header Row */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        {isEditingName ? (
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <input
                                                    className="form-control form-control-sm"
                                                    style={{ maxWidth: "160px" }}
                                                    value={nameInput}
                                                    onChange={(e) => setNameInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleRenamePet()}
                                                    autoFocus
                                                    maxLength={20}
                                                />
                                                <button className="btn btn-sm btn-primary" onClick={handleRenamePet}>Save</button>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditingName(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h3 className="mb-0">{pet.name}</h3>
                                               <button
                                                    className="btn btn-sm"
                                                    onClick={() => { setNameInput(pet.name); setIsEditingName(true); }}
                                                    title="Rename pet"
                                                    style={{ color: "var(--color-border)", background: "none", border: "none", padding: "0 4px" }}
                                                >
                                                    <i className="bi bi-pencil-fill" style={{ fontSize: "0.8rem" }}></i>
                                                </button>
                                            </div>
                                        )}
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
                                        {statChanges.experience > 0 && (
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
                                                    <StatIcon kind="str" /><span className="fw-semibold">STR:</span> {pet.strength}
                                                    {statChanges.strength && (
                                                        <span className="text-success ms-2">+{statChanges.strength}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <StatIcon kind="spd" /><span className="fw-semibold">SPD:</span> {pet.speed}
                                                    {statChanges.speed && (
                                                        <span className="text-success ms-2">+{statChanges.speed}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <StatIcon kind="def" /><span className="fw-semibold">DEF:</span> {pet.defense}
                                                    {statChanges.defense && (
                                                        <span className="text-success ms-2">+{statChanges.defense}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Hunger{" "}
                                                {statChanges.hunger > 0 && (
                                                    <span className="text-success ms-2">+{statChanges.hunger}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.hunger}%`, backgroundColor: statColor(pet.hunger) }}
                                                >
                                                    {pet.hunger}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Happiness{" "}
                                                {statChanges.happiness > 0 && (
                                                    <span className="text-success ms-2">+{statChanges.happiness}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.happiness}%`, backgroundColor: statColor(pet.happiness) }}
                                                >
                                                    {pet.happiness}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Cleanliness{" "}
                                                {statChanges.cleanliness > 0 && (
                                                    <span className="text-success ms-2">+{statChanges.cleanliness}</span>
                                                )}
                                            </label>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${pet.cleanliness}%`, backgroundColor: statColor(pet.cleanliness) }}
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
                                                disabled={pending === "feed" || (dailyStatus.feedUsed && currentPoints < 10)}
                                            >
                                                {pending === "feed"
                                                    ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    : <img src="/assets/effects/PetFood.png" alt="" className="btn-sprite" style={{ height: "32px" }} />}
                                                {dailyStatus.feedUsed ? "Feed (10 pts)" : "Feed (Free)"}
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={handlePlay}
                                                disabled={pending === "play" || (dailyStatus.playUsed && currentPoints < 10)}
                                            >
                                                {pending === "play"
                                                    ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    : <img src="/assets/effects/BallOfSlime.png" alt="" className="btn-sprite" style={{ height: "26px" }} />}
                                                {dailyStatus.playUsed ? "Play (10 pts)" : "Play (Free)"}
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleBrush}
                                                disabled={pending === "brush" || (dailyStatus.brushUsed && currentPoints < 10)}
                                            >
                                                {pending === "brush"
                                                    ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    : <img src="/assets/effects/HairBrush.png" alt="" className="btn-sprite" style={{ height: "22px" }} />}
                                                {dailyStatus.brushUsed ? "Brush (10 pts)" : "Brush (Free)"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* INVENTORY TAB */}
                                {activeTab === "inventory" && (
                                    <div>
                                        <h5 className="mb-3">Inventory</h5>

                                        <div className="btn-group btn-group-sm mb-3">
                                            {["all", "food", "toy", "care", "accessory", "background"].map((cat) => (
                                                <button
                                                    key={cat}
                                                    className={`btn btn-sm ${selectedInventoryCategory === cat ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => setSelectedInventoryCategory(cat)}
                                                >
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </button>
                                            ))}
                                        </div>

                                        {inventory.length === 0 ? (
                                            <p className="mb-0">You do not own any items yet.</p>
                                        ) : (
                                            <div className="inventory-grid tab-scroll">
                                                {inventory
                                                .filter(inv => selectedInventoryCategory === "all" || inv.shopItem?.category === selectedInventoryCategory)
                                                .map((inv) => {
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
                                                                    <div>{item.equipSlots?.join(", ")}</div>
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

                                                                {item.itemType === "cosmetic" && (() => {
                                                                    const current = slotOfItem(item._id);

                                                                    if (!current) {
                                                                        return item.equipSlots?.map((slot) => (
                                                                            <button
                                                                                key={slot}
                                                                                className="btn btn-sm btn-outline-primary w-100 mb-1"
                                                                                onClick={() => handleEquipItem(inv, slot)}
                                                                            >
                                                                                {item.equipSlots.length > 1 ? `Equip · ${SLOT_LABELS[slot]}` : "Equip"}
                                                                            </button>
                                                                        ));
                                                                    }

                                                                    return (
                                                                        <>
                                                                            {item.equipSlots
                                                                                ?.filter((slot) => slot !== current)
                                                                                .map((slot) => (
                                                                                    <button
                                                                                        key={slot}
                                                                                        className="btn btn-sm btn-outline-primary w-100 mb-1"
                                                                                        onClick={() => handleEquipItem(inv, slot)}
                                                                                    >
                                                                                        Move · {SLOT_LABELS[slot]}
                                                                                    </button>
                                                                                ))}
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger w-100"
                                                                                onClick={() => handleUnequipItem(current)}
                                                                            >
                                                                                Unequip
                                                                            </button>
                                                                        </>
                                                                    );
                                                                })()}
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
                                            <div className="inventory-grid tab-scroll">
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

                        <div ref={logRef} className="activity-log">
                            {messages.length === 0 ? (
                                <p className="text-muted mb-0">No recent activity.</p>
                            ) : (
                                [...messages].reverse().map((msg, idx) => (
                                    <div key={msg._id ?? idx} className={`activity-row activity-${msg.type ?? "neutral"}`}>
                                        <i className={`bi ${LOG_ICONS[msg.type] ?? LOG_ICONS.neutral} me-2`} aria-hidden="true" />
                                        <span className="activity-time">{formatLogTime(msg.at)}</span>
                                        <span className="activity-text">{msg.text}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}