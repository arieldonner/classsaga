import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();


    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const payload = 
                role === "teacher"
                ? { email: identifier, password }
                : { username: identifier, password };

            // Login
            const res = await api.post("/api/auth/login", payload);

            login(res.data.user, res.data.token);

            if (res.data.user.role === "teacher") {
                navigate("/teacher");
            } else {
                navigate("/student");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

   return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4">EduSaga Login</h3>

        <div className="mb-3">
            <label className="form-label fw-bold">Login As:</label>

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
                Student
            </label>
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

        <form onSubmit={handleLogin}>
            <div className="mb-3">
            <input
                type="text"
                className="form-control"
                placeholder={role === "teacher" ? "Email" : "Username"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
            />
            </div>

            <div className="mb-3">
            <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-success w-100">
            Login
            </button>
        </form>
        <p className="text-center mt-3 mb-0">
            Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
        </div>
    </div>
    );
}