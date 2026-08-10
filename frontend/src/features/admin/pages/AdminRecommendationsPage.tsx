import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAdminRecommendation,
  deleteAdminRecommendation,
  getAdminRecommendations,
  updateAdminRecommendation,
  updateAdminRecommendationStatus,
} from "../services/recommendationManagementService";

import { getAdminPredictions } from "../services/predictionManagementService";
import { getAdminStudents } from "../services/studentManagementService";

import type {
  AdminRecommendation,
  Recommendation,
  RecommendationPayload,
  RecommendationPriority,
} from "../types/recommendationManagement";

import type { Prediction } from "../types/predictionManagement";
import type { AdminStudent } from "../types/studentManagement";

const PAGE_SIZE = 10;

interface RecommendationFormState {
  predictionId: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
}

const emptyForm: RecommendationFormState = {
  predictionId: "",
  title: "",
  description: "",
  priority: "Medium",
};

function AdminRecommendationsPage() {
  const { token } = useAuth();

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [predictions, setPredictions] = useState<
    Prediction[]
  >([]);

  const [students, setStudents] = useState<
    AdminStudent[]
  >([]);

  const [searchInput, setSearchInput] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");
  const [modalError, setModalError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingRecommendation,
    setEditingRecommendation,
  ] = useState<AdminRecommendation | null>(null);

  const [form, setForm] =
    useState<RecommendationFormState>(emptyForm);

  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<
        keyof RecommendationFormState,
        string
      >
    >
  >({});

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("You are not authenticated.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        recommendationData,
        predictionData,
        studentData,
      ] = await Promise.all([
        getAdminRecommendations(token, {
          skip: 0,
          limit: 1000,
        }),

        getAdminPredictions(token, {
          skip: 0,
          limit: 1000,
        }),

        getAdminStudents(token, {
          skip: 0,
          limit: 1000,
        }),
      ]);

      setRecommendations(recommendationData);
      setPredictions(predictionData);
      setStudents(studentData);
    } catch (requestError) {
      console.error(
        "Failed to load recommendations:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const predictionsById = useMemo(() => {
    return new Map(
      predictions.map((prediction) => [
        prediction.id,
        prediction,
      ]),
    );
  }, [predictions]);

  const combinedRecommendations =
    useMemo<AdminRecommendation[]>(() => {
      return recommendations.map(
        (recommendation) => {
          const prediction = predictionsById.get(
            recommendation.prediction_id,
          );

          const student = prediction
            ? studentsById.get(
                prediction.student_id,
              )
            : undefined;

          return {
            ...recommendation,

            student_id:
              prediction?.student_id ?? 0,

            student_name:
              student?.full_name ??
              "Unknown Student",

            roll_number:
              student?.roll_number ?? "N/A",

            department:
              student?.department ?? "N/A",

            semester:
              student?.semester ?? 0,

            risk_level:
              prediction?.risk_level ?? "N/A",
          };
        },
      );
    }, [
      recommendations,
      predictionsById,
      studentsById,
    ]);

  const filteredRecommendations = useMemo(() => {
    const normalizedSearch =
      searchInput.trim().toLowerCase();

    return combinedRecommendations.filter(
      (recommendation) => {
        const matchesSearch =
          !normalizedSearch ||
          recommendation.student_name
            .toLowerCase()
            .includes(normalizedSearch) ||
          recommendation.roll_number
            .toLowerCase()
            .includes(normalizedSearch) ||
          recommendation.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          recommendation.description
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesPriority =
          !priorityFilter ||
          recommendation.priority.toLowerCase() ===
            priorityFilter.toLowerCase();

        const matchesStatus =
          !statusFilter ||
          recommendation.status.toLowerCase() ===
            statusFilter.toLowerCase();

        const matchesSemester =
          !semesterFilter ||
          recommendation.semester ===
            Number(semesterFilter);

        return (
          matchesSearch &&
          matchesPriority &&
          matchesStatus &&
          matchesSemester
        );
      },
    );
  }, [
    combinedRecommendations,
    searchInput,
    priorityFilter,
    statusFilter,
    semesterFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRecommendations.length / PAGE_SIZE,
    ),
  );

  const paginatedRecommendations = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return filteredRecommendations.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredRecommendations, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const statistics = useMemo(() => {
    return combinedRecommendations.reduce(
      (result, recommendation) => {
        result.total += 1;

        if (
          recommendation.status.toLowerCase() ===
          "completed"
        ) {
          result.completed += 1;
        } else {
          result.pending += 1;
        }

        if (
          recommendation.priority.toLowerCase() ===
          "high"
        ) {
          result.high += 1;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        completed: 0,
        high: 0,
      },
    );
  }, [combinedRecommendations]);

  function openCreateModal() {
    setEditingRecommendation(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
    setIsModalOpen(true);
  }

  function openEditModal(
    recommendation: AdminRecommendation,
  ) {
    setEditingRecommendation(recommendation);

    setForm({
      predictionId: String(
        recommendation.prediction_id,
      ),
      title: recommendation.title,
      description: recommendation.description,
      priority:
        normalizePriority(
          recommendation.priority,
        ),
    });

    setFormErrors({});
    setModalError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingRecommendation(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
  }

  function updateFormField(
    field: keyof RecommendationFormState,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setModalError("");
  }

  function validateForm(): boolean {
    const errors: Partial<
      Record<
        keyof RecommendationFormState,
        string
      >
    > = {};

    if (!form.predictionId) {
      errors.predictionId =
        "Please select a prediction.";
    }

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      errors.description =
        "Description is required.";
    }

    if (!form.priority) {
      errors.priority =
        "Priority is required.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setModalError(
        "You are not authenticated.",
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");
      setSuccessMessage("");

      const payload: RecommendationPayload = {
        prediction_id: Number(
          form.predictionId,
        ),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      };

      if (editingRecommendation) {
        await updateAdminRecommendation(
          token,
          editingRecommendation.id,
          payload,
        );

        setSuccessMessage(
          "Recommendation updated successfully.",
        );
      } else {
        await createAdminRecommendation(
          token,
          payload,
        );

        setSuccessMessage(
          "Recommendation created successfully.",
        );
      }

      closeModal();
      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to save recommendation:",
        requestError,
      );

      setModalError(
        getErrorMessage(requestError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(
    recommendation: AdminRecommendation,
  ) {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    const newStatus =
      recommendation.status.toLowerCase() ===
      "completed"
        ? "Pending"
        : "Completed";

    try {
      setUpdatingStatusId(recommendation.id);
      setError("");
      setSuccessMessage("");

      await updateAdminRecommendationStatus(
        token,
        recommendation.id,
        newStatus,
      );

      setSuccessMessage(
        `Recommendation marked as ${newStatus.toLowerCase()}.`,
      );

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to update recommendation status:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(
    recommendation: AdminRecommendation,
  ) {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    const confirmed = window.confirm(
      `Delete the recommendation "${recommendation.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(recommendation.id);
      setError("");
      setSuccessMessage("");

      await deleteAdminRecommendation(
        token,
        recommendation.id,
      );

      setSuccessMessage(
        "Recommendation deleted successfully.",
      );

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to delete recommendation:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setSearchInput("");
    setPriorityFilter("");
    setStatusFilter("");
    setSemesterFilter("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
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
            Manage academic support recommendations
            generated from student risk predictions.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <FiPlus />
          Add Recommendation
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
          label="Total"
          value={statistics.total}
          className="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          label="Pending"
          value={statistics.pending}
          className="bg-yellow-50 text-yellow-700"
        />

        <SummaryCard
          label="Completed"
          value={statistics.completed}
          className="bg-green-50 text-green-700"
        />

        <SummaryCard
          label="High Priority"
          value={statistics.high}
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
              placeholder="Search recommendation or student..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">
              All priorities
            </option>
            <option value="High">High</option>
            <option value="Medium">
              Medium
            </option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">All statuses</option>
            <option value="Pending">
              Pending
            </option>
            <option value="Completed">
              Completed
            </option>
          </select>

          <select
            value={semesterFilter}
            onChange={(event) => {
              setSemesterFilter(
                event.target.value,
              );
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">
              All semesters
            </option>

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
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
            className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <LoadingState text="Loading recommendations..." />
        ) : paginatedRecommendations.length ===
          0 ? (
          <EmptyState
            title="No recommendations found"
            description="Generate a prediction or add a recommendation."
            action="Add Recommendation"
            onAction={openCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>
                    Student
                  </TableHeader>
                  <TableHeader>
                    Recommendation
                  </TableHeader>
                  <TableHeader>
                    Priority
                  </TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>
                    Risk Level
                  </TableHeader>
                  <TableHeader
                    align="right"
                  >
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedRecommendations.map(
                  (recommendation) => (
                    <tr
                      key={recommendation.id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <p className="font-medium text-gray-900">
                          {
                            recommendation.student_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            recommendation.roll_number
                          }{" "}
                          · Semester{" "}
                          {
                            recommendation.semester
                          }
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-sm">
                          <p className="font-medium text-gray-900">
                            {recommendation.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {
                              recommendation.description
                            }
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                            recommendation.priority,
                          )}`}
                        >
                          {
                            recommendation.priority
                          }
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            recommendation.status,
                          )}`}
                        >
                          {recommendation.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        {
                          recommendation.risk_level
                        }
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleStatus(
                                recommendation,
                              )
                            }
                            disabled={
                              updatingStatusId ===
                              recommendation.id
                            }
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            title="Change status"
                          >
                            <FiCheck />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                recommendation,
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit recommendation"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                recommendation,
                              )
                            }
                            disabled={
                              deletingId ===
                              recommendation.id
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete recommendation"
                          >
                            <FiTrash2 />
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

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={
            filteredRecommendations.length
          }
          label="recommendations"
          loading={loading}
          onPageChange={setPage}
        />
      </section>

      {isModalOpen && (
        <RecommendationModal
          predictions={predictions}
          studentsById={studentsById}
          form={form}
          formErrors={formErrors}
          modalError={modalError}
          submitting={submitting}
          editing={Boolean(
            editingRecommendation,
          )}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onFieldChange={updateFormField}
        />
      )}
    </div>
  );
}

interface RecommendationModalProps {
  predictions: Prediction[];
  studentsById: Map<number, AdminStudent>;
  form: RecommendationFormState;
  formErrors: Partial<
    Record<
      keyof RecommendationFormState,
      string
    >
  >;
  modalError: string;
  submitting: boolean;
  editing: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  onFieldChange: (
    field: keyof RecommendationFormState,
    value: string,
  ) => void;
}

function RecommendationModal({
  predictions,
  studentsById,
  form,
  formErrors,
  modalError,
  submitting,
  editing,
  onClose,
  onSubmit,
  onFieldChange,
}: RecommendationModalProps) {
  return (
    <ModalContainer>
      <ModalHeader
        title={
          editing
            ? "Edit Recommendation"
            : "Add Recommendation"
        }
        description="Connect the recommendation to a student risk prediction."
        onClose={onClose}
        disabled={submitting}
      />

      <form
        onSubmit={(event) =>
          void onSubmit(event)
        }
        className="space-y-5 p-6"
      >
        {modalError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {modalError}
          </div>
        )}

        <FormField
          label="Prediction"
          required
          error={formErrors.predictionId}
        >
          <select
            value={form.predictionId}
            onChange={(event) =>
              onFieldChange(
                "predictionId",
                event.target.value,
              )
            }
            disabled={submitting}
            className={getInputClass(
              Boolean(
                formErrors.predictionId,
              ),
            )}
          >
            <option value="">
              Select prediction
            </option>

            {predictions.map((prediction) => {
              const student =
                studentsById.get(
                  prediction.student_id,
                );

              return (
                <option
                  key={prediction.id}
                  value={prediction.id}
                >
                  Prediction #{prediction.id} —{" "}
                  {student?.full_name ??
                    `Student ${prediction.student_id}`}{" "}
                  — {prediction.risk_level}
                </option>
              );
            })}
          </select>
        </FormField>

        <FormField
          label="Title"
          required
          error={formErrors.title}
        >
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              onFieldChange(
                "title",
                event.target.value,
              )
            }
            disabled={submitting}
            placeholder="Recommendation title"
            className={getInputClass(
              Boolean(formErrors.title),
            )}
          />
        </FormField>

        <FormField
          label="Description"
          required
          error={formErrors.description}
        >
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) =>
              onFieldChange(
                "description",
                event.target.value,
              )
            }
            disabled={submitting}
            placeholder="Describe the recommended intervention or support."
            className={getInputClass(
              Boolean(
                formErrors.description,
              ),
            )}
          />
        </FormField>

        <FormField
          label="Priority"
          required
          error={formErrors.priority}
        >
          <select
            value={form.priority}
            onChange={(event) =>
              onFieldChange(
                "priority",
                event.target.value,
              )
            }
            disabled={submitting}
            className={getInputClass(
              Boolean(formErrors.priority),
            )}
          >
            <option value="High">High</option>
            <option value="Medium">
              Medium
            </option>
            <option value="Low">Low</option>
          </select>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editing
                ? "Save Changes"
                : "Create Recommendation"}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <span
        className={`inline-flex rounded-lg px-3 py-2 text-sm font-semibold ${className}`}
      >
        {label}
      </span>

      <p className="mt-4 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ModalContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
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
    <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
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
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <FiX size={21} />
      </button>
    </div>
  );
}

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <span className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
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
        align === "right"
          ? "text-right"
          : "text-left"
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
      className={`px-5 py-4 text-sm text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  label,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  label: string;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages} ·{" "}
        {totalItems} {label}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 1 || loading}
          onClick={() =>
            onPageChange(
              Math.max(1, page - 1),
            )
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
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
            onPageChange(
              Math.min(
                totalPages,
                page + 1,
              ),
            )
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          Next
          <FiChevronRight />
        </button>
      </div>
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
      className={`flex justify-between rounded-lg border px-4 py-3 ${classes}`}
    >
      <p>{message}</p>

      <button type="button" onClick={onClose}>
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
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="p-12 text-center">
      <FiTarget
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
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white"
      >
        {action}
      </button>
    </div>
  );
}

function getInputClass(
  hasError: boolean,
): string {
  return [
    "w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition disabled:bg-gray-100",
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}

function normalizePriority(
  priority: string,
): RecommendationPriority {
  if (priority === "High") {
    return "High";
  }

  if (priority === "Low") {
    return "Low";
  }

  return "Medium";
}

function getPriorityClass(
  priority: string,
): string {
  const value = priority.toLowerCase();

  if (value === "high") {
    return "bg-red-100 text-red-700";
  }

  if (value === "medium") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}

function getStatusClass(
  status: string,
): string {
  return status.toLowerCase() === "completed"
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-700";
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

    if (error.response?.status === 401) {
      return "Your session has expired.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to manage recommendations.";
    }

    if (error.response?.status === 404) {
      return "The prediction or recommendation was not found.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default AdminRecommendationsPage;