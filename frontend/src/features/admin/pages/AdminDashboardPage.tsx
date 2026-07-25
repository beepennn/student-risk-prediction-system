import RiskDistributionChart from "../../../components/charts/RiskDistributionChart";
import {
  FiAlertTriangle,
  FiBookOpen,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back! Here's an overview of the system.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={524}
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="At Risk Students"
          value={38}
          icon={<FiAlertTriangle size={30} />}
        />

        <StatCard
          title="Teachers"
          value={21}
          icon={<FiUserCheck size={30} />}
        />

        <StatCard
          title="Courses"
          value={15}
          icon={<FiBookOpen size={30} />}
        />
      </div>

      {/* Risk Distribution */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Risk Distribution
        </h2>

        <RiskDistributionChart />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Recent Activity
        </h2>

        <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No recent activity available.
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;