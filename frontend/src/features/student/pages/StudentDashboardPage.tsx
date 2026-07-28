import axios from "axios";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiBell,
  FiBookOpen,
  FiClipboard,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import {
  getStudentDashboardData,
} from "../services/studentDashboardService";

import {
  getStudentPredictions,
} from "../services/studentPredictionsService";

import {
  getStudentRecommendations,
} from "../services/studentRecommendationsService";

import type {
  StudentDashboardResponse,
} from "../types/studentDashboard";

import type {
  StudentPrediction,
  StudentPredictionsResponse,
} from "../types/studentPredictions";

import type {
  StudentRecommendationsResponse,
} from "../types/studentRecommendations";


function StudentDashboardPage() {
  const { token } = useAuth();

  const [dashboard, setDashboard] =
    useState<StudentDashboardResponse | null>(
      null,
    );

  const [predictions, setPredictions] =
    useState<StudentPredictionsResponse>(
      [],
    );

  const [
    recommendations,
    setRecommendations,
  ] =
    useState<StudentRecommendationsResponse>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    optionalDataWarning,
    setOptionalDataWarning,
  ] = useState("");

  async function fetchStudentData() {
    if (!token) {
      setError(
        "You are not authenticated.",
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOptionalDataWarning("");

      const dashboardData =
        await getStudentDashboardData(
          token,
        );

      setDashboard(dashboardData);

      const [
        predictionsResult,
        recommendationsResult,
      ] = await Promise.allSettled([
        getStudentPredictions(token),
        getStudentRecommendations(token),
      ]);

      if (
        predictionsResult.status
        === "fulfilled"
      ) {
        setPredictions(
          predictionsResult.value,
        );
      } else {
        console.error(
          "Student predictions failed:",
          predictionsResult.reason,
        );

        setPredictions([]);
      }

      if (
        recommendationsResult.status
        === "fulfilled"
      ) {
        setRecommendations(
          recommendationsResult.value,
        );
      } else {
        console.error(
          "Student recommendations failed:",
          recommendationsResult.reason,
        );

        setRecommendations([]);
      }

      if (
        predictionsResult.status
          === "rejected"
        || recommendationsResult.status
          === "rejected"
      ) {
        setOptionalDataWarning(
          "Some optional dashboard information is not available yet.",
        );
      }
    } catch (requestError) {
      console.error(
        "Student dashboard error:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchStudentData();
  }, [token]);

  const latestPrediction =
    useMemo<StudentPrediction | null>(
      () => {
        if (
          predictions.length === 0
        ) {
          return null;
        }

        return [...predictions].sort(
          (
            firstPrediction,
            secondPrediction,
          ) =>
            new Date(
              secondPrediction.prediction_date,
            ).getTime()
            - new Date(
              firstPrediction.prediction_date,
            ).getTime(),
        )[0];
      },
      [predictions],
    );

  const latestRecommendation =
    recommendations.length > 0
      ? recommendations[0]
      : null;

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return (
      <DashboardErrorState
        message={error}
        onRetry={() =>
          void fetchStudentData()
        }
      />
    );
  }

  if (!dashboard) {
    return (
      <DashboardErrorState
        message="No dashboard information is available."
        onRetry={() =>
          void fetchStudentData()
        }
      />
    );
  }

  const displayedPrediction =
    latestPrediction
    ?? dashboard.latest_prediction;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Student Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back,{" "}
          {dashboard.student.full_name
            || "Student"}
          .
        </p>
      </header>

      {optionalDataWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800">
          <FiAlertCircle
            className="mt-0.5 shrink-0"
            size={20}
          />

          <p className="text-sm">
            {optionalDataWarning}
          </p>
        </div>
      )}

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <FiUser
            size={26}
            className="text-blue-600"
          />

          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StudentInfo
            label="Full Name"
            value={
              dashboard.student.full_name
              || "N/A"
            }
          />

          <StudentInfo
            label="Roll Number"
            value={
              dashboard.student.roll_number
            }
          />

          <StudentInfo
            label="Department"
            value={
              dashboard.student.department
            }
          />

          <StudentInfo
            label="Semester"
            value={`Semester ${dashboard.student.semester}`}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Academic Summary"
          linkText="View Analytics"
          linkPath="/student/analytics"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Attendance"
            value={displayValue(
              dashboard.academic_summary
                .attendance,
              "%",
            )}
            icon={
              <FiClipboard size={30} />
            }
          />

          <StatCard
            title="Internal Marks"
            value={displayValue(
              dashboard.academic_summary
                .internal_marks,
            )}
            icon={
              <FiBookOpen size={30} />
            }
          />

          <StatCard
            title="Assignment Score"
            value={displayValue(
              dashboard.academic_summary
                .assignment_score,
            )}
            icon={
              <FiClipboard size={30} />
            }
          />

          <StatCard
            title="Quiz Score"
            value={displayValue(
              dashboard.academic_summary
                .quiz_score,
            )}
            icon={
              <FiAward size={30} />
            }
          />

          <StatCard
            title="Previous GPA"
            value={displayValue(
              dashboard.academic_summary
                .previous_gpa,
            )}
            icon={
              <FiTrendingUp size={30} />
            }
          />
        </div>

        {!hasAcademicData(
          dashboard,
        ) && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            No academic record has been added
            for this student yet.
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Prediction Overview"
          linkText="View All Predictions"
          linkPath="/student/predictions"
        />

        {displayedPrediction ? (
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Latest Risk Level
                </p>

                <span
                  className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${getRiskClass(
                    displayedPrediction
                      .risk_level,
                  )}`}
                >
                  <FiAlertTriangle />

                  {
                    displayedPrediction
                      .risk_level
                  }
                </span>

                {displayedPrediction
                  .prediction_date && (
                  <p className="mt-3 text-sm text-gray-500">
                    Generated on{" "}
                    {formatDate(
                      displayedPrediction
                        .prediction_date,
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ProbabilitySummary
                  label="Low"
                  value={formatProbability(
                    displayedPrediction
                      .low_probability,
                  )}
                />

                <ProbabilitySummary
                  label="Medium"
                  value={formatProbability(
                    displayedPrediction
                      .medium_probability,
                  )}
                />

                <ProbabilitySummary
                  label="High"
                  value={formatProbability(
                    displayedPrediction
                      .high_probability,
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptySection
            message="A prediction has not been generated for this student yet."
          />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center gap-3">
            <FiTrendingUp
              size={24}
              className="text-blue-600"
            />

            <h2 className="text-xl font-semibold text-gray-900">
              Latest Recommendation
            </h2>
          </div>

          {latestRecommendation ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">
                  Title
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {latestRecommendation.title
                    || "Recommendation"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Recommendation
                </p>

                <p className="mt-1 text-gray-700">
                  {latestRecommendation
                    .recommendation
                    || "No recommendation text available."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  Priority:{" "}
                  {latestRecommendation
                    .priority
                    || "N/A"}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  Category:{" "}
                  {latestRecommendation
                    .category
                    || "General"}
                </span>
              </div>
            </div>
          ) : dashboard
              .latest_recommendation ? (
            <div className="space-y-3">
              <p className="text-gray-700">
                {dashboard
                  .latest_recommendation
                  .recommendation_text
                  || "No recommendation text available."}
              </p>

              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Priority:{" "}
                {dashboard
                  .latest_recommendation
                  .priority
                  || "N/A"}
              </span>
            </div>
          ) : (
            <p className="text-gray-500">
              No recommendation is currently
              available.
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center gap-3">
            <FiBell
              size={24}
              className="text-blue-600"
            />

            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NotificationSummary
              label="Total Notifications"
              value={
                dashboard.notifications.total
              }
            />

            <NotificationSummary
              label="Unread Notifications"
              value={
                dashboard.notifications.unread
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}


function hasAcademicData(
  dashboard: StudentDashboardResponse,
): boolean {
  const summary =
    dashboard.academic_summary;

  return [
    summary.attendance,
    summary.internal_marks,
    summary.assignment_score,
    summary.quiz_score,
    summary.previous_gpa,
  ].some(
    (value) =>
      value !== null
      && value !== undefined,
  );
}


function displayValue(
  value: number | null | undefined,
  suffix = "",
): string {
  if (
    value === null
    || value === undefined
  ) {
    return "N/A";
  }

  return `${value}${suffix}`;
}


function formatProbability(
  value: number | null | undefined,
): string {
  if (
    value === null
    || value === undefined
  ) {
    return "0.00%";
  }

  return `${(Number(value) * 100).toFixed(
    2,
  )}%`;
}


function formatDate(
  date: string,
): string {
  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


function getRiskClass(
  riskLevel: string,
): string {
  const normalisedRisk =
    riskLevel.toLowerCase();

  if (
    normalisedRisk.includes("high")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    normalisedRisk.includes("medium")
  ) {
    return (
      "bg-yellow-100 text-yellow-700"
    );
  }

  if (
    normalisedRisk.includes("low")
  ) {
    return (
      "bg-green-100 text-green-700"
    );
  }

  return "bg-gray-100 text-gray-700";
}


function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (
      error.response?.status === 404
    ) {
      return (
        "Your student profile was not found. "
        + "Please contact the administrator."
      );
    }

    if (
      error.response?.status === 401
    ) {
      return (
        "Your session has expired. "
        + "Please log in again."
      );
    }

    if (
      error.response?.status === 403
    ) {
      return (
        "You do not have permission "
        + "to view this dashboard."
      );
    }

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }
  }

  return (
    "Failed to load the Student Dashboard."
  );
}


function SectionHeader({
  title,
  linkText,
  linkPath,
}: {
  title: string;
  linkText: string;
  linkPath: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      <Link
        to={linkPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {linkText}
        <FiArrowRight />
      </Link>
    </div>
  );
}


function StudentInfo({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}


function ProbabilitySummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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


function NotificationSummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
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


function EmptySection({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-gray-500">
        {message}
      </p>
    </div>
  );
}


function DashboardLoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-xl bg-white p-6 shadow-md">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

        <p className="mt-4 text-gray-600">
          Loading Student Dashboard...
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
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <FiAlertCircle
          size={22}
          className="mt-0.5 shrink-0 text-red-600"
        />

        <div>
          <p className="font-medium text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}


export default StudentDashboardPage;