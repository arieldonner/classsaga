import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
    // redirect based on role
    return user.role === "teacher"
        ? <Navigate to="/teacher" replace />
        : <Navigate to="/student" replace />;
    }

    return children;
}