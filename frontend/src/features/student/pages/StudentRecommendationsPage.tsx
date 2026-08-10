import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiTarget,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  getStudentRecommendations,
} from "../services/studentRecommendationsService";

import type {
  StudentRecommendation,
} from "../types/studentRecommendations";


function StudentRecommendationsPage() {
  const { token } = useAuth();

  const [
    recommendations,
    setRecommendations,
  ] = useState<StudentRecommendation[]>([]);

  const [search, setSearch] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchRecommendations =
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

        const data =
          await getStudentRecommendations(
            token,
          );

        setRecommendations(
          [...data].sort(
            (
              firstRecommendation,
              secondRecommendation,
            ) =>
              secondRecommendation.id
              - firstRecommendation.id,
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load recommendations:",
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
    void fetchRecommendations();
  }, [fetchRecommendations]);

  const priorities = useMemo(() => {
    return Array.from(
      new Set(
        recommendations
          .map(
            (recommendation) =>
              recommendation.priority,
          )
          .filter(Boolean),
      ),
    );
  }, [recommendations]);

  const filteredRecommendations =
    useMemo(() => {
      const normalisedSearch =
        search.trim().toLowerCase();

      return recommendations.filter(
        (recommendation) => {
          const matchesSearch =
            !normalisedSearch
            || recommendation.title
              .toLowerCase()
              .includes(normalisedSearch)
            || recommendation.description
              .toLowerCase()
              .includes(normalisedSearch);

          const matchesPriority =
            !priorityFilter
            || recommendation.priority
              .toLowerCase()
              === priorityFilter
                .toLowerCase();

          const matchesStatus =
            !statusFilter
            || recommendation.status
              .toLowerCase()
              === statusFilter
                .toLowerCase();

          return (
            matchesSearch
            && matchesPriority
            && matchesStatus
          );
        },
      );
    }, [
      recommendations,
      search,
      priorityFilter,
      statusFilter,
    ]);

  const pendingCount =
    recommendations.filter(
      (recommendation) =>
        recommendation.status
          .toLowerCase()
        === "pending",
    ).length;

  const completedCount =
    recommendations.filter(
      (recommendation) =>
        recommendation.status
          .toLowerCase()
        === "completed",
    ).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <FiTarget
            size={30}
            className="text-blue-600"
          />

          <h1 className="text-3xl font-bold text-gray-900">
            Recommendations
          </h1>
        </div>

        <p className="mt-2 text-gray-500">
          View academic recommendations based
          on your latest risk predictions.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total"
          value={recommendations.length}
        />

        <SummaryCard
          title="Pending"
          value={pendingCount}
        />

        <SummaryCard
          title="Completed"
          value={completedCount}
        />
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search recommendations..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value,
              )
            }
            className={getInputClass()}
          >
            <option value="">
              All priorities
            </option>

            {priorities.map((priority) => (
              <option
                key={priority}
                value={priority}
              >
                {priority}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className={getInputClass()}
          >
            <option value="">
              All statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>
        </div>
      </section>

      {error && (
        <ErrorState
          message={error}
          onRetry={() =>
            void fetchRecommendations()
          }
        />
      )}

      {!error && loading && (
        <LoadingState />
      )}

      {!error
        && !loading
        && filteredRecommendations.length
          === 0 && (
        <EmptyState
          hasFilters={
            Boolean(search)
            || Boolean(priorityFilter)
            || Boolean(statusFilter)
          }
        />
      )}

      {!error
        && !loading
        && filteredRecommendations.length
          > 0 && (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredRecommendations.map(
            (recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={
                  recommendation
                }
              />
            ),
          )}
        </section>
      )}
    </div>
  );
}


function RecommendationCard({
  recommendation,
}: {
  recommendation: StudentRecommendation;
}) {
  const completed =
    recommendation.status
      .toLowerCase()
    === "completed";

  return (
    <article className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-2 ${
              completed
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {completed ? (
              <FiCheckCircle size={20} />
            ) : (
              <FiTarget size={20} />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {recommendation.title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Prediction #
              {recommendation.prediction_id}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
            recommendation.status,
          )}`}
        >
          {recommendation.status}
        </span>
      </div>

      <p className="mt-5 leading-7 text-gray-700">
        {recommendation.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
            recommendation.priority,
          )}`}
        >
          Priority: {recommendation.priority}
        </span>

        {recommendation.completed_at && (
          <span className="text-sm text-gray-500">
            Completed{" "}
            {formatDate(
              recommendation.completed_at,
            )}
          </span>
        )}
      </div>
    </article>
  );
}


function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}


function LoadingState() {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

      <p className="mt-4 text-gray-500">
        Loading recommendations...
      </p>
    </div>
  );
}


function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
      <FiTarget
        size={46}
        className="mx-auto text-gray-300"
      />

      <p className="mt-4 font-medium text-gray-700">
        {hasFilters
          ? "No recommendations match your filters."
          : "No recommendations are available yet."}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Recommendations will appear after
        a prediction is generated.
      </p>
    </div>
  );
}


function ErrorState({
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
          className="mt-0.5 text-red-600"
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

  return "bg-green-100 text-green-700";
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

  return "bg-yellow-100 text-yellow-700";
}


function getInputClass(): string {
  return "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
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
    return "on an unknown date";
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
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
        "No recommendations are "
        + "available yet."
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

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }
  }

  return "Failed to load recommendations.";
}


export default StudentRecommendationsPage;