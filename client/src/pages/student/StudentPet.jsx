import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import wolfyImage from "../../assets/pets/wolfy.png";

export default function StudentPet() {
    const [pet, setPet] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const { user, updateUser } = useAuth();
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);

    const petImages = {
        wolfy: wolfyImage,
    };

    const [dailyStatus, setDailyStatus] = useState({
        feedUsed: false,
        playUsed: false,
        brushUsed: false,
    });

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

    const handleFeed = async () => {
        setActionError("");
        setActionSuccess("");

        try {
            const res = await api.post("/api/pets/feed");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            feedUsed: true,
            }));

            setActionSuccess(
                res.data.actionType === "free"
                    ? "You fed your pet for free."
                    : "You fed your pet using points."
            );
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to feed pet.");
        }
    };

    const handlePlay = async () => {
        setActionError("");
        setActionSuccess("");

        try {
            const res = await api.post("/api/pets/play");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            playUsed: true,
            }));

            setActionSuccess(
                res.data.actionType === "free"
                    ? "You played with your pet for free."
                    : "You played with your pet using points."
            );
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to play with pet.");
        }
    };

    const handleBrush = async () => {
        setActionError("");
        setActionSuccess("");

        try {
            const res = await api.post("/api/pets/brush");
            setPet(res.data.pet);
            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setDailyStatus((prev) => ({
            ...prev,
            brushUsed: true,
            }));

            setActionSuccess(
                res.data.actionType === "free"
                    ? "You brushed your pet for free."
                    : "You brushed your pet using points."
            );
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
                        <div className="col-md-4 text-center mb-4 mb-md-0">
                            <div
                                className="border rounded bg-light d-flex align-items-center justify-content-center"
                                style={{ minHeight: "260px" }}
                            >
                                <img
                                    src={petImages[pet.species]}
                                    alt="Pet"
                                    className="img-fluid"
                                    style={{ maxHeight: "240px" }}
                                />
                            </div>
                        </div>

                        <div className="col-md-8">
                        <h3 className="mb-2">{pet.name}</h3>
                        <p className="text-muted mb-3">
                            Species: {pet.species}
                        </p>

                        <p className="mb-2">
                            <strong>Level:</strong> {pet.level}
                        </p>
                        <p className="mb-4">
                            <strong>Experience:</strong> {pet.experience}
                        </p>

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
                        {actionSuccess && <div className="alert alert-success mt-4">{actionSuccess}</div>}

                        <div className="mt-4 d-flex gap-2">
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
                </div>
            )}
        </div>
    );
}