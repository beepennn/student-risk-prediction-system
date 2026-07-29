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
import AdminAcademicRecordsPage from "../../features/admin/pages/AdminAcademicRecordsPage";
import AdminPredictionsPage from "../../features/admin/pages/AdminPredictionsPage";
import AdminRecommendationsPage from "../../features/admin/pages/AdminRecommendationsPage";
import AdminNotificationsPage from "../../features/admin/pages/AdminNotificationsPage";
import AdminReportsPage from "../../features/admin/pages/AdminReportsPage";
import AdminAuditLogsPage from "../../features/admin/pages/AdminAuditLogsPage";
import AdminTeachersPage from "../../features/admin/pages/AdminTeachersPage";

import TeacherDashboardPage from "../../features/teacher/pages/TeacherDashboardPage";
import TeacherStudentsPage from "../../features/teacher/pages/TeacherStudentsPage";
import TeacherStudentProfilePage from "../../features/teacher/pages/TeacherStudentProfilePage";
import TeacherInterventionsPage from "../../features/teacher/pages/TeacherInterventionsPage";

import StudentDashboardPage from "../../features/student/pages/StudentDashboardPage";
import StudentProfilePage from "../../features/student/pages/StudentProfilePage";
import StudentAnalyticsPage from "../../features/student/pages/StudentAnalyticsPage";
import StudentPredictionsPage from "../../features/student/pages/StudentPredictionsPage";
import StudentRecommendationsPage from "../../features/student/pages/StudentRecommendationsPage";
import StudentNotificationsPage from "../../features/student/pages/StudentNotificationsPage";

import NotFoundPage from "../../pages/NotFoundPage";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/students"
              element={<AdminStudentsPage />}
            />

            <Route
              path="/admin/teachers"
              element={<AdminTeachersPage />}
            />

            <Route
              path="/admin/academic-records"
              element={
                <AdminAcademicRecordsPage />
              }
            />

            <Route
              path="/admin/predictions"
              element={<AdminPredictionsPage />}
            />

            <Route
              path="/admin/recommendations"
              element={
                <AdminRecommendationsPage />
              }
            />

            <Route
              path="/admin/notifications"
              element={
                <AdminNotificationsPage />
              }
            />

            <Route
              path="/admin/reports"
              element={<AdminReportsPage />}
            />

            <Route
              path="/admin/audit-logs"
              element={<AdminAuditLogsPage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
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
              element={
                <TeacherStudentProfilePage />
              }
            />

            <Route
              path="/teacher/interventions"
              element={
                <TeacherInterventionsPage />
              }
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
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
              element={
                <StudentAnalyticsPage />
              }
            />

            <Route
              path="/student/predictions"
              element={
                <StudentPredictionsPage />
              }
            />

            <Route
              path="/student/recommendations"
              element={
                <StudentRecommendationsPage />
              }
            />

            <Route
              path="/student/notifications"
              element={
                <StudentNotificationsPage />
              }
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