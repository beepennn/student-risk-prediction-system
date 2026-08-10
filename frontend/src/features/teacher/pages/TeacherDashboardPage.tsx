import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiClipboard,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";
import TeacherStudentsTable from "../../../components/tables/TeacherStudentsTable";
import TeacherInterventionsTable from "../../../components/tables/TeacherInterventionsTable";

import { useAuth } from "../../auth/context/useAuth";
import { getTeacherDashboardData } from "../services/teacherDashboardService";

import type { TeacherDashboardResponse } from "../types/teacherDashboard";

function TeacherDashboardPage() {
  const { token } = useAuth();

  const [dashboard, setDashboard] =
    useState<TeacherDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const data = await getTeacherDashboardData(token);
        setDashboard(data);
      } catch (error) {
        console.error("Teacher dashboard error:", error);
        setError("Failed to load Teacher Dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) {
    return <p>Loading Teacher Dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Teacher Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back! Here&apos;s an overview of your students.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Students"
          value={dashboard.summary.total_students}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="High Risk"
          value={dashboard.summary.high_risk_students}
          icon={<FiAlertTriangle size={30} />}
        />

        <StatCard
          title="Medium Risk"
          value={dashboard.summary.medium_risk_students}
          icon={<FiTrendingUp size={30} />}
        />

        <StatCard
          title="Low Risk"
          value={dashboard.summary.low_risk_students}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="Interventions"
          value={dashboard.summary.total_interventions}
          icon={<FiClipboard size={30} />}
        />
      </div>

      {/* Student Tables */}
      <TeacherStudentsTable
        title="High Risk Students"
        students={dashboard.high_risk_students}
      />

      <TeacherStudentsTable
        title="Medium Risk Students"
        students={dashboard.medium_risk_students}
      />

      <TeacherStudentsTable
        title="Low Risk Students"
        students={dashboard.low_risk_students}
      />

      <TeacherStudentsTable
        title="Students Without Intervention"
        students={dashboard.students_without_intervention}
      />

      {/* Recent Interventions */}
      <TeacherInterventionsTable
        interventions={dashboard.recent_interventions}
      />
    </div>
  );
}

export default TeacherDashboardPage;