import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

export default function TeacherStudentOverview() {
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

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

    const displayedStudents = [...students]
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === "points") return b.points - a.points;
        if (sortBy === "level") return (b.pet?.level ?? 0) - (a.pet?.level ?? 0);
        if (sortBy === "lastActive") return new Date(b.pet?.updatedAt ?? 0) - new Date(a.pet?.updatedAt ?? 0);
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Student Overview</h2>
                <Link to={`/teacher/classrooms/${id}`} className="btn btn-outline-secondary">
                    Back to Classroom
                </Link>
            </div>

            <div className="d-flex gap-3 mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name..."
                    style={{ maxWidth: "250px" }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ maxWidth: "180px" }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="name">Sort: Name</option>
                    <option value="points">Sort: Points</option>
                    <option value="level">Sort: Level</option>
                    <option value="lastActive">Sort: Last Active</option>
                </select>
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
                            {displayedStudents.map((s) => (
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