import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import { getStudentPredictions } from "../services/studentPredictionsService";

import type { StudentPrediction } from "../types/studentPredictions";

function StudentPredictionsPage() {
  const { token } = useAuth();

  const [predictions, setPredictions] = useState<
    StudentPrediction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPredictions() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getStudentPredictions(token);

        setPredictions(data);
      } catch (error) {
        console.error(
          "Student predictions error:",
          error,
        );

        setError(
          "Failed to load prediction history.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPredictions();
  }, [token]);

  const sortedPredictions = useMemo(() => {
    return [...predictions].sort(
      (firstPrediction, secondPrediction) =>
        new Date(
          secondPrediction.prediction_date,
        ).getTime() -
        new Date(
          firstPrediction.prediction_date,
        ).getTime(),
    );
  }, [predictions]);

  const latestPrediction =
    sortedPredictions[0] ?? null;

  function formatProbability(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  function formatDate(date: string): string {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }

  function formatTime(date: string): string {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
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
          Loading predictions...
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Risk Predictions
        </h1>

        <p className="mt-2 text-gray-500">
          View your latest academic risk prediction and
          complete prediction history.
        </p>
      </div>

      {latestPrediction ? (
        <>
          {/* Latest Prediction */}
          <section className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Latest Risk Level
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${getRiskClass(
                      latestPrediction.risk_level,
                    )}`}
                  >
                    <FiAlertTriangle />

                    {latestPrediction.risk_level}
                  </span>

                  <span className="text-sm text-gray-500">
                    Prediction #{latestPrediction.id}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <FiCalendar />

                  {formatDate(
                    latestPrediction.prediction_date,
                  )}
                </p>

                <p className="flex items-center gap-2">
                  <FiClock />

                  {formatTime(
                    latestPrediction.prediction_date,
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Probability Cards */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Risk Probabilities
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ProbabilityCard
                title="Low Risk"
                value={formatProbability(
                  latestPrediction.low_probability,
                )}
                percentage={
                  latestPrediction.low_probability * 100
                }
                barClass="bg-green-500"
              />

              <ProbabilityCard
                title="Medium Risk"
                value={formatProbability(
                  latestPrediction.medium_probability,
                )}
                percentage={
                  latestPrediction.medium_probability * 100
                }
                barClass="bg-yellow-500"
              />

              <ProbabilityCard
                title="High Risk"
                value={formatProbability(
                  latestPrediction.high_probability,
                )}
                percentage={
                  latestPrediction.high_probability * 100
                }
                barClass="bg-red-500"
              />
            </div>
          </section>

          {/* Prediction History */}
          <section className="overflow-hidden rounded-xl bg-white shadow-md">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <FiTrendingUp
                  size={24}
                  className="text-blue-600"
                />

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Prediction History
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Total predictions:{" "}
                    {sortedPredictions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Risk Level
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      Low
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      Medium
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      High
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {sortedPredictions.map(
                    (prediction) => (
                      <tr
                        key={prediction.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          #{prediction.id}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskClass(
                              prediction.risk_level,
                            )}`}
                          >
                            {prediction.risk_level}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-green-700">
                          {formatProbability(
                            prediction.low_probability,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-yellow-700">
                          {formatProbability(
                            prediction.medium_probability,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-red-700">
                          {formatProbability(
                            prediction.high_probability,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            prediction.prediction_date,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatTime(
                            prediction.prediction_date,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl bg-white p-10 text-center shadow-md">
          <FiTrendingUp
            className="mx-auto text-gray-300"
            size={50}
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            No predictions available
          </h2>

          <p className="mt-2 text-gray-500">
            Your prediction history will appear here
            after the system generates a prediction.
          </p>
        </div>
      )}
    </div>
  );
}

interface ProbabilityCardProps {
  title: string;
  value: string;
  percentage: number;
  barClass: string;
}

function ProbabilityCard({
  title,
  value,
  percentage,
  barClass,
}: ProbabilityCardProps) {
  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100,
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default StudentPredictionsPage;