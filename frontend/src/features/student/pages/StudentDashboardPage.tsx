import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiBell,
  FiBookOpen,
  FiClipboard,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import { getStudentAnalytics } from "../services/studentAnalyticsService";
import { getStudentDashboardData } from "../services/studentDashboardService";
import { getStudentPredictions } from "../services/studentPredictionsService";
import { getStudentRecommendations } from "../services/studentRecommendationsService";

import type { StudentAnalyticsResponse } from "../types/studentAnalytics";
import type { StudentDashboardResponse } from "../types/studentDashboard";
import type {
  StudentPrediction,
  StudentPredictionsResponse,
} from "../types/studentPredictions";
import type { StudentRecommendationsResponse } from "../types/studentRecommendations";

function StudentDashboardPage() {
  const { token } = useAuth();

  const [dashboard, setDashboard] =
    useState<StudentDashboardResponse | null>(null);

  const [analytics, setAnalytics] =
    useState<StudentAnalyticsResponse | null>(null);

  const [predictions, setPredictions] =
    useState<StudentPredictionsResponse>([]);

  const [recommendations, setRecommendations] =
    useState<StudentRecommendationsResponse>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentData() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          dashboardData,
          analyticsData,
          predictionsData,
          recommendationsData,
        ] = await Promise.all([
          getStudentDashboardData(token),
          getStudentAnalytics(token),
          getStudentPredictions(token),
          getStudentRecommendations(token),
        ]);

        setDashboard(dashboardData);
        setAnalytics(analyticsData);
        setPredictions(predictionsData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error("Student dashboard error:", error);

        setError("Failed to load Student Dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [token]);

  const latestPrediction = useMemo<StudentPrediction | null>(() => {
    if (predictions.length === 0) {
      return null;
    }

    return [...predictions].sort(
      (firstPrediction, secondPrediction) =>
        new Date(secondPrediction.prediction_date).getTime() -
        new Date(firstPrediction.prediction_date).getTime(),
    )[0];
  }, [predictions]);

  const latestRecommendation =
    recommendations.length > 0 ? recommendations[0] : null;

  function displayValue(
    value: number | null,
    suffix = "",
  ): string {
    if (value === null || value === undefined) {
      return "N/A";
    }

    return `${value}${suffix}`;
  }

  function displayText(
    value: string | null | undefined,
  ): string {
    if (!value) {
      return "N/A";
    }

    return value;
  }

  function formatProbability(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRiskClass(riskLevel: string): string {
    const normalisedRisk = riskLevel.toLowerCase();

    if (normalisedRisk.includes("high")) {
      return "bg-red-100 text-red-700";
    }

    if (normalisedRisk.includes("medium")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalisedRisk.includes("low")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-gray-600">
          Loading Student Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!dashboard || !analytics) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-gray-500">
          No dashboard data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Student Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back, {dashboard.student.full_name}.
        </p>
      </div>

      {/* Student Information */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <FiUser size={26} className="text-blue-600" />

          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StudentInfo
            label="Full Name"
            value={dashboard.student.full_name}
          />

          <StudentInfo
            label="Roll Number"
            value={dashboard.student.roll_number}
          />

          <StudentInfo
            label="Department"
            value={dashboard.student.department}
          />

          <StudentInfo
            label="Semester"
            value={`Semester ${dashboard.student.semester}`}
          />
        </div>
      </section>

      {/* Academic Summary */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Academic Summary
          </h2>

          <Link
            to="/student/analytics"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Analytics
            <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Attendance"
            value={displayValue(
              analytics.latest.attendance,
              "%",
            )}
            icon={<FiClipboard size={30} />}
          />

          <StatCard
            title="Internal Marks"
            value={displayValue(
              analytics.latest.internal_marks,
            )}
            icon={<FiBookOpen size={30} />}
          />

          <StatCard
            title="Assignment Score"
            value={displayValue(
              analytics.latest.assignment_score,
            )}
            icon={<FiClipboard size={30} />}
          />

          <StatCard
            title="Quiz Score"
            value={displayValue(
              analytics.latest.quiz_score,
            )}
            icon={<FiAward size={30} />}
          />

          <StatCard
            title="Previous GPA"
            value={displayValue(
              analytics.latest.previous_gpa,
            )}
            icon={<FiTrendingUp size={30} />}
          />
        </div>
      </section>

      {/* Prediction Overview */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Prediction Overview
          </h2>

          <Link
            to="/student/predictions"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All Predictions
            <FiArrowRight />
          </Link>
        </div>

        {latestPrediction ? (
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Latest Risk Level
                </p>

                <span
                  className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${getRiskClass(
                    latestPrediction.risk_level,
                  )}`}
                >
                  <FiAlertTriangle />

                  {latestPrediction.risk_level}
                </span>

                <p className="mt-3 text-sm text-gray-500">
                  Generated on{" "}
                  {formatDate(
                    latestPrediction.prediction_date,
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ProbabilitySummary
                  label="Low"
                  value={formatProbability(
                    latestPrediction.low_probability,
                  )}
                />

                <ProbabilitySummary
                  label="Medium"
                  value={formatProbability(
                    latestPrediction.medium_probability,
                  )}
                />

                <ProbabilitySummary
                  label="High"
                  value={formatProbability(
                    latestPrediction.high_probability,
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              No prediction is currently available.
            </p>
          </div>
        )}
      </section>

      {/* Recommendation and Notification Summary */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FiTrendingUp
                size={24}
                className="text-blue-600"
              />

              <h2 className="text-xl font-semibold text-gray-900">
                Latest Recommendation
              </h2>
            </div>
          </div>

          {latestRecommendation ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">
                  Title
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {displayText(latestRecommendation.title)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Recommendation
                </p>

                <p className="mt-1 text-gray-700">
                  {displayText(
                    latestRecommendation.recommendation,
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  Priority:{" "}
                  {displayText(
                    latestRecommendation.priority,
                  )}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  Category:{" "}
                  {displayText(
                    latestRecommendation.category,
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              No recommendation is currently available.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center gap-3">
            <FiBell size={24} className="text-blue-600" />

            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NotificationSummary
              label="Total Notifications"
              value={dashboard.notifications.total}
            />

            <NotificationSummary
              label="Unread Notifications"
              value={dashboard.notifications.unread}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface StudentInfoProps {
  label: string;
  value: string | number;
}

function StudentInfo({
  label,
  value,
}: StudentInfoProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

interface ProbabilitySummaryProps {
  label: string;
  value: string;
}

function ProbabilitySummary({
  label,
  value,
}: ProbabilitySummaryProps) {
  return (
    <div className="min-w-32 rounded-lg bg-gray-50 p-4 text-center">
      <p className="text-sm text-gray-500">
        {label} Risk
      </p>

      <p className="mt-2 text-xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

interface NotificationSummaryProps {
  label: string;
  value: number;
}

function NotificationSummary({
  label,
  value,
}: NotificationSummaryProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default StudentDashboardPage;