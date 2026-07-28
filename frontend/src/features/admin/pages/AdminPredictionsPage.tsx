import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  deleteAdminPrediction,
  generateStudentPrediction,
  getAdminPredictions,
  getPredictionShapExplanations,
} from "../services/predictionManagementService";

import { getAdminStudents } from "../services/studentManagementService";

import type {
  AdminPrediction,
  Prediction,
  ShapExplanation,
} from "../types/predictionManagement";

import type { AdminStudent } from "../types/studentManagement";

const PAGE_SIZE = 10;

function AdminPredictionsPage() {
  const { token } = useAuth();

  const [predictions, setPredictions] = useState<
    Prediction[]
  >([]);

  const [students, setStudents] = useState<
    AdminStudent[]
  >([]);

  const [searchInput, setSearchInput] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [semesterFilter, setSemesterFilter] =
    useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] =
    useState(false);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [isGenerateModalOpen, setIsGenerateModalOpen] =
    useState(false);

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [selectedPrediction, setSelectedPrediction] =
    useState<AdminPrediction | null>(null);

  const [shapExplanations, setShapExplanations] =
    useState<ShapExplanation[]>([]);

  const [shapLoading, setShapLoading] =
    useState(false);

  const [shapError, setShapError] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("You are not authenticated.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [predictionData, studentData] =
        await Promise.all([
          getAdminPredictions(token, {
            riskLevel: riskFilter || undefined,
            semester: semesterFilter
              ? Number(semesterFilter)
              : undefined,
            department:
              departmentFilter.trim() || undefined,
            skip: 0,
            limit: 1000,
          }),

          getAdminStudents(token, {
            skip: 0,
            limit: 1000,
          }),
        ]);

      setPredictions(predictionData);
      setStudents(studentData);
    } catch (requestError) {
      console.error(
        "Failed to load predictions:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [
    token,
    riskFilter,
    semesterFilter,
    departmentFilter,
  ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const studentsById = useMemo(() => {
    return new Map(
      students.map((student) => [
        student.id,
        student,
      ]),
    );
  }, [students]);

  const combinedPredictions =
    useMemo<AdminPrediction[]>(() => {
      return predictions.map((prediction) => {
        const student = studentsById.get(
          prediction.student_id,
        );

        return {
          ...prediction,
          student_name:
            student?.full_name ??
            `Student #${prediction.student_id}`,
          roll_number:
            student?.roll_number ?? "N/A",
          department:
            student?.department ?? "N/A",
          semester: student?.semester ?? 0,
        };
      });
    }, [predictions, studentsById]);

  const filteredPredictions = useMemo(() => {
    const normalizedSearch =
      searchInput.trim().toLowerCase();

    if (!normalizedSearch) {
      return combinedPredictions;
    }

    return combinedPredictions.filter(
      (prediction) =>
        prediction.student_name
          .toLowerCase()
          .includes(normalizedSearch) ||
        prediction.roll_number
          .toLowerCase()
          .includes(normalizedSearch) ||
        prediction.department
          .toLowerCase()
          .includes(normalizedSearch) ||
        prediction.risk_level
          .toLowerCase()
          .includes(normalizedSearch),
    );
  }, [combinedPredictions, searchInput]);

  const sortedPredictions = useMemo(() => {
    return [...filteredPredictions].sort(
      (firstPrediction, secondPrediction) => {
        const firstDate =
          firstPrediction.prediction_date
            ? new Date(
                firstPrediction.prediction_date,
              ).getTime()
            : firstPrediction.id;

        const secondDate =
          secondPrediction.prediction_date
            ? new Date(
                secondPrediction.prediction_date,
              ).getTime()
            : secondPrediction.id;

        return secondDate - firstDate;
      },
    );
  }, [filteredPredictions]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedPredictions.length / PAGE_SIZE,
    ),
  );

  const paginatedPredictions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return sortedPredictions.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [sortedPredictions, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const predictionStatistics = useMemo(() => {
    return combinedPredictions.reduce(
      (statistics, prediction) => {
        const normalizedRisk =
          prediction.risk_level.toLowerCase();

        statistics.total += 1;

        if (normalizedRisk.includes("high")) {
          statistics.high += 1;
        } else if (
          normalizedRisk.includes("medium")
        ) {
          statistics.medium += 1;
        } else if (
          normalizedRisk.includes("low")
        ) {
          statistics.low += 1;
        }

        return statistics;
      },
      {
        total: 0,
        low: 0,
        medium: 0,
        high: 0,
      },
    );
  }, [combinedPredictions]);

  async function handleGeneratePrediction() {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    if (!selectedStudentId) {
      setError(
        "Please select a student before generating a prediction.",
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccessMessage("");

      await generateStudentPrediction(
        token,
        Number(selectedStudentId),
      );

      setSuccessMessage(
        "Prediction, recommendation, notification and SHAP explanation generated successfully.",
      );

      setSelectedStudentId("");
      setIsGenerateModalOpen(false);

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to generate prediction:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeletePrediction(
    prediction: AdminPrediction,
  ) {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    const confirmed = window.confirm(
      `Delete prediction #${prediction.id} for ${prediction.student_name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(prediction.id);
      setError("");
      setSuccessMessage("");

      await deleteAdminPrediction(
        token,
        prediction.id,
      );

      setSuccessMessage(
        "Prediction deleted successfully.",
      );

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to delete prediction:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  async function openPredictionDetails(
    prediction: AdminPrediction,
  ) {
    setSelectedPrediction(prediction);
    setShapExplanations([]);
    setShapError("");

    if (!token) {
      setShapError("You are not authenticated.");
      return;
    }

    try {
      setShapLoading(true);

      const explanations =
        await getPredictionShapExplanations(
          token,
          prediction.id,
        );

      setShapExplanations(
        [...explanations].sort(
          (firstExplanation, secondExplanation) =>
            Math.abs(
              secondExplanation.shap_value,
            ) -
            Math.abs(
              firstExplanation.shap_value,
            ),
        ),
      );
    } catch (requestError) {
      console.error(
        "Failed to load SHAP explanations:",
        requestError,
      );

      setShapError(getErrorMessage(requestError));
    } finally {
      setShapLoading(false);
    }
  }

  function resetFilters() {
    setSearchInput("");
    setRiskFilter("");
    setSemesterFilter("");
    setDepartmentFilter("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiTrendingUp
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Predictions and SHAP
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Generate student-risk predictions and
            review explainable AI results.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedStudentId("");
            setError("");
            setIsGenerateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <FiPlus />
          Generate Prediction
        </button>
      </header>

      {successMessage && (
        <AlertMessage
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Predictions"
          value={predictionStatistics.total}
          icon={<FiBarChart2 size={25} />}
          className="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          title="Low Risk"
          value={predictionStatistics.low}
          icon={<FiActivity size={25} />}
          className="bg-green-50 text-green-700"
        />

        <SummaryCard
          title="Medium Risk"
          value={predictionStatistics.medium}
          icon={<FiAlertTriangle size={25} />}
          className="bg-yellow-50 text-yellow-700"
        />

        <SummaryCard
          title="High Risk"
          value={predictionStatistics.high}
          icon={<FiAlertTriangle size={25} />}
          className="bg-red-50 text-red-700"
        />
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search student, roll or department..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(event) => {
              setRiskFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">All risk levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">
              Medium Risk
            </option>
            <option value="High">
              High Risk
            </option>
          </select>

          <select
            value={semesterFilter}
            onChange={(event) => {
              setSemesterFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">All semesters</option>

            {Array.from(
              { length: 8 },
              (_, index) => (
                <option
                  key={index + 1}
                  value={index + 1}
                >
                  Semester {index + 1}
                </option>
              ),
            )}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-3 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              setPage(1);
            }}
            placeholder="Optional department filter"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-sm"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <LoadingState text="Loading predictions..." />
        ) : sortedPredictions.length === 0 ? (
          <EmptyState
            title="No predictions found"
            description="Generate a prediction or adjust the filters."
            onAction={() =>
              setIsGenerateModalOpen(true)
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Student</TableHeader>
                  <TableHeader>Risk Level</TableHeader>
                  <TableHeader>Low</TableHeader>
                  <TableHeader>Medium</TableHeader>
                  <TableHeader>High</TableHeader>
                  <TableHeader>Confidence</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedPredictions.map(
                  (prediction) => (
                    <tr
                      key={prediction.id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {prediction.student_name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {prediction.roll_number} ·{" "}
                            {prediction.department}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                            prediction.risk_level,
                          )}`}
                        >
                          {prediction.risk_level}
                        </span>
                      </TableCell>

                      <TableCell>
                        {formatProbability(
                          prediction.low_probability,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatProbability(
                          prediction.medium_probability,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatProbability(
                          prediction.high_probability,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatConfidence(prediction)}
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          prediction.prediction_date,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openPredictionDetails(
                                prediction,
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="View SHAP explanation"
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId === prediction.id
                            }
                            onClick={() =>
                              void handleDeletePrediction(
                                prediction,
                              )
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete prediction"
                          >
                            {deletingId ===
                            prediction.id ? (
                              <Spinner size="small" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ·{" "}
            {sortedPredictions.length} prediction
            {sortedPredictions.length === 1
              ? ""
              : "s"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(1, currentPage - 1),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages || loading
              }
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(
                    totalPages,
                    currentPage + 1,
                  ),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {isGenerateModalOpen && (
        <GeneratePredictionModal
          students={students}
          selectedStudentId={selectedStudentId}
          generating={generating}
          onStudentChange={setSelectedStudentId}
          onClose={() => {
            if (!generating) {
              setIsGenerateModalOpen(false);
            }
          }}
          onGenerate={() =>
            void handleGeneratePrediction()
          }
        />
      )}

      {selectedPrediction && (
        <PredictionDetailsModal
          prediction={selectedPrediction}
          explanations={shapExplanations}
          loading={shapLoading}
          error={shapError}
          onClose={() => {
            setSelectedPrediction(null);
            setShapExplanations([]);
            setShapError("");
          }}
        />
      )}
    </div>
  );
}

interface GeneratePredictionModalProps {
  students: AdminStudent[];
  selectedStudentId: string;
  generating: boolean;
  onStudentChange: (studentId: string) => void;
  onClose: () => void;
  onGenerate: () => void;
}

function GeneratePredictionModal({
  students,
  selectedStudentId,
  generating,
  onStudentChange,
  onClose,
  onGenerate,
}: GeneratePredictionModalProps) {
  return (
    <ModalContainer>
      <ModalHeader
        title="Generate Prediction"
        description="The latest academic record will be passed to the machine-learning model."
        onClose={onClose}
        disabled={generating}
      />

      <div className="space-y-5 p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Student
            <span className="ml-1 text-red-500">
              *
            </span>
          </span>

          <select
            value={selectedStudentId}
            onChange={(event) =>
              onStudentChange(event.target.value)
            }
            disabled={generating}
            className={getInputClass(false)}
          >
            <option value="">
              Select a student
            </option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.full_name} —{" "}
                {student.roll_number} — Semester{" "}
                {student.semester}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Generating a prediction will also generate
          its SHAP explanation, recommendation and
          student notification.
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onGenerate}
            disabled={
              generating || !selectedStudentId
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating && <Spinner size="small" />}

            {generating
              ? "Generating..."
              : "Generate Prediction"}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}

interface PredictionDetailsModalProps {
  prediction: AdminPrediction;
  explanations: ShapExplanation[];
  loading: boolean;
  error: string;
  onClose: () => void;
}

function PredictionDetailsModal({
  prediction,
  explanations,
  loading,
  error,
  onClose,
}: PredictionDetailsModalProps) {
  const maximumImpact = Math.max(
    ...explanations.map((explanation) =>
      Math.abs(explanation.shap_value),
    ),
    0.0001,
  );

  return (
    <ModalContainer maxWidth="max-w-4xl">
      <ModalHeader
        title="Prediction Explanation"
        description={`${prediction.student_name} · ${prediction.roll_number}`}
        onClose={onClose}
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCard
            label="Risk Level"
            value={prediction.risk_level}
          />

          <DetailCard
            label="Confidence"
            value={formatConfidence(prediction)}
          />

          <DetailCard
            label="Semester"
            value={`Semester ${prediction.semester}`}
          />

          <DetailCard
            label="Generated"
            value={formatDate(
              prediction.prediction_date,
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ProbabilityCard
            label="Low Risk"
            probability={
              prediction.low_probability
            }
          />

          <ProbabilityCard
            label="Medium Risk"
            probability={
              prediction.medium_probability
            }
          />

          <ProbabilityCard
            label="High Risk"
            probability={
              prediction.high_probability
            }
          />
        </div>

        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              SHAP Feature Importance
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Positive values increase predicted risk.
              Negative values reduce predicted risk.
            </p>
          </div>

          {loading ? (
            <LoadingState text="Loading SHAP explanation..." />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : explanations.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              No SHAP explanation is available for
              this prediction.
            </div>
          ) : (
            <div className="space-y-4">
              {explanations.map(
                (explanation, index) => {
                  const percentage =
                    (Math.abs(
                      explanation.shap_value,
                    ) /
                      maximumImpact) *
                    100;

                  const positive =
                    explanation.shap_value >= 0;

                  return (
                    <div
                      key={
                        explanation.id ??
                        `${explanation.feature_name}-${index}`
                      }
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium capitalize text-gray-900">
                            {formatFeatureName(
                              explanation.feature_name,
                            )}
                          </p>

                          {explanation.feature_value !==
                            null && (
                            <p className="text-xs text-gray-500">
                              Input value:{" "}
                              {String(
                                explanation.feature_value,
                              )}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            positive
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {explanation.shap_value.toFixed(
                            4,
                          )}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            positive
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.max(
                              percentage,
                              2,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <div className="flex justify-end border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}

function ModalContainer({
  children,
  maxWidth = "max-w-2xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  description,
  onClose,
  disabled = false,
}: {
  title: string;
  description: string;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        <FiX size={21} />
      </button>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div
        className={`inline-flex rounded-lg p-3 ${className}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ProbabilityCard({
  label,
  probability,
}: {
  label: string;
  probability: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 text-center">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {formatProbability(probability)}
      </p>
    </div>
  );
}

function AlertMessage({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const classes =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${classes}`}
    >
      <p>{message}</p>

      <button
        type="button"
        onClick={onClose}
        className="rounded p-1"
      >
        <FiX />
      </button>
    </div>
  );
}

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

      <p className="mt-4 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  onAction,
}: {
  title: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div className="p-12 text-center">
      <FiTrendingUp
        size={46}
        className="mx-auto text-gray-300"
      />

      <p className="mt-4 font-medium text-gray-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
      >
        <FiPlus />
        Generate Prediction
      </button>
    </div>
  );
}

function Spinner({
  size,
}: {
  size: "small";
}) {
  return (
    <span
      className={
        size === "small"
          ? "block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-current"
          : ""
      }
    />
  );
}

function TableHeader({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm text-gray-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function getInputClass(hasError: boolean): string {
  return [
    "w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition disabled:bg-gray-100",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}

function getRiskClass(riskLevel: string): string {
  const normalizedRisk =
    riskLevel.toLowerCase();

  if (normalizedRisk.includes("high")) {
    return "bg-red-100 text-red-700";
  }

  if (normalizedRisk.includes("medium")) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalizedRisk.includes("low")) {
    return "bg-green-100 text-green-700";
  }

  return "bg-gray-100 text-gray-700";
}

function formatProbability(value: number): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  const percentage =
    numericValue <= 1
      ? numericValue * 100
      : numericValue;

  return `${percentage.toFixed(2)}%`;
}

function formatConfidence(
  prediction: Prediction,
): string {
  if (
    prediction.confidence_percentage !== null &&
    prediction.confidence_percentage !== undefined
  ) {
    return formatProbability(
      prediction.confidence_percentage,
    );
  }

  if (
    prediction.confidence !== null &&
    prediction.confidence !== undefined
  ) {
    return formatProbability(
      prediction.confidence,
    );
  }

  return "N/A";
}

function formatDate(
  date: string | null | undefined,
): string {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFeatureName(
  featureName: string,
): string {
  return featureName.replaceAll("_", " ");
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return "Validation error";
        })
        .join(", ");
    }

    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "No academic record or prediction was found for the selected student.";
    }

    if (error.response?.status === 422) {
      return "The server rejected the submitted information.";
    }

    if (error.response?.status === 500) {
      return "The prediction service failed. Check the backend and machine-learning model.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default AdminPredictionsPage;