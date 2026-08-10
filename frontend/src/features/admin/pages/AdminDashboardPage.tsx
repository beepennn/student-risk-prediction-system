import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBell,
  FiClipboard,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

import DepartmentSummaryTable from "../../../components/tables/DepartmentSummaryTable";
import RecentActivityTable from "../../../components/tables/RecentActivityTable";
import RiskDistributionChart from "../../../components/charts/RiskDistributionChart";
import SemesterSummaryTable from "../../../components/tables/SemesterSummaryTable";
import StatCard from "../../../components/cards/StatCard";
import TeacherSummaryTable from "../../../components/tables/TeacherSummaryTable";

import {
  useAuth,
} from "../../auth/context/useAuth";

import {
  getDashboardData,
} from "../services/dashboardService";

import type {
  DashboardResponse,
} from "../types/dashboard";


function AdminDashboardPage() {
  const { token } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardResponse | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const fetchDashboard =
    useCallback(
      async (
        showFullLoader = false,
      ) => {
        if (!token) {
          setError(
            "You are not authenticated. Please log in again.",
          );

          setLoading(false);
          return;
        }

        try {
          if (showFullLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const data =
            await getDashboardData(
              token,
            );

          setDashboard(data);
        } catch (requestError) {
          console.error(
            "Dashboard error:",
            requestError,
          );

          setError(
            "Failed to load the dashboard. Please try again.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [token],
    );


  useEffect(() => {
    void fetchDashboard(true);
  }, [fetchDashboard]);


  if (loading) {
    return <DashboardLoadingState />;
  }


  if (
    error
    && !dashboard
  ) {
    return (
      <DashboardErrorState
        message={error}
        onRetry={() =>
          void fetchDashboard(true)
        }
      />
    );
  }


  if (!dashboard) {
    return (
      <DashboardErrorState
        message="No dashboard data is available."
        onRetry={() =>
          void fetchDashboard(true)
        }
      />
    );
  }


  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Welcome back. Here is an overview
            of the Student Risk Prediction
            System.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void fetchDashboard(false)
          }
          disabled={refreshing}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <FiRefreshCw
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Dashboard"}
        </button>
      </header>


      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-5 sm:py-4">
          <div className="flex gap-3">
            <FiAlertCircle
              className="mt-0.5 shrink-0"
              size={19}
            />

            <p className="leading-6">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}


      <section
        aria-label="System summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          title="Students"
          value={
            dashboard.summary
              .total_students
          }
          icon={<FiUsers size={24} />}
        />

        <StatCard
          title="Teachers"
          value={
            dashboard.summary
              .total_teachers
          }
          icon={<FiUsers size={24} />}
        />

        <StatCard
          title="Predictions"
          value={
            dashboard.summary
              .total_predictions
          }
          icon={
            <FiAlertTriangle
              size={24}
            />
          }
        />

        <StatCard
          title="Notifications"
          value={
            dashboard.summary
              .total_notifications
          }
          icon={<FiBell size={24} />}
        />

        <StatCard
          title="Recommendations"
          value={
            dashboard.summary
              .total_recommendations
          }
          icon={
            <FiClipboard size={24} />
          }
        />

        <StatCard
          title="Interventions"
          value={
            dashboard.summary
              .total_interventions
          }
          icon={
            <FiClipboard size={24} />
          }
        />
      </section>


      <DashboardSection
        title="Risk Distribution"
        description="Latest student risk classifications based on generated predictions."
      >
        <RiskDistributionChart
          riskDistribution={
            dashboard.risk_distribution
          }
        />
      </DashboardSection>


      <DashboardSection
        title="Recent Activity"
        description="Latest prediction and intervention activity in the system."
      >
        <RecentActivityTable
          activity={
            dashboard.recent_activity
          }
        />
      </DashboardSection>


      <DashboardSection
        title="Department Summary"
        description="Student and risk distribution grouped by department."
      >
        <DepartmentSummaryTable
          departments={
            dashboard.department_summary
          }
        />
      </DashboardSection>


      <DashboardSection
        title="Semester Summary"
        description="Student and risk distribution grouped by semester."
      >
        <SemesterSummaryTable
          semesters={
            dashboard.semester_summary
          }
        />
      </DashboardSection>


      <DashboardSection
        title="Teacher Summary"
        description="Teacher intervention activity and supported students."
      >
        <TeacherSummaryTable
          teachers={
            dashboard.teacher_summary
          }
        />
      </DashboardSection>
    </div>
  );
}


function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="min-w-0 p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}


function DashboardLoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}


function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
      <div className="flex gap-3">
        <FiAlertCircle
          className="mt-0.5 shrink-0 text-red-600"
          size={22}
        />

        <div>
          <h2 className="font-semibold text-red-900">
            Dashboard unavailable
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}


export default AdminDashboardPage;