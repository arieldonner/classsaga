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
        <nav className="navbar navbar-light px-3 sticky-top">
            <div className="d-flex align-items-center gap-3">
                <Link className="navbar-brand fw-bold mb-0" to={homeLink} style={{ fontFamily: "'Philosopher', serif", fontSize: "1.4rem" }}>
                    ClassSaga
                </Link>

                {user?.role === "student" && (
                    <div className="d-flex gap-4">
                        <Link className="nav-link" to="/student">
                            Dashboard
                        </Link>

                        <Link className="nav-link" to="/student/pet">
                            Pet
                        </Link>

                        <Link className="nav-link" to="/student/shop">
                            Shop
                        </Link>

                        <Link className="nav-link" to="/student/battle">
                            Battle
                        </Link>
                    </div>
                )}

                {user?.role === "teacher" && (
                    <div className="d-flex gap-4">
                        <Link className="nav-link" to="/teacher">
                            Dashboard
                        </Link>
                    </div>
                )}
            </div>

            {user && (
                <div className="d-flex align-items-center">
                    <span className="me-3 fw-semibold">
                        {user.name}
                    </span>

                    {user.role === "student" && (
                        <span className="me-3 text-muted">
                            Points: {user.points ?? 0}
                        </span>
                    )}

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