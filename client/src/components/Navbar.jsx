import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const homeLink = user
        ? user.role === "teacher"
        ? "/teacher"
        : "/student"
        : "/login";

    return (
        <nav className="navbar navbar-light bg-light px-3">
        <Link className="navbar-brand fw-bold" to={homeLink}>
            EduSaga
        </Link>

        {user && (
            <div className="d-flex align-items-center">
                <span className="me-3 fw-semibold">
                    {user.name}
                </span>

                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        )}
        </nav>
    );
}