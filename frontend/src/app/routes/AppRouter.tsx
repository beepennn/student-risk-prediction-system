import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../../features/auth/components/ProtectedRoute";

import LoginPage from "../../features/auth/pages/LoginPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";

import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";

import TeacherDashboardPage from "../../features/teacher/pages/TeacherDashboardPage";
import TeacherStudentsPage from "../../features/teacher/pages/TeacherStudentsPage";
import TeacherStudentProfilePage from "../../features/teacher/pages/TeacherStudentProfilePage";
import TeacherInterventionsPage from "../../features/teacher/pages/TeacherInterventionsPage";

import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";
import StudentProfilePage from "../../features/student/pages/StudentProfilePage";
import StudentAnalyticsPage from "../../features/student/pages/StudentAnalyticsPage";

import NotFoundPage from "../../pages/NotFoundPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={<LoginPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={<TeacherDashboardPage />}
            />

            <Route
              path="/teacher/students"
              element={<TeacherStudentsPage />}
            />

            <Route
              path="/teacher/students/:studentId"
              element={<TeacherStudentProfilePage />}
            />

            <Route
              path="/teacher/interventions"
              element={<TeacherInterventionsPage />}
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={<StudentDashboardPage />}
            />

            <Route
              path="/student/profile"
              element={<StudentProfilePage />}
            />

            <Route
              path="/student/analytics"
              element={<StudentAnalyticsPage />}
            />
          </Route>
        </Route>

        {/* Page Not Found */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;