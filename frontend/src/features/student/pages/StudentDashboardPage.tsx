import axios from "axios";
import {
  useCallback,
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
  StudentRecommendation,
  StudentRecommendationsResponse,
} from "../types/studentRecommendations";


interface DashboardPrediction {
  risk_level: string;
  prediction_date: string | null;
  low_probability: number;
  medium_probability: number;
  high_probability: number;
}


interface DashboardRecommendation {
  title: string;
  description: string;
  priority: string;
  status: string;
}


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


  const fetchStudentData =
    useCallback(async () => {
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

        /*
         * The main dashboard request is required.
         * Predictions and recommendations are optional.
         */
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
            Array.isArray(
              predictionsResult.value,
            )
              ? predictionsResult.value
              : [],
          );
        } else {
          console.error(
            "Failed to load student predictions:",
            predictionsResult.reason,
          );

          setPredictions([]);
        }

        if (
          recommendationsResult.status
          === "fulfilled"
        ) {
          setRecommendations(
            Array.isArray(
              recommendationsResult.value,
            )
              ? recommendationsResult.value
              : [],
          );
        } else {
          console.error(
            "Failed to load student recommendations:",
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
    }, [token]);


  useEffect(() => {
    void fetchStudentData();
  }, [fetchStudentData]);


  const latestPrediction =
    useMemo<StudentPrediction | null>(
      () => {
        if (
          !Array.isArray(predictions)
          || predictions.length === 0
        ) {
          return null;
        }

        return [...predictions].sort(
          (
            firstPrediction,
            secondPrediction,
          ) => {
            const secondDate =
              new Date(
                secondPrediction
                  .prediction_date,
              ).getTime();

            const firstDate =
              new Date(
                firstPrediction
                  .prediction_date,
              ).getTime();

            return secondDate - firstDate;
          },
        )[0];
      },
      [predictions],
    );


  const displayedPrediction =
    useMemo<DashboardPrediction | null>(
      () => {
        if (latestPrediction) {
          return {
            risk_level:
              latestPrediction.risk_level,
            prediction_date:
              latestPrediction
                .prediction_date
              ?? null,
            low_probability:
              Number(
                latestPrediction
                  .low_probability,
              ) || 0,
            medium_probability:
              Number(
                latestPrediction
                  .medium_probability,
              ) || 0,
            high_probability:
              Number(
                latestPrediction
                  .high_probability,
              ) || 0,
          };
        }

        const dashboardPrediction =
          getDashboardPrediction(
            dashboard?.latest_prediction,
          );

        return dashboardPrediction;
      },
      [
        dashboard?.latest_prediction,
        latestPrediction,
      ],
    );


  const latestRecommendation =
    useMemo<StudentRecommendation | null>(
      () => {
        if (
          !Array.isArray(
            recommendations,
          )
          || recommendations.length === 0
        ) {
          return null;
        }

        return [...recommendations].sort(
          (
            firstRecommendation,
            secondRecommendation,
          ) =>
            secondRecommendation.id
            - firstRecommendation.id,
        )[0];
      },
      [recommendations],
    );


  const displayedRecommendation =
    useMemo<DashboardRecommendation | null>(
      () => {
        if (latestRecommendation) {
          return {
            title:
              latestRecommendation.title
              || "Recommendation",
            description:
              latestRecommendation
                .description
              || "No recommendation text available.",
            priority:
              latestRecommendation.priority
              || "N/A",
            status:
              latestRecommendation.status
              || "Pending",
          };
        }

        return getDashboardRecommendation(
          dashboard?.latest_recommendation,
        );
      },
      [
        dashboard
          ?.latest_recommendation,
        latestRecommendation,
      ],
    );


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


  const academicSummary =
    dashboard.academic_summary
    ?? {
      attendance: null,
      internal_marks: null,
      assignment_score: null,
      quiz_score: null,
      previous_gpa: null,
    };


  const notificationSummary =
    dashboard.notifications
    ?? {
      total: 0,
      unread: 0,
    };


  return (
    <div className="space-y-8">
      {/* Page heading */}
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


      {/* Optional-data warning */}
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


      {/* Student information */}
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
              || "N/A"
            }
          />

          <StudentInfo
            label="Department"
            value={
              dashboard.student.department
              || "N/A"
            }
          />

          <StudentInfo
            label="Semester"
            value={
              dashboard.student.semester
                ? `Semester ${dashboard.student.semester}`
                : "N/A"
            }
          />
        </div>
      </section>


      {/* Academic summary */}
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
              academicSummary.attendance,
              "%",
            )}
            icon={
              <FiClipboard size={30} />
            }
          />

          <StatCard
            title="Internal Marks"
            value={displayValue(
              academicSummary
                .internal_marks,
            )}
            icon={
              <FiBookOpen size={30} />
            }
          />

          <StatCard
            title="Assignment Score"
            value={displayValue(
              academicSummary
                .assignment_score,
            )}
            icon={
              <FiClipboard size={30} />
            }
          />

          <StatCard
            title="Quiz Score"
            value={displayValue(
              academicSummary.quiz_score,
            )}
            icon={
              <FiAward size={30} />
            }
          />

          <StatCard
            title="Previous GPA"
            value={displayValue(
              academicSummary.previous_gpa,
            )}
            icon={
              <FiTrendingUp size={30} />
            }
          />
        </div>

        {!hasAcademicData(
          academicSummary,
        ) && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            No academic record has been
            added for this student yet.
          </div>
        )}
      </section>


      {/* Prediction overview */}
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


      {/* Recommendation and notifications */}
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

            <Link
              to="/student/recommendations"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
              <FiArrowRight />
            </Link>
          </div>

          {displayedRecommendation ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Title
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {
                    displayedRecommendation
                      .title
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Recommendation
                </p>

                <p className="mt-1 leading-7 text-gray-700">
                  {
                    displayedRecommendation
                      .description
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                    displayedRecommendation
                      .priority,
                  )}`}
                >
                  Priority:{" "}
                  {
                    displayedRecommendation
                      .priority
                  }
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    displayedRecommendation
                      .status,
                  )}`}
                >
                  Status:{" "}
                  {
                    displayedRecommendation
                      .status
                  }
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              No recommendation is currently
              available.
            </p>
          )}
        </div>


        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FiBell
                size={24}
                className="text-blue-600"
              />

              <h2 className="text-xl font-semibold text-gray-900">
                Notifications
              </h2>
            </div>

            <Link
              to="/student/notifications"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
              <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NotificationSummary
              label="Total Notifications"
              value={
                notificationSummary.total
              }
            />

            <NotificationSummary
              label="Unread Notifications"
              value={
                notificationSummary.unread
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}


function getDashboardPrediction(
  value: unknown,
): DashboardPrediction | null {
  if (
    typeof value !== "object"
    || value === null
  ) {
    return null;
  }

  const prediction =
    value as Record<string, unknown>;

  const riskLevel =
    typeof prediction.risk_level
      === "string"
      ? prediction.risk_level
      : null;

  if (!riskLevel) {
    return null;
  }

  return {
    risk_level: riskLevel,

    prediction_date:
      typeof prediction.prediction_date
        === "string"
        ? prediction.prediction_date
        : null,

    low_probability:
      toNumber(
        prediction.low_probability,
      ),

    medium_probability:
      toNumber(
        prediction.medium_probability,
      ),

    high_probability:
      toNumber(
        prediction.high_probability,
      ),
  };
}


function getDashboardRecommendation(
  value: unknown,
): DashboardRecommendation | null {
  if (
    typeof value !== "object"
    || value === null
  ) {
    return null;
  }

  const recommendation =
    value as Record<string, unknown>;

  const recommendationText =
    typeof recommendation
      .recommendation_text
      === "string"
      ? recommendation
          .recommendation_text
      : null;

  if (!recommendationText) {
    return null;
  }

  return {
    title: "Latest Recommendation",

    description:
      recommendationText,

    priority:
      typeof recommendation.priority
        === "string"
        ? recommendation.priority
        : "N/A",

    status: "Pending",
  };
}


function hasAcademicData(
  summary: {
    attendance?: number | null;
    internal_marks?: number | null;
    assignment_score?: number | null;
    quiz_score?: number | null;
    previous_gpa?: number | null;
  },
): boolean {
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


function toNumber(
  value: unknown,
): number {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0;
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
  value: number,
): string {
  return `${(
    Number(value) * 100
  ).toFixed(2)}%`;
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


function getPriorityClass(
  priority: string,
): string {
  const normalisedPriority =
    priority.toLowerCase();

  if (
    normalisedPriority.includes("high")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    normalisedPriority.includes("medium")
  ) {
    return (
      "bg-yellow-100 text-yellow-700"
    );
  }

  if (
    normalisedPriority.includes("low")
  ) {
    return (
      "bg-green-100 text-green-700"
    );
  }

  return "bg-gray-100 text-gray-700";
}


function getStatusClass(
  status: string,
): string {
  if (
    status.toLowerCase()
    === "completed"
  ) {
    return "bg-green-100 text-green-700";
  }

  return (
    "bg-yellow-100 text-yellow-700"
  );
}


function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

    if (
      typeof detail === "string"
    ) {
      return detail;
    }

    if (
      error.response?.status
      === 404
    ) {
      return (
        "Your student profile was not found. "
        + "Please contact the administrator."
      );
    }

    if (
      error.response?.status
      === 401
    ) {
      return (
        "Your session has expired. "
        + "Please log in again."
      );
    }

    if (
      error.response?.status
      === 403
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