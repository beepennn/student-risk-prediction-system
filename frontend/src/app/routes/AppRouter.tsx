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
import AdminStudentsPage from "../../features/admin/pages/AdminStudentsPage";

import TeacherDashboardPage from "../../features/teacher/pages/TeacherDashboardPage";
import TeacherStudentsPage from "../../features/teacher/pages/TeacherStudentsPage";
import TeacherStudentProfilePage from "../../features/teacher/pages/TeacherStudentProfilePage";
import TeacherInterventionsPage from "../../features/teacher/pages/TeacherInterventionsPage";

import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";
import StudentProfilePage from "../../features/student/pages/StudentProfilePage";
import StudentAnalyticsPage from "../../features/student/pages/StudentAnalyticsPage";
import StudentPredictionsPage from "../../features/student/pages/StudentPredictionsPage";

import NotFoundPage from "../../pages/NotFoundPage";

import AdminAcademicRecordsPage from "../../features/admin/pages/AdminAcademicRecordsPage";
import AdminPredictionsPage from "../../features/admin/pages/AdminPredictionsPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />

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

        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Admin */}
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/students"
              element={<AdminStudentsPage />}
            />

            <Route
              path="/admin/academic-records"
              element={<AdminAcademicRecordsPage />}
            />

            <Route
              path="/admin/predictions"
              element={<AdminPredictionsPage />}
            />

            {/* Teacher */}
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

            {/* Student */}
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

            <Route
              path="/student/predictions"
              element={<StudentPredictionsPage />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;