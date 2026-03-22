import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";

export default function JoinClassroom() {
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleJoinClassroom = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        await api.post("/api/classrooms/join", {
            joinCode,
        });

        navigate("/student");
        } catch (err) {
        setError(err.response?.data?.message || "Failed to join classroom.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Join Classroom</h2>
            <Link to="/student" className="btn btn-outline-secondary">
            Back to Dashboard
            </Link>
        </div>

        <div className="card shadow-sm p-4">
            <form onSubmit={handleJoinClassroom}>
            <div className="mb-3">
                <label className="form-label">Join Code</label>
                <input
                type="text"
                className="form-control"
                placeholder="Enter classroom code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? "Joining..." : "Join Classroom"}
            </button>
            </form>
        </div>
        </div>
    );
}