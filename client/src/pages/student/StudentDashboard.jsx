import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

export default function StudentDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Student Dashboard</h2>

            <Link to="/student/classrooms/join" className="btn btn-primary">
            Join Classroom
            </Link>
        </div>

        {loading && <p>Loading classrooms...</p>}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
            <div className="card shadow-sm p-4">
            <h4 className="mb-3">My Classrooms</h4>

            {classrooms.length === 0 ? (
                <p className="mb-0">You have not joined any classrooms yet.</p>
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
        </div>
    );
}