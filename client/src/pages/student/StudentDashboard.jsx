import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export default function StudentDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);

    const [pet, setPet] = useState(null);
    const [loadingPet, setLoadingPet] = useState(true);

    const [loginBonus, setLoginBonus] = useState(null);

    const navigate = useNavigate();

    const { updateUser } = useAuth();

    useEffect(() => {
        const fetchClassrooms = async () => {
        try {
            const res = await api.get("/api/classrooms/student-classrooms");
            setClassrooms(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load classrooms.");
        } finally {
            setLoading(false);
        }
        };

        fetchClassrooms();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get("/api/points/my-transactions");
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to load transactions");
        } finally {
            setLoadingTx(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);


    useEffect(() => {
        const fetchPet = async () => {
            try {
                const res = await api.get("/api/pets/my-pet");
                setPet(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    navigate("/student/choose-starter");
                } else {
                    console.error("Failed to load pet");
                }
            } finally {
                setLoadingPet(false);
            }
        };

        fetchPet();
    }, []);

    useEffect(() => {
        const claimLoginBonus = async () => {
            try {
                const res = await api.post("/api/points/daily-login");
                if (res.data.claimed) {
                    setLoginBonus({ points: res.data.pointsAwarded, message: res.data.message });
                    updateUser({ points: res.data.studentPoints });
                    await fetchTransactions();
                }
            } catch (err) {
                console.error("Failed to claim daily login bonus");
            }
        };

        claimLoginBonus();
    }, []);

    const statColor = (value) => {
        if (value >= 60) return "#4a9e6b";
        if (value >= 30) return "#c8922a";
        return "#c0392b";
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Dashboard</h2>
            </div>

            {loginBonus && (
                <div className="alert alert-success d-flex justify-content-between align-items-center">
                    <span>+{loginBonus.points} points for logging in today! {loginBonus.message}</span>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setLoginBonus(null)}
                    ></button>
                </div>
            )}

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <Link to="/student/pet" className="card shadow-sm p-4 text-decoration-none text-dark hover-effect h-100">
                        <div className="d-flex flex-column align-items-center text-center">
                            {pet && <img src={`/assets/pets/${pet.species}.png`} alt={pet.name} style={{ height: "80px", objectFit: "contain" }} />}
                            <h5 className="mt-2 mb-1">My Pet</h5>
                            {pet && <p className="text-muted mb-0">{pet.name} • Level {pet.level}</p>}
                        </div>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/student/battle" className="card shadow-sm p-4 text-decoration-none text-dark hover-effect h-100">
                        <div className="d-flex flex-column align-items-center text-center">
                            <img src="/assets/monsters/Slime.png" alt="Battle" style={{ height: "80px", objectFit: "contain" }} />
                            <h5 className="mt-2 mb-1">Battle</h5>
                            <p className="text-muted mb-0">Fight monsters and earn rewards!</p>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/student/shop" className="card shadow-sm p-4 text-decoration-none text-dark hover-effect h-100">
                        <div className="d-flex flex-column align-items-center text-center">
                            <img src="/assets/items/Quin.png" alt="Shop" style={{ height: "80px", objectFit: "contain" }} />
                            <h5 className="mt-2 mb-1">Shop</h5>
                            <p className="text-muted mb-0">Spend your points on items!</p>
                        </div>
                    </Link>
                </div>
            </div>

            {loading && <p>Loading classrooms...</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="card shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">My Classrooms</h4>
                        <Link to="/student/classrooms/join" className="btn btn-primary btn-sm">
                            Join Classroom
                        </Link>
                    </div>

                    {classrooms.length === 0 ? (
                        <p className="mb-0">You have not joined any classrooms yet. Join one to start earning points!</p>
                    ) : (
                        <div className="list-group">
                            {classrooms.map((classroom) => (
                                <div
                                key={classroom._id}
                                className="list-group-item"
                                >
                                    <h5 className="mb-1">{classroom.name}</h5>

                                    {classroom.description && (
                                        <p className="mb-1 text-muted">{classroom.description}</p>
                                    )}

                                    {classroom.teacher && (
                                        <small className="text-muted">
                                        Teacher: {classroom.teacher.name}
                                        </small>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="card shadow-sm p-4 mt-4">
                <h4 className="mb-3">Recent Activity</h4>
                {loadingTx ? (
                    <p>Loading activity...</p>
                ) : transactions.length === 0 ? (
                    <p className="mb-0">No recent activity yet. Complete actions or receive points to see updates here.</p>
                ) : (
                    <div className="list-group">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="list-group-item">
                            <div className="fw-semibold">
                                {tx.amount > 0 ? `+${tx.amount}` : tx.amount} points
                            </div>

                            <div className="text-muted">
                                {tx.reason}
                            </div>
                            <small className="text-muted">
                                {tx.classroom?.name || "Pet/Shop"} • {tx.teacher?.name || "System" } • {" "} {new Date(tx.createdAt).toLocaleString(undefined, {month: "short", day: "numeric", hour: "numeric", minute: "2-digit",})}
                            </small>
                            </div>
                        ))}
                    </div>
                )}
                </div>
        </div>
    );
}