import { useEffect, useState } from "react";

import {
  FiAlertTriangle,
  FiBell,
  FiClipboard,
  FiUsers,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";
import RiskDistributionChart from "../../../components/charts/RiskDistributionChart";
import RecentActivityTable from "../../../components/tables/RecentActivityTable";

import { getDashboardData } from "../services/dashboardService";
import type { DashboardResponse } from "../types/dashboard";

import { useAuth } from "../../auth/context/useAuth";

function AdminDashboardPage() {
  const { token } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) {
        setError("You are not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const data = await getDashboardData(token);
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back! Here's an overview of the system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Students"
          value={dashboard.summary.total_students}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="Teachers"
          value={dashboard.summary.total_teachers}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="Predictions"
          value={dashboard.summary.total_predictions}
          icon={<FiAlertTriangle size={30} />}
        />

        <StatCard
          title="Notifications"
          value={dashboard.summary.total_notifications}
          icon={<FiBell size={30} />}
        />

        <StatCard
          title="Recommendations"
          value={dashboard.summary.total_recommendations}
          icon={<FiClipboard size={30} />}
        />

        <StatCard
          title="Interventions"
          value={dashboard.summary.total_interventions}
          icon={<FiClipboard size={30} />}
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Risk Distribution
        </h2>

        <RiskDistributionChart
          riskDistribution={dashboard.risk_distribution}
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Recent Activity
        </h2>

        <RecentActivityTable
          activity={dashboard.recent_activity}
        />
      </div>
    </div>
  );
}

export default AdminDashboardPage;