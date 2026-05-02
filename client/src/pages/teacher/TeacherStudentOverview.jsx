import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

export default function TeacherStudentOverview() {
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get(`/api/classrooms/${id}/students-overview`);
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to load students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [id]);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Overview</h2>
                <Link to={`/teacher/classrooms/${id}`} className="btn btn-outline-secondary">
                    Back to Classroom
                </Link>
            </div>

            {loading ? (
                <p>Loading students...</p>
            ) : students.length === 0 ? (
                <p>No students in this classroom.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Points</th>
                                <th>Pet</th>
                                <th>Level</th>
                                <th>Hunger</th>
                                <th>Happiness</th>
                                <th>Cleanliness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s._id}>
                                    <td>
                                        {s.name}
                                        <br />
                                        <small className="text-muted">{s.username}</small>
                                    </td>
                                    <td>{s.points}</td>
                                    <td>{s.pet?.name || "No pet"}</td>
                                    <td>{s.pet?.level ?? "-"}</td>
                                    <td>{s.pet?.hunger ?? "-"}</td>
                                    <td>{s.pet?.happiness ?? "-"}</td>
                                    <td>{s.pet?.cleanliness ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}