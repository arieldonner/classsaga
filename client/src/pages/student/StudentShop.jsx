import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export default function StudentShop() {
    const { user, updateUser } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get("/api/shop/items");
                setItems(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load shop items.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleBuy = async (shopItemId) => {
        setError("");
        setMessage("");

        try {
            const res = await api.post("/api/shop/buy", { shopItemId });

            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });

            setMessage(res.data.message || "Item purchased successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to buy item.");
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Shop</h2>
                    <p className="mb-0 text-muted">Points: {currentPoints}</p>
                </div>

                <Link to="/student" className="btn btn-outline-secondary">
                    Back to Dashboard
                </Link>
            </div>

            {loading && <p>Loading shop...</p>}

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            {!loading && !error && (
                <div className="row g-3">
                    {items.length === 0 ? (
                        <p>No items available yet.</p>
                    ) : (
                        items.map((item) => (
                            <div className="col-md-4" key={item._id}>
                                <div className="card h-100 shadow-sm p-3">
                                    <h5>{item.name}</h5>
                                    <p className="text-muted mb-2">{item.description}</p>

                                    <p className="mb-1">
                                        <strong>Category:</strong> {item.category}
                                    </p>

                                    <p className="mb-1">
                                        <strong>Cost:</strong> {item.cost} pts
                                    </p>

                                    {item.itemType === "consumable" && (
                                        <p className="mb-1">
                                            <strong>Effect:</strong> {item.effectType} +{item.effectValue}
                                        </p>
                                    )}

                                    <p className="mb-3">
                                        <strong>Unlock Level:</strong> {item.unlockLevel}
                                    </p>

                                    <button
                                        className="btn btn-primary mt-auto"
                                        onClick={() => handleBuy(item._id)}
                                        disabled={currentPoints < item.cost}
                                    >
                                        {currentPoints < item.cost ? "Not Enough Points" : "Buy"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}