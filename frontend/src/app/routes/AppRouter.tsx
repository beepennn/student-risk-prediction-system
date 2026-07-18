import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginPage from "../../features/auth/pages/LoginPage";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";
import TeacherDashboardPage from "../../features/teacher/pages/TeacherDashboardPage";
import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";
import NotFoundPage from "../../pages/NotFoundPage.tsx";
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/teacher" element={<TeacherDashboardPage />} />
          <Route path="/student" element={<StudentDashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;