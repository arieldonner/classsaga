import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const payload = 
                role === "teacher"
                    ? { role, name, email: identifier, password }
                    : { role, name, username: identifier, password};

            const res = await api.post("/api/auth/register", payload);

            login(res.data.user, res.data.token);

            if (res.data.user.role === "teacher") {
                navigate("/teacher");
            } else {
                navigate("/student");
            } 
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed.");
        }
    };

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="card shadow p-4" style={{ width: 420 }}>
            <h3 className="text-center mb-4">Create Account</h3>

            <div className="mb-3">
            <label className="form-label fw-bold">Account Type:</label>

            <div className="form-check">
                <label className="form-check-label">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                Student</label>
            </div>

            <div className="form-check">
                <label className="form-check-label">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                Teacher
                </label>
            </div>
            </div>

            <form onSubmit={handleSignUp}>
            <div className="mb-3">
                <input
                className="form-control"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            </div>

            <div className="mb-3">
                <input
                className="form-control"
                placeholder={role === "teacher" ? "Email" : "Username"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                />
            </div>

            <div className="mb-3">
                <input
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button className="btn btn-primary w-100" type="submit">
                Sign Up
            </button>
            </form>

            <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
        </div>
    )
}