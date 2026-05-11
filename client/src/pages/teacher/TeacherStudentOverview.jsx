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

    const statColor = (value) => {
        if (value >= 60) return "#4a9e6b";
        if (value >= 30) return "#c8922a";
        return "#c0392b";
    };

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
                                <th style={{ width: "250px" }}>Name</th>
                                <th>Points</th>
                                <th>Pet</th>
                                <th>Level</th>
                                <th>Hunger</th>
                                <th>Happiness</th>
                                <th>Cleanliness</th>
                                <th style={{ width: "125px" }}>Last Active</th>
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
                                    <td>
                                        {s.pet ? (
                                            <div className="progress" style={{ height: "8px", width: "80px" }}>
                                                <div className="progress-bar" style={{ width: `${s.pet.hunger}%`, backgroundColor: statColor(s.pet.hunger) }} />
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td>
                                        {s.pet ? (
                                            <div className="progress" style={{ height: "8px", width: "80px" }}>
                                                <div className="progress-bar" style={{ width: `${s.pet.happiness}%`, backgroundColor: statColor(s.pet.happiness) }} />
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td>
                                        {s.pet ? (
                                            <div className="progress" style={{ height: "8px", width: "80px" }}>
                                                <div className="progress-bar" style={{ width: `${s.pet.cleanliness}%`, backgroundColor: statColor(s.pet.cleanliness) }} />
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td>
                                        {s.pet?.updatedAt
                                            ? new Date(s.pet.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}