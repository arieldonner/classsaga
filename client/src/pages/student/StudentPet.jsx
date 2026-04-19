import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRef } from "react";
import api from "../../api/api";
import wolfyImage from "../../assets/pets/wolfy.png";

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

    const petImages = {
        wolfy: wolfyImage,
    };

    const [dailyStatus, setDailyStatus] = useState({
        feedUsed: false,
        playUsed: false,
        brushUsed: false,
    });

    const addMessage = (text) => {
        setMessages((prev) => [
            ...prev.slice(-19),
            { id: Date.now(), text },
        ]);
    };

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const res = await api.get("/api/pets/my-pet");
                setPet(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load pet.");
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
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
                    ? `Fed pet (Free) • Hunger +${hungerIncrease}`
                    : `Fed pet (-10 pts) • Hunger +${hungerIncrease}`;

            addMessage(actionMessage);

            if (res.data.pet.level > previousLevel) {
                addMessage(`Level Up! ${pet.name} reached Level ${res.data.pet.level}`);
                addMessage(
                    `Battle Stats Increased • STR ${res.data.pet.strength} • SPD ${res.data.pet.speed} • DEF ${res.data.pet.defense}`
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
                    ? `Played with pet (Free) • Happiness +${happinessIncrease}`
                    : `Played with pet (-10 pts) • Happiness +${happinessIncrease}`;

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
                    ? `Brushed pet (Free) • Cleanliness +${cleanlinessIncrease}`
                    : `Brushed pet (-10 pts) • Cleanliness +${cleanlinessIncrease}`;

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
                <div className="card shadow-sm p-4">
                    <div className="row align-items-center">
                        <div className="col-md-6 text-center mb-4 mb-md-0">
                            <div
                                className="border rounded bg-light d-flex align-items-center justify-content-center"
                                style={{ minHeight: "360px" }}
                            >
                                <div className={`pet-container ${hopDirection} ${reaction}`}>
                                    <img
                                        src={petImages[pet.species]}
                                        alt="Pet"
                                        className="img-fluid pet-idle"
                                        style={{ maxHeight: "300px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                        <h3 className="mb-2">{pet.name}</h3>
                        <p className="text-muted mb-2">
                            Species: {pet.species}
                        </p>

                        <p className="mb-1">
                            <strong>Level:</strong> {pet.level}
                        </p>
                        <p className="mb-2">
                            <strong>Experience:</strong> {pet.experience} / 100
                        </p>
                        
                        <div className="mt-3">
                            <h5 className="mb-2">Battle Stats</h5>

                            <div className="d-flex gap-4">
                                <div>
                                    <span className="fw-semibold">STR:</span> {pet.strength}
                                </div>

                                <div>
                                    <span className="fw-semibold">SPD:</span> {pet.speed}
                                </div>

                                <div>
                                    <span className="fw-semibold">DEF:</span> {pet.defense}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Hunger</label>
                            <div className="progress">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${pet.hunger}%` }}
                                    aria-valuenow={pet.hunger}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {pet.hunger}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Happiness</label>
                            <div className="progress">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${pet.happiness}%` }}
                                    aria-valuenow={pet.happiness}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {pet.happiness}
                                </div>
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="form-label fw-semibold">Cleanliness</label>
                            <div className="progress">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${pet.cleanliness}%` }}
                                    aria-valuenow={pet.cleanliness}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {pet.cleanliness}
                                </div>
                            </div>
                        </div>

                        {actionError && <div className="alert alert-danger mt-4">{actionError}</div>}

                        <div className="mt-3 d-flex gap-2 flex-wrap">
                            <button className="btn btn-success" onClick={handleFeed} disabled={dailyStatus.feedUsed && currentPoints < 10}>
                                {dailyStatus.feedUsed ? "Feed (10 pts)" : "Feed (Free)"}
                            </button>

                            <button className="btn btn-primary" onClick={handlePlay} disabled={dailyStatus.playUsed && currentPoints < 10}>
                                {dailyStatus.playUsed ? "Play (10 pts)" : "Play (Free)"}
                            </button>

                            <button className="btn btn-secondary" onClick={handleBrush} disabled={dailyStatus.brushUsed && currentPoints < 10}>
                                {dailyStatus.brushUsed ? "Brush (10 pts)" : "Brush (Free)"}
                            </button>
                        </div>
                        </div>
                    </div>
                    <div className="mt-4">
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
                            rows={6}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}