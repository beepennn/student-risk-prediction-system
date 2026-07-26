import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
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
import type { StudentPredictionsResponse } from "../types/studentPredictions";
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

  function displayValue(
    value: number | null,
    suffix = "",
  ): string {
    if (value === null) {
      return "N/A";
    }

    return `${value}${suffix}`;
  }

  function displayText(value: string | null): string {
    if (!value) {
      return "N/A";
    }

    return value;
  }

  if (loading) {
    return <p>Loading Student Dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!dashboard || !analytics) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Student Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back, {dashboard.student.full_name}.
        </p>
      </div>

      {/* Student Information */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <FiUser size={26} />

          <h2 className="text-xl font-semibold">
            Student Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">
              Full Name
            </p>

            <p className="mt-1 font-semibold">
              {dashboard.student.full_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Roll Number
            </p>

            <p className="mt-1 font-semibold">
              {dashboard.student.roll_number}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Department
            </p>

            <p className="mt-1 font-semibold">
              {dashboard.student.department}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Semester
            </p>

            <p className="mt-1 font-semibold">
              Semester {dashboard.student.semester}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Summary */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Academic Summary
        </h2>

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
      </div>

      {/* Prediction Overview */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Prediction Overview
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Risk Level"
            value={displayText(
              analytics.latest.risk_level,
            )}
            icon={<FiAlertTriangle size={30} />}
          />

          <StatCard
            title="Recommendation Priority"
            value={displayText(
              analytics.latest.recommendation_priority,
            )}
            icon={<FiTrendingUp size={30} />}
          />

          <StatCard
            title="Total Notifications"
            value={analytics.latest.total_notifications}
            icon={<FiBell size={30} />}
          />
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Notifications
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="Total Notifications"
            value={dashboard.notifications.total}
            icon={<FiBell size={30} />}
          />

          <StatCard
            title="Unread Notifications"
            value={dashboard.notifications.unread}
            icon={<FiBell size={30} />}
          />
        </div>
      </div>

      {/* Latest Prediction and Recommendation */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Latest Prediction
          </h2>

          {dashboard.latest_prediction === null ? (
            <p className="text-gray-500">
              No prediction available.
            </p>
          ) : (
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
              {JSON.stringify(
                dashboard.latest_prediction,
                null,
                2,
              )}
            </pre>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">
            Latest Recommendation
          </h2>

          {dashboard.latest_recommendation === null ? (
            <p className="text-gray-500">
              No recommendation available.
            </p>
          ) : (
            <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
              {JSON.stringify(
                dashboard.latest_recommendation,
                null,
                2,
              )}
            </pre>
          )}
        </div>
      </div>

      {/* Academic History */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Academic History
        </h2>

        {analytics.history.length === 0 ? (
          <p className="text-gray-500">
            No academic history available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-4 py-3 text-left">
                    Date
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Attendance
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Internal Marks
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Assignment
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Quiz
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    GPA
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Risk Level
                  </th>
                </tr>
              </thead>

              <tbody>
                {analytics.history.map((item, index) => (
                  <tr
                    key={`${item.created_at ?? item.date ?? "history"}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-4 py-3">
                      {item.created_at || item.date
                        ? new Date(
                            item.created_at ??
                              item.date ??
                              "",
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayValue(
                        item.attendance ?? null,
                        "%",
                      )}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayValue(
                        item.internal_marks ?? null,
                      )}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayValue(
                        item.assignment_score ?? null,
                      )}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayValue(
                        item.quiz_score ?? null,
                      )}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayValue(
                        item.previous_gpa ?? null,
                      )}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {displayText(
                        item.risk_level ?? null,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prediction History */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Prediction History
        </h2>

        {predictions.length === 0 ? (
          <p className="text-gray-500">
            No prediction history available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-4 py-3 text-left">
                    Risk Level
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Risk Score
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Prediction Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {predictions.map((prediction, index) => (
                  <tr
                    key={prediction.id ?? index}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-4 py-3">
                      {prediction.risk_level ?? "N/A"}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {prediction.risk_score ?? "N/A"}
                    </td>

                    <td className="border-b px-4 py-3 text-center">
                      {prediction.prediction_date
                        ? new Date(
                            prediction.prediction_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommendation History */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          Recommendation History
        </h2>

        {recommendations.length === 0 ? (
          <p className="text-gray-500">
            No recommendations available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-4 py-3 text-left">
                    Title
                  </th>

                  <th className="border-b px-4 py-3 text-left">
                    Recommendation
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Priority
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Category
                  </th>

                  <th className="border-b px-4 py-3 text-center">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {recommendations.map(
                  (recommendation, index) => (
                    <tr
                      key={recommendation.id ?? index}
                      className="hover:bg-gray-50"
                    >
                      <td className="border-b px-4 py-3">
                        {recommendation.title ?? "N/A"}
                      </td>

                      <td className="border-b px-4 py-3">
                        {recommendation.recommendation ??
                          "N/A"}
                      </td>

                      <td className="border-b px-4 py-3 text-center">
                        {recommendation.priority ?? "N/A"}
                      </td>

                      <td className="border-b px-4 py-3 text-center">
                        {recommendation.category ?? "N/A"}
                      </td>

                      <td className="border-b px-4 py-3 text-center">
                        {recommendation.created_at ||
                        recommendation.date
                          ? new Date(
                              recommendation.created_at ??
                                recommendation.date ??
                                "",
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboardPage;