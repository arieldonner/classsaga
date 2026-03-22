import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

export default function TeacherClassroomDetails() {
    const { id } = useParams();

    const [classroom, setClassroom] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassroom = async () => {
        try {
            const res = await api.get(`/api/classrooms/${id}`);
            setClassroom(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load classroom.");
        } finally {
            setLoading(false);
        }
        };

        fetchClassroom();
    }, [id]);

    return (
        <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Classroom Details</h2>
            <Link to="/teacher" className="btn btn-outline-secondary">
            Back to Dashboard
            </Link>
        </div>

        {loading && <p>Loading classroom...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && classroom && (
            <>
            <div className="card shadow-sm p-4 mb-4">
                <h3 className="mb-2">{classroom.name}</h3>

                {classroom.description && (
                <p className="text-muted mb-3">{classroom.description}</p>
                )}

                <p className="mb-1">
                <strong>Join Code:</strong> {classroom.joinCode}
                </p>

                {classroom.teacher && (
                <p className="mb-0">
                    <strong>Teacher:</strong> {classroom.teacher.name}
                </p>
                )}
            </div>

            <div className="card shadow-sm p-4">
                <h4 className="mb-3">Students</h4>

                {classroom.students.length === 0 ? (
                <p className="mb-0">No students have joined this classroom yet.</p>
                ) : (
                <div className="list-group">
                    {classroom.students.map((student) => (
                    <div key={student._id} className="list-group-item">
                        <h5 className="mb-1">{student.name}</h5>
                        {student.username && (
                        <small className="text-muted">
                            Username: {student.username}
                        </small>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </div>
            </>
        )}
        </div>
    );
}