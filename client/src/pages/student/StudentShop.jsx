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
    const [purchase, setPurchase] = useState(null);
    const [currentPoints, setCurrentPoints] = useState(user?.points ?? 0);
    const [inventory, setInventory] = useState([]);
    const [ownedPets, setOwnedPets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [buyingId, setBuyingId] = useState(null);

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

            useEffect(() => {
            const fetchPets = async () => {
                try {
                    const res = await api.get("/api/pets/my-pets");
                    setOwnedPets(res.data);
                } catch (err) {
                    console.error("Failed to load pets");
                }
            };

            fetchPets();
        }, []);

    const isOwnedPermanently = (item) => {
        if (item.itemType === "pet") {
            return ownedPets.some((p) => p.species === item.petSpecies);
        }

        if (item.itemType === "cosmetic") {
            return (getInventoryForItem(item._id)?.quantity || 0) > 0;
        }

        return false;
    };

    const getInventoryForItem = (itemId) => {
        return inventory.find((inv) => inv.shopItem?._id === itemId);
    };

    const fetchInventory = async () => {
        const res = await api.get("/api/inventory/my-items");
        setInventory(res.data);
    };

    const fetchOwnedPets = async () => {
        const res = await api.get("/api/pets/my-pets");
        setOwnedPets(res.data);
    };

    const handleBuy = async (shopItemId) => {
        if (buyingId) return;

        setError("");
        setBuyingId(shopItemId);

        try {
            const res = await api.post("/api/shop/buy", { shopItemId });

            setCurrentPoints(res.data.points);
            updateUser({ points: res.data.points });
            if (res.data.pet) {
                await fetchOwnedPets();
            } else {
                await fetchInventory();
            }

            const bought = items.find((i) => i._id === shopItemId);
            setPurchase({
                name: bought?.name || "Item",
                imageKey: bought?.imageKey,
                message: res.data.message || "Purchase successful.",
            });
            setTimeout(() => setPurchase(null), 2600);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to buy item.");
        } finally {
            setBuyingId(null);
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

            {purchase && (
                <div className="purchase-popup" onClick={() => setPurchase(null)}>
                    <div className="purchase-card">
                        {purchase.imageKey && (
                            <img src={purchase.imageKey} alt={purchase.name} className="purchase-img" />
                        )}
                        <div className="purchase-title">{purchase.name}</div>
                        <div className="purchase-sub">{purchase.message}</div>
                    </div>
                </div>
            )}

            {loading && <p>Loading shop...</p>}

            {error && <div className="alert alert-danger">{error}</div>}


            <div className="btn-group btn-group-sm mb-3">
                {["all", "food", "toy", "care", "accessory", "background", "pet"].map((cat) => (
                    <button
                        key={cat}
                        className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {!loading && !error && (
                <div className="row g-3">
                    {items.length === 0 ? (
                        <p>No items available yet.</p>
                    ) : (items
                        .filter(item => selectedCategory === "all" || item.category === selectedCategory)
                        .slice()
                        .sort((a, b) => Number(isOwnedPermanently(a)) - Number(isOwnedPermanently(b)))
                        .map((item) => {
                            const ownedItem = getInventoryForItem(item._id);
                            const ownedQuantity = ownedItem?.quantity || 0;
                            const alreadyOwnsCosmetic =
                                item.itemType === "cosmetic" && ownedQuantity > 0;
                            const alreadyOwnsPet =
                                item.itemType === "pet" &&
                                ownedPets.some((p) => p.species === item.petSpecies);
                            const alreadyOwned =
                                alreadyOwnsCosmetic || alreadyOwnsPet;
                            const cannotAfford = currentPoints < item.cost;

                            return (
                                <div className="col-md-4" key={item._id}>
                                    <div className="shop-tile">
                                        <div className="shop-tile-image">
                                            {item.imageKey ? (
                                                <img
                                                    src={item.imageKey}
                                                    alt={item.name}
                                                    className="shop-tile-img"
                                                />
                                            ) : (
                                                item.name
                                            )}
                                        </div>
                                        <h5 className="shop-tile-name">{item.name}</h5>
                                        <p className="shop-tile-description">{item.description}</p>

                                        <div className="shop-tile-info">
                                            <div>
                                                <strong>Category:</strong> {item.category}
                                            </div>

                                            <div>
                                                <strong>Cost:</strong> {item.cost} pts
                                            </div>

                                            {ownedQuantity > 0 && (
                                                <div>
                                                    <strong>Owned:</strong>{" "}
                                                    {item.itemType === "cosmetic" ? "Yes" : ownedQuantity}
                                                </div>
                                            )}

                                            {item.itemType === "consumable" && (
                                                <div>
                                                    <strong>Effect:</strong> {item.effectType} +{item.effectValue}
                                                </div>
                                            )}

                                            <div>
                                                <strong>Unlock:</strong> Level {item.unlockLevel}
                                            </div>
                                        </div>

                                        <div className="shop-tile-actions">
                                            <button
                                                className="btn btn-primary mt-auto w-100"
                                                onClick={() => handleBuy(item._id)}
                                                disabled={buyingId !== null || cannotAfford || alreadyOwned}
                                            >
                                                {buyingId === item._id && (
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                )}
                                                {alreadyOwned
                                                    ? "Owned"
                                                    : cannotAfford
                                                    ? "Not Enough Points"
                                                    : item.itemType === "pet" 
                                                    ? "Adopt"
                                                    : "Buy"}
                                            </button>
                                        </div>
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