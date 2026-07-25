import { useEffect, useState } from "react";

import {
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiActivity,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import AdminRiskChart from "../components/AdminRiskChart";
import AdminRecentActivity from "../components/AdminRecentActivity";

import { getAdminDashboard } from "../services/adminService";
import type { AdminDashboardResponse } from "../types/dashboard";

import { useAuth } from "../../auth/context/useAuth";

function AdminDashboardPage() {
  const { token } = useAuth();

  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const data = await getAdminDashboard(token);
        setDashboard(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back! Here's an overview of the system.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={dashboard.summary.total_students}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="Teachers"
          value={dashboard.summary.total_teachers}
          icon={<FiUserCheck size={30} />}
        />

        <StatCard
          title="Predictions"
          value={dashboard.summary.total_predictions}
          icon={<FiBarChart2 size={30} />}
        />

        <StatCard
          title="Interventions"
          value={dashboard.summary.total_interventions}
          icon={<FiActivity size={30} />}
        />
      </div>

      {/* Risk Distribution */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Risk Distribution
        </h2>

        <AdminRiskChart
          high={dashboard.risk_distribution.high}
          medium={dashboard.risk_distribution.medium}
          low={dashboard.risk_distribution.low}
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Recent Activity
        </h2>

        <AdminRecentActivity
          prediction={dashboard.recent_activity.latest_prediction}
          intervention={dashboard.recent_activity.latest_intervention}
        />
      </div>
    </div>
  );
}

export default AdminDashboardPage;