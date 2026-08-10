import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiAward,
  FiBell,
  FiBookOpen,
  FiClipboard,
  FiTrendingUp,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import { getStudentAnalytics } from "../services/studentAnalyticsService";

import type { StudentAnalyticsResponse } from "../types/studentAnalytics";

function StudentAnalyticsPage() {
  const { token } = useAuth();

  const [analytics, setAnalytics] =
    useState<StudentAnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const analyticsData =
          await getStudentAnalytics(token);

        setAnalytics(analyticsData);
      } catch (error) {
        console.error(
          "Student analytics error:",
          error,
        );

        setError(
          "Failed to load student analytics.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [token]);

  function displayNumber(
    value: number | null | undefined,
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

  function formatDate(
    value: string | null | undefined,
  ): string {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <p className="text-gray-600">
        Loading Student Analytics...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <p className="text-gray-600">
        No analytics data available.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Student Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          View your latest academic performance,
          risk analysis and performance history.
        </p>
      </div>

      {/* Academic Performance */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Academic Performance
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Attendance"
            value={displayNumber(
              analytics.latest.attendance,
              "%",
            )}
            icon={<FiClipboard size={30} />}
          />

          <StatCard
            title="Internal Marks"
            value={displayNumber(
              analytics.latest.internal_marks,
            )}
            icon={<FiBookOpen size={30} />}
          />

          <StatCard
            title="Assignment Score"
            value={displayNumber(
              analytics.latest.assignment_score,
            )}
            icon={<FiClipboard size={30} />}
          />

          <StatCard
            title="Quiz Score"
            value={displayNumber(
              analytics.latest.quiz_score,
            )}
            icon={<FiAward size={30} />}
          />

          <StatCard
            title="Previous GPA"
            value={displayNumber(
              analytics.latest.previous_gpa,
            )}
            icon={<FiTrendingUp size={30} />}
          />
        </div>
      </section>

      {/* Risk and Recommendation */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Risk and Recommendation Overview
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
              analytics.latest
                .recommendation_priority,
            )}
            icon={<FiTrendingUp size={30} />}
          />

          <StatCard
            title="Total Notifications"
            value={
              analytics.latest.total_notifications
            }
            icon={<FiBell size={30} />}
          />
        </div>
      </section>

      {/* Performance Summary */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Latest Performance Summary
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Attendance
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayNumber(
                analytics.latest.attendance,
                "%",
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Internal Marks
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayNumber(
                analytics.latest.internal_marks,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Assignment Score
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayNumber(
                analytics.latest.assignment_score,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Quiz Score
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayNumber(
                analytics.latest.quiz_score,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Previous GPA
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayNumber(
                analytics.latest.previous_gpa,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Risk Level
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {displayText(
                analytics.latest.risk_level,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Academic History */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Academic History
        </h2>

        {analytics.history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <FiTrendingUp
              className="mx-auto text-gray-400"
              size={36}
            />

            <p className="mt-3 text-gray-500">
              No academic history available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Attendance
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Internal Marks
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Assignment
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Quiz
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    GPA
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Risk Level
                  </th>
                </tr>
              </thead>

              <tbody>
                {analytics.history.map(
                  (item, index) => {
                    const historyItem =
                      item as typeof item & {
                        date?: string | null;
                        created_at?: string | null;
                      };

                    return (
                      <tr
                        key={`${historyItem.created_at ?? historyItem.date ?? "history"}-${index}`}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {formatDate(
                            historyItem.created_at ??
                              historyItem.date,
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {displayNumber(
                            item.attendance,
                            "%",
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {displayNumber(
                            item.internal_marks,
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {displayNumber(
                            item.assignment_score,
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {displayNumber(
                            item.quiz_score,
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {displayNumber(
                            item.previous_gpa,
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                          {displayText(
                            item.risk_level,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentAnalyticsPage;