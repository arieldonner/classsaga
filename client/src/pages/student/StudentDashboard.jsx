import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function StudentDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);

    const [pet, setPet] = useState(null);
    const [loadingPet, setLoadingPet] = useState(true);

    const navigate = useNavigate();

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

    useEffect(() => {
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

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Dashboard</h2>
                <div className="d-flex gap-2">
                    <Link to="/student/shop" className="btn btn-outline-primary">
                        Go to Shop
                    </Link>

                    <Link to="/student/classrooms/join" className="btn btn-primary">
                        Join Classroom
                    </Link>
                </div>
            </div>

            <Link to="/student/pet" className="card shadow-sm p-4 mb-4 text-decoration-none text-dark">
                <div className="d-flex align-items-center gap-4">
                    {pet && (
                        <img
                            src={`/assets/pets/${pet.species}.png`}
                            alt={pet.name}
                            style={{ height: "100px", objectFit: "contain" }}
                        />
                    )}
                    <div className="d-flex flex-column">
                        <h4 className="mb-1">My Pet</h4>
                        {loadingPet ? (
                            <p className="mb-0">Loading pet...</p>
                        ) : pet ? (
                            <>
                                <p className="mb-2">{pet.name} • Level {pet.level} • XP {pet.experience}/100</p>
                                <div className="d-flex gap-3">
                                    <div>
                                        <small className="text-muted d-block">Hunger</small>
                                        <div className="progress" style={{ height: "8px", width: "80px" }}>
                                            <div className="progress-bar" style={{ width: `${pet.hunger}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Happiness</small>
                                        <div className="progress" style={{ height: "8px", width: "80px" }}>
                                            <div className="progress-bar bg-warning" style={{ width: `${pet.happiness}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Cleanliness</small>
                                        <div className="progress" style={{ height: "8px", width: "80px" }}>
                                            <div className="progress-bar bg-info" style={{ width: `${pet.cleanliness}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="mb-0">No pet found.</p>
                        )}
                    </div>
                </div>
            </Link>

            {loading && <p>Loading classrooms...</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="card shadow-sm p-4">
                    <h4 className="mb-3">My Classrooms</h4>

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