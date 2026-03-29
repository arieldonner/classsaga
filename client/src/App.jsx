import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/Navbar";
import CreateClassroom from "./pages/teacher/CreateClassroom";
import JoinClassroom from "./pages/student/JoinClassroom";
import TeacherClassroomDetails from "./pages/teacher/TeacherClassroomDetails";
import StudentPet from "./pages/student/StudentPet";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"> <StudentDashboard /> </ProtectedRoute>}/>
        <Route path="/teacher" element={<ProtectedRoute role="teacher"> <TeacherDashboard /> </ProtectedRoute>}/>
        <Route path="/teacher/classrooms/new" element={<ProtectedRoute role="teacher"> <CreateClassroom /> </ProtectedRoute>}/>
        <Route path="/student/classrooms/join" element={<ProtectedRoute role="student"><JoinClassroom /></ProtectedRoute>}/>
        <Route path="/teacher/classrooms/:id" element={<ProtectedRoute role="teacher"><TeacherClassroomDetails /></ProtectedRoute>}/>
        <Route path="/student/pet" element={<ProtectedRoute role="student"><StudentPet /></ProtectedRoute>}/>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
