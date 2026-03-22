import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";

export default function CreateClassroom() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/api/classrooms", {
                name,
                description,
        });

            navigate("/teacher");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create classroom.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Create Classroom</h2>
                <Link to="/teacher" className="btn btn-outline-secondary">
                Back to Dashboard
                </Link>
            </div>

            <div className="card shadow-sm p-4">
                <form onSubmit={handleCreateClassroom}>
                    <div className="mb-3">
                        <label className="form-label">Classroom Name</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="Example: Math Period 1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description (optional)</label>
                        <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Optional description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Classroom"}
                    </button>
                </form>
            </div>
        </div>
    );
}