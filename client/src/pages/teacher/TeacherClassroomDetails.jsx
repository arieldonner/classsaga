import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

export default function TeacherClassroomDetails() {
    const { id } = useParams();

    const [classroom, setClassroom] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [awardError, setAwardError] = useState("");
    const [awardSuccess, setAwardSuccess] = useState("");
    const [awarding, setAwarding] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editError, setEditError] = useState("");

    const [activity, setActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

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

    const fetchActivity = async () => {
        try {
            const res = await api.get(`/api/points/classroom/${id}`);
            setActivity(res.data);
        } catch (err) {
            console.error("Failed to load classroom activity");
        } finally {
            setLoadingActivity(false);
        }
    };

    useEffect(() => {
        fetchClassroom();
    }, [id]);

    useEffect(() => {
        fetchActivity();
    }, [id]);

    const startEdit = () => {
        setEditName(classroom.name);
        setEditDescription(classroom.description || "");
        setEditError("");
        setEditing(true);
    };

    const handleUpdateClassroom = async (e) => {
        e.preventDefault();
        setEditError("");

        if (!editName.trim()) {
            setEditError("Classroom name is required.");
            return;
        }

        try {
            const res = await api.put(`/api/classrooms/${id}`, {
                name: editName.trim(),
                description: editDescription.trim(),
            });

            setClassroom(res.data);
            setEditing(false);
        } catch (err) {
            setEditError(err.response?.data?.message || "Failed to update classroom.");
        }
    };

    const handleArchiveClassroom = async () => {
        const confirmed = window.confirm(
            "Archive this classroom? It will no longer appear on your active dashboard."
        );

        if (!confirmed) return;

        try {
            await api.patch(`/api/classrooms/${id}/archive`);
            window.location.href = "/teacher";
        } catch (err) {
            setError(err.response?.data?.message || "Failed to archive classroom.");
        }
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudents((prev) =>
        prev.includes(studentId)
            ? prev.filter((id) => id !== studentId)
            : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (!classroom) return;

        if (selectedStudents.length === classroom.students.length) {
        setSelectedStudents([]);
        } else {
        setSelectedStudents(classroom.students.map((student) => student._id));
        }
    };

    const handleAwardPoints = async (e) => {
        e.preventDefault();
        setAwardError("");
        setAwardSuccess("");

        if (selectedStudents.length === 0) {
        setAwardError("Please select at least one student.");
        return;
        }

        if (!amount || Number(amount) < 1) {
        setAwardError("Please enter a valid point amount.");
        return;
        }

        if (!reason.trim()) {
        setAwardError("Please enter a reason.");
        return;
        }

        setAwarding(true);

        try {
        await api.post("/api/points/award-bulk", {
            classroomId: id,
            studentIds: selectedStudents,
            amount: Number(amount),
            reason: reason.trim(),
        });

        setAwardSuccess("Points awarded successfully.");
        setAmount("");
        setReason("");
        setSelectedStudents([]);

        try {
            await fetchClassroom();
            await fetchActivity();
        } catch (refreshErr) {
            console.error("Failed to refresh classroom data");
        }
        } catch (err) {
        setAwardError(err.response?.data?.message || "Failed to award points.");
        } finally {
        setAwarding(false);
        }
    };

    const selectedStudentNames =
        classroom?.students
        .filter((student) => selectedStudents.includes(student._id))
        .map((student) => student.name) || [];

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
                <div className="d-flex justify-content-between align-items-start">
                    <div>
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

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={startEdit}
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleArchiveClassroom}
                        >
                            Archive
                        </button>
                    </div>
                </div>

                {editing && (
                    <form className="mt-4" onSubmit={handleUpdateClassroom}>
                        <h5 className="mb-3">Edit Classroom</h5>

                        {editError && (
                            <div className="alert alert-danger">{editError}</div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Classroom Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="card shadow-sm p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Award Points</h4>
                </div>

                <form onSubmit={handleAwardPoints}>
                <div className="row g-3 mb-3">
                    <div className="col-md-3">
                    <label className="form-label">Points</label>
                    <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                    </div>

                    <div className="col-md-9">
                    <label className="form-label">Reason</label>
                    <input
                        type="text"
                        className="form-control"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Example: Great effort"
                    />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Selected Students</label>
                    {selectedStudentNames.length === 0 ? (
                    <p className="text-muted mb-0">No students selected.</p>
                    ) : (
                    <p className="mb-0">{selectedStudentNames.join(", ")}</p>
                    )}
                </div>

                {awardError && <div className="alert alert-danger">{awardError}</div>}
                {awardSuccess && <div className="alert alert-success">{awardSuccess}</div>}

                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={awarding || classroom.students.length === 0}
                >
                    {awarding ? "Awarding..." : "Award Points"}
                </button>
                </form>
            </div>

            <div className="card shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Class Roster</h4>

                {classroom.students.length > 0 && (
                    <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleSelectAll}
                    >
                    {selectedStudents.length === classroom.students.length
                        ? "Clear All"
                        : "Select All"}
                    </button>
                )}
                </div>

                {classroom.students.length === 0 ? (
                <p className="mb-0">No students have joined this classroom yet.</p>
                ) : (
                <div className="list-group">
                    {classroom.students.map((student) => (
                    <label
                        key={student._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                        <div className="fw-semibold">{student.name}</div>
                        <small className="text-muted">
                            {student.username && `Username: ${student.username} • `}
                            Points: {student.points ?? 0}
                        </small>
                        </div>

                        <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentToggle(student._id)}
                        />
                    </label>
                    ))}
                </div>
                )}
            </div>

            <div className="card shadow-sm p-4 mb-4">
                <h4 className="mb-3">Recent Classroom Activity</h4>

                {loadingActivity ? (
                    <p>Loading activity...</p>
                ) : activity.length === 0 ? (
                    <p className="mb-0 text-muted">No classroom activity yet.</p>
                ) : (
                    <div className="list-group">
                        {activity.map((tx) => (
                            <div key={tx._id} className="border-bottom py-2">
                                <div className="d-flex justify-content-between">
                                    <span className="fw-semibold">
                                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts • {tx.reason}
                                    </span>

                                    <small className="text-muted">
                                        {new Date(tx.createdAt).toLocaleString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </small>
                                </div>

                                <div className="small text-muted">
                                    {tx.students?.map((student) => student?.name).join(", ")}
                                </div>
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