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
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAcademicRecord,
  getAcademicRecords,
} from "../services/academicRecordManagementService";

import { getAdminStudents } from "../services/studentManagementService";

import type {
  AcademicRecord,
  AcademicRecordFormState,
  CreateAcademicRecordPayload,
} from "../types/academicRecordManagement";

import type { AdminStudent } from "../types/studentManagement";

const PAGE_SIZE = 10;

const emptyForm: AcademicRecordFormState = {
  studentId: "",
  attendance: "",
  internalMarks: "",
  assignmentScore: "",
  quizScore: "",
  previousGpa: "",
  semester: "",
  gender: "",
};

function AdminAcademicRecordsPage() {
  const { token } = useAuth();

  const [records, setRecords] = useState<
    AcademicRecord[]
  >([]);

  const [students, setStudents] = useState<
    AdminStudent[]
  >([]);

  const [searchInput, setSearchInput] = useState("");
  const [semesterFilter, setSemesterFilter] =
    useState("");
  const [genderFilter, setGenderFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [modalError, setModalError] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [form, setForm] =
    useState<AcademicRecordFormState>(emptyForm);

  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<keyof AcademicRecordFormState, string>
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

      const [academicRecords, studentRecords] =
        await Promise.all([
          getAcademicRecords(token),

          getAdminStudents(token, {
            skip: 0,
            limit: 1000,
          }),
        ]);

      const sortedRecords = [...academicRecords].sort(
        (firstRecord, secondRecord) =>
          secondRecord.id - firstRecord.id,
      );

      setRecords(sortedRecords);
      setStudents(studentRecords);
    } catch (requestError) {
      console.error(
        "Failed to load academic records:",
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

  const filteredRecords = useMemo(() => {
    const normalisedSearch =
      searchInput.trim().toLowerCase();

    return records.filter((record) => {
      const student = studentsById.get(
        record.student_id,
      );

      const matchesSearch =
        !normalisedSearch ||
        student?.full_name
          .toLowerCase()
          .includes(normalisedSearch) ||
        student?.email
          .toLowerCase()
          .includes(normalisedSearch) ||
        student?.roll_number
          .toLowerCase()
          .includes(normalisedSearch) ||
        student?.department
          .toLowerCase()
          .includes(normalisedSearch) ||
        String(record.student_id).includes(
          normalisedSearch,
        );

      const matchesSemester =
        !semesterFilter ||
        record.semester ===
          Number(semesterFilter);

      const matchesGender =
        !genderFilter ||
        record.gender.toLowerCase() ===
          genderFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesSemester &&
        matchesGender
      );
    });
  }, [
    records,
    studentsById,
    searchInput,
    semesterFilter,
    genderFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE),
  );

  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return filteredRecords.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredRecords, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function openCreateModal() {
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
  }

  function updateFormField(
    field: keyof AcademicRecordFormState,
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
      Record<keyof AcademicRecordFormState, string>
    > = {};

    if (!form.studentId) {
      errors.studentId =
        "Please select a student.";
    }

    validatePercentage(
      form.attendance,
      "Attendance",
      "attendance",
      errors,
    );

    validatePercentage(
      form.internalMarks,
      "Internal marks",
      "internalMarks",
      errors,
    );

    validatePercentage(
      form.assignmentScore,
      "Assignment score",
      "assignmentScore",
      errors,
    );

    validatePercentage(
      form.quizScore,
      "Quiz score",
      "quizScore",
      errors,
    );

    if (!form.previousGpa.trim()) {
      errors.previousGpa =
        "Previous GPA is required.";
    } else {
      const previousGpa = Number(
        form.previousGpa,
      );

      if (
        Number.isNaN(previousGpa) ||
        previousGpa < 0 ||
        previousGpa > 4
      ) {
        errors.previousGpa =
          "Previous GPA must be between 0 and 4.";
      }
    }

    if (!form.semester) {
      errors.semester =
        "Please select a semester.";
    } else {
      const semester = Number(form.semester);

      if (
        !Number.isInteger(semester) ||
        semester < 1 ||
        semester > 8
      ) {
        errors.semester =
          "Semester must be between 1 and 8.";
      }
    }

    if (!form.gender) {
      errors.gender = "Please select gender.";
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
      setError("");
      setSuccessMessage("");

      const payload: CreateAcademicRecordPayload =
        {
          student_id: Number(form.studentId),
          attendance: Number(form.attendance),
          internal_marks: Number(
            form.internalMarks,
          ),
          assignment_score: Number(
            form.assignmentScore,
          ),
          quiz_score: Number(form.quizScore),
          previous_gpa: Number(
            form.previousGpa,
          ),
          semester: Number(form.semester),
          gender: form.gender,
        };

      await createAcademicRecord(token, payload);

      setSuccessMessage(
        "Academic record created successfully.",
      );

      setIsModalOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      setModalError("");

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to create academic record:",
        requestError,
      );

      setModalError(
        getErrorMessage(requestError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetFilters() {
    setSearchInput("");
    setSemesterFilter("");
    setGenderFilter("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiBookOpen
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Academic Records
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Manage student attendance, marks, GPA and
            semester performance.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiPlus />
          Add Academic Record
        </button>
      </header>

      {successMessage && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          <p>{successMessage}</p>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="rounded p-1 hover:bg-green-100"
            aria-label="Close success message"
          >
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded p-1 hover:bg-red-100"
            aria-label="Close error message"
          >
            <FiX />
          </button>
        </div>
      )}

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search by student..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={semesterFilter}
            onChange={(event) => {
              setSemesterFilter(
                event.target.value,
              );
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          <select
            value={genderFilter}
            onChange={(event) => {
              setGenderFilter(
                event.target.value,
              );
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All genders
            </option>
            <option value="Male">Male</option>
            <option value="Female">
              Female
            </option>
            <option value="Other">Other</option>
          </select>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-gray-500">
              Loading academic records...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <FiBookOpen
              size={46}
              className="mx-auto text-gray-300"
            />

            <p className="mt-4 font-medium text-gray-700">
              No academic records found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Adjust the filters or create a new
              academic record.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              <FiPlus />
              Add Academic Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>
                    Student
                  </TableHeader>

                  <TableHeader>
                    Semester
                  </TableHeader>

                  <TableHeader>
                    Attendance
                  </TableHeader>

                  <TableHeader>
                    Internal
                  </TableHeader>

                  <TableHeader>
                    Assignment
                  </TableHeader>

                  <TableHeader>
                    Quiz
                  </TableHeader>

                  <TableHeader>GPA</TableHeader>

                  <TableHeader>
                    Gender
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedRecords.map(
                  (record) => {
                    const student =
                      studentsById.get(
                        record.student_id,
                      );

                    return (
                      <tr
                        key={record.id}
                        className="transition hover:bg-gray-50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {student?.full_name ??
                                `Student #${record.student_id}`}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {student?.roll_number ??
                                "Student information unavailable"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                            Semester{" "}
                            {record.semester}
                          </span>
                        </TableCell>

                        <TableCell>
                          {formatScore(
                            record.attendance,
                            "%",
                          )}
                        </TableCell>

                        <TableCell>
                          {formatScore(
                            record.internal_marks,
                          )}
                        </TableCell>

                        <TableCell>
                          {formatScore(
                            record.assignment_score,
                          )}
                        </TableCell>

                        <TableCell>
                          {formatScore(
                            record.quiz_score,
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {record.previous_gpa.toFixed(
                              2,
                            )}
                          </span>
                        </TableCell>

                        <TableCell>
                          {record.gender}
                        </TableCell>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ·{" "}
            {filteredRecords.length} record
            {filteredRecords.length === 1
              ? ""
              : "s"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(
                    1,
                    currentPage - 1,
                  ),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <AcademicRecordModal
          students={students}
          form={form}
          formErrors={formErrors}
          modalError={modalError}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onFieldChange={updateFormField}
        />
      )}
    </div>
  );
}

interface AcademicRecordModalProps {
  students: AdminStudent[];
  form: AcademicRecordFormState;
  formErrors: Partial<
    Record<keyof AcademicRecordFormState, string>
  >;
  modalError: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  onFieldChange: (
    field: keyof AcademicRecordFormState,
    value: string,
  ) => void;
}

function AcademicRecordModal({
  students,
  form,
  formErrors,
  modalError,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
}: AcademicRecordModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="academic-record-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2
              id="academic-record-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              Add Academic Record
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the student academic performance
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <FiX size={21} />
          </button>
        </div>

        <form
          onSubmit={(event) =>
            void onSubmit(event)
          }
          className="p-6"
        >
          {modalError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Student"
                required
                error={formErrors.studentId}
              >
                <select
                  value={form.studentId}
                  onChange={(event) =>
                    onFieldChange(
                      "studentId",
                      event.target.value,
                    )
                  }
                  disabled={submitting}
                  className={getInputClass(
                    Boolean(
                      formErrors.studentId,
                    ),
                  )}
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.full_name} —{" "}
                      {student.roll_number} —{" "}
                      {student.department}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Semester"
              required
              error={formErrors.semester}
            >
              <select
                value={form.semester}
                onChange={(event) =>
                  onFieldChange(
                    "semester",
                    event.target.value,
                  )
                }
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.semester),
                )}
              >
                <option value="">
                  Select semester
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
            </FormField>

            <FormField
              label="Gender"
              required
              error={formErrors.gender}
            >
              <select
                value={form.gender}
                onChange={(event) =>
                  onFieldChange(
                    "gender",
                    event.target.value,
                  )
                }
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.gender),
                )}
              >
                <option value="">
                  Select gender
                </option>
                <option value="Male">
                  Male
                </option>
                <option value="Female">
                  Female
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </FormField>

            <FormField
              label="Attendance (%)"
              required
              error={formErrors.attendance}
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.attendance}
                onChange={(event) =>
                  onFieldChange(
                    "attendance",
                    event.target.value,
                  )
                }
                placeholder="Example: 85"
                disabled={submitting}
                className={getInputClass(
                  Boolean(
                    formErrors.attendance,
                  ),
                )}
              />
            </FormField>

            <FormField
              label="Internal Marks"
              required
              error={formErrors.internalMarks}
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.internalMarks}
                onChange={(event) =>
                  onFieldChange(
                    "internalMarks",
                    event.target.value,
                  )
                }
                placeholder="Example: 75"
                disabled={submitting}
                className={getInputClass(
                  Boolean(
                    formErrors.internalMarks,
                  ),
                )}
              />
            </FormField>

            <FormField
              label="Assignment Score"
              required
              error={
                formErrors.assignmentScore
              }
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.assignmentScore}
                onChange={(event) =>
                  onFieldChange(
                    "assignmentScore",
                    event.target.value,
                  )
                }
                placeholder="Example: 80"
                disabled={submitting}
                className={getInputClass(
                  Boolean(
                    formErrors.assignmentScore,
                  ),
                )}
              />
            </FormField>

            <FormField
              label="Quiz Score"
              required
              error={formErrors.quizScore}
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.quizScore}
                onChange={(event) =>
                  onFieldChange(
                    "quizScore",
                    event.target.value,
                  )
                }
                placeholder="Example: 70"
                disabled={submitting}
                className={getInputClass(
                  Boolean(
                    formErrors.quizScore,
                  ),
                )}
              />
            </FormField>

            <FormField
              label="Previous GPA"
              required
              error={formErrors.previousGpa}
            >
              <input
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={form.previousGpa}
                onChange={(event) =>
                  onFieldChange(
                    "previousGpa",
                    event.target.value,
                  )
                }
                placeholder="Example: 3.25"
                disabled={submitting}
                className={getInputClass(
                  Boolean(
                    formErrors.previousGpa,
                  ),
                )}
              />
            </FormField>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
              )}

              {submitting
                ? "Saving..."
                : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
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

interface TableHeaderProps {
  children: ReactNode;
}

function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
}

function TableCell({
  children,
}: TableCellProps) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
      {children}
    </td>
  );
}

function validatePercentage(
  value: string,
  label: string,
  field:
    | "attendance"
    | "internalMarks"
    | "assignmentScore"
    | "quizScore",
  errors: Partial<
    Record<keyof AcademicRecordFormState, string>
  >,
) {
  if (!value.trim()) {
    errors[field] = `${label} is required.`;
    return;
  }

  const numericValue = Number(value);

  if (
    Number.isNaN(numericValue) ||
    numericValue < 0 ||
    numericValue > 100
  ) {
    errors[field] =
      `${label} must be between 0 and 100.`;
  }
}

function getInputClass(hasError: boolean): string {
  return [
    "w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}

function formatScore(
  value: number,
  suffix = "",
): string {
  return `${Number(value).toFixed(2)}${suffix}`;
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

    if (error.response?.status === 400) {
      return "An academic record already exists for this student and semester.";
    }

    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to manage academic records.";
    }

    if (error.response?.status === 404) {
      return "The selected student was not found.";
    }

    if (error.response?.status === 422) {
      return "Please check all required fields and enter valid values.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default AdminAcademicRecordsPage;