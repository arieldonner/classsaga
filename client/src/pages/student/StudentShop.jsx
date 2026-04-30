import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import "./StudentShop.css";

export default function StudentShop() {
    const { user, updateUser } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const itemsRes = await api.get("/api/shop/items");
                setItems(itemsRes.data);

                const inventoryRes = await api.get("/api/inventory/my-items");
                setInventory(inventoryRes.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load shop.");
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    const getInventoryForItem = (itemId) => {
        return inventory.find((inv) => inv.shopItem?._id === itemId);
    };

    const fetchInventory = async () => {
        const res = await api.get("/api/inventory/my-items");
        setInventory(res.data);
    };

    const handleBuy = async (shopItemId) => {
        setError("");
        setMessage("");

        try {
            const res = await api.post("/api/shop/buy", { shopItemId });

            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });
            await fetchInventory();

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
                        items.map((item) => {
                            const ownedItem = getInventoryForItem(item._id);
                            const ownedQuantity = ownedItem?.quantity || 0;
                            const alreadyOwnsCosmetic =
                                item.itemType === "cosmetic" && ownedQuantity > 0;
                            const cannotAfford = currentPoints < item.cost;

                            return (
                                <div className="col-md-4" key={item._id}>
                                    <div className="card h-100 shadow-sm p-3">
                                        <div className="shop-item-image mb-2">
                                            {item.imageKey ? (
                                                <img
                                                    src={item.imageKey}
                                                    alt={item.name}
                                                    className="shop-item-img"
                                                />
                                            ) : (
                                                item.name
                                            )}
                                        </div>
                                        <h5>{item.name}</h5>
                                        <p className="text-muted mb-2">{item.description}</p>

                                        <p className="mb-1">
                                            <strong>Category:</strong> {item.category}
                                        </p>

                                        <p className="mb-1">
                                            <strong>Cost:</strong> {item.cost} pts
                                        </p>

                                        {ownedQuantity > 0 && (
                                            <p className="mb-1">
                                                <strong>Owned:</strong>{" "}
                                                {item.itemType === "cosmetic" ? "Yes" : ownedQuantity}
                                            </p>
                                        )}

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
                                            disabled={cannotAfford || alreadyOwnsCosmetic}
                                        >
                                            {alreadyOwnsCosmetic
                                                ? "Purchased"
                                                : cannotAfford
                                                ? "Not Enough Points"
                                                : "Buy"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}