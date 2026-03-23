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
        await Promise.all(
            selectedStudents.map((studentId) =>
            api.post("/api/points/award", {
                classroomId: id,
                studentId,
                amount: Number(amount),
                reason: reason.trim(),
            })
            )
        );

        setAwardSuccess("Points awarded successfully.");
        setAmount("");
        setReason("");
        setSelectedStudents([]);
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
                        {student.username && (
                            <small className="text-muted">
                            Username: {student.username}
                            </small>
                        )}
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
            </>
        )}
        </div>
    );
}