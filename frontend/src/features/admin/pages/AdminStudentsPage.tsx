import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAdminStudent,
  deleteAdminStudent,
  getAdminStudents,
  updateAdminStudent,
} from "../services/studentManagementService";

import type {
  AdminStudent,
  CreateAdminStudentPayload,
  UpdateAdminStudentPayload,
} from "../types/studentManagement";

const PAGE_SIZE = 10;
const CURRENT_YEAR = new Date().getFullYear();

interface StudentFormState {
  fullName: string;
  email: string;
  password: string;
  rollNumber: string;
  department: string;
  semester: string;
  phone: string;
  parentEmail: string;
  enrollmentYear: string;
  status: string;
}

const emptyForm: StudentFormState = {
  fullName: "",
  email: "",
  password: "",
  rollNumber: "",
  department: "",
  semester: "",
  phone: "",
  parentEmail: "",
  enrollmentYear: String(CURRENT_YEAR),
  status: "Active",
};

function AdminStudentsPage() {
  const { token } = useAuth();

  const [students, setStudents] = useState<AdminStudent[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(
    null,
  );

  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<AdminStudent | null>(null);

  const [form, setForm] =
    useState<StudentFormState>(emptyForm);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof StudentFormState, string>>
  >({});

  const fetchStudents = useCallback(
    async (requestedPage: number) => {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getAdminStudents(token, {
          skip: (requestedPage - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search || undefined,
          semester: semester
            ? Number(semester)
            : undefined,
          department: department.trim() || undefined,
        });

        setStudents(result);
      } catch (requestError) {
        console.error(
          "Failed to fetch students:",
          requestError,
        );

        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [token, search, semester, department],
  );

  useEffect(() => {
    void fetchStudents(page);
  }, [fetchStudents, page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  function openCreateModal() {
    setEditingStudent(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
    setIsModalOpen(true);
  }

  function openEditModal(student: AdminStudent) {
    setEditingStudent(student);

    setForm({
      fullName: student.full_name ?? "",
      email: student.email ?? "",
      password: "",
      rollNumber: student.roll_number ?? "",
      department: student.department ?? "",
      semester: String(student.semester ?? ""),
      phone: student.phone ?? "",
      parentEmail: student.parent_email ?? "",
      enrollmentYear: String(
        student.enrollment_year ?? CURRENT_YEAR,
      ),
      status: student.status ?? "Active",
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
    setEditingStudent(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalError("");
  }

  function updateFormField(
    field: keyof StudentFormState,
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
      Record<keyof StudentFormState, string>
    > = {};

    const trimmedFullName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedRollNumber = form.rollNumber.trim();
    const trimmedDepartment = form.department.trim();
    const trimmedParentEmail = form.parentEmail.trim();

    if (!trimmedFullName) {
      errors.fullName = "Full name is required.";
    } else if (trimmedFullName.length < 2) {
      errors.fullName =
        "Full name must contain at least 2 characters.";
    }

    if (!trimmedEmail) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!editingStudent) {
      if (!form.password) {
        errors.password =
          "Temporary password is required.";
      } else if (form.password.length < 6) {
        errors.password =
          "Password must contain at least 6 characters.";
      }
    }

    if (!trimmedRollNumber) {
      errors.rollNumber = "Roll number is required.";
    }

    if (!trimmedDepartment) {
      errors.department = "Department is required.";
    }

    if (!form.semester.trim()) {
      errors.semester = "Semester is required.";
    } else {
      const semesterNumber = Number(form.semester);

      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        errors.semester =
          "Semester must be between 1 and 8.";
      }
    }

    if (
      trimmedParentEmail &&
      !isValidEmail(trimmedParentEmail)
    ) {
      errors.parentEmail =
        "Enter a valid parent email address.";
    }

    if (!form.enrollmentYear.trim()) {
      errors.enrollmentYear =
        "Enrollment year is required.";
    } else {
      const enrollmentYear = Number(
        form.enrollmentYear,
      );

      if (
        !Number.isInteger(enrollmentYear) ||
        enrollmentYear < 2000 ||
        enrollmentYear > CURRENT_YEAR + 1
      ) {
        errors.enrollmentYear =
          "Enter a valid enrollment year.";
      }
    }

    if (!form.status.trim()) {
      errors.status = "Status is required.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setModalError("You are not authenticated.");
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

      if (editingStudent) {
        const updatePayload: UpdateAdminStudentPayload = {
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          roll_number: form.rollNumber.trim(),
          department: form.department.trim(),
          semester: Number(form.semester),
          phone: form.phone.trim() || null,
          parent_email:
            form.parentEmail.trim() || null,
          enrollment_year: Number(
            form.enrollmentYear,
          ),
          status: form.status,
        };

        await updateAdminStudent(
          token,
          editingStudent,
          updatePayload,
        );

        setSuccessMessage(
          "Student updated successfully.",
        );
      } else {
        const createPayload: CreateAdminStudentPayload = {
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          roll_number: form.rollNumber.trim(),
          department: form.department.trim(),
          semester: Number(form.semester),
          phone: form.phone.trim() || null,
          parent_email:
            form.parentEmail.trim() || null,
          enrollment_year: Number(
            form.enrollmentYear,
          ),
          status: form.status,
        };

        await createAdminStudent(
          token,
          createPayload,
        );

        setSuccessMessage(
          "Student account and profile created successfully.",
        );
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      setForm(emptyForm);
      setFormErrors({});
      setModalError("");

      setPage(1);
      await fetchStudents(1);
    } catch (requestError) {
      console.error(
        "Failed to save student:",
        requestError,
      );

      setModalError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    student: AdminStudent,
  ) {
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    const studentName =
      student.full_name ||
      student.roll_number ||
      "this student";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${studentName}? This will remove both the student profile and login account.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(student.id);
      setError("");
      setSuccessMessage("");

      await deleteAdminStudent(token, student);

      setSuccessMessage(
        "Student account and profile deleted successfully.",
      );

      if (students.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchStudents(page);
      }
    } catch (requestError) {
      console.error(
        "Failed to delete student:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setSemester("");
    setDepartment("");
    setPage(1);
  }

  const hasNextPage = students.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiUsers
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Student Management
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Create student accounts and manage student
            profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiPlus />
          Add Student
        </button>
      </header>

      {successMessage && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          <p>{successMessage}</p>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
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
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search students..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={semester}
            onChange={(event) => {
              setSemester(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All semesters</option>

            {Array.from({ length: 8 }, (_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                Semester {index + 1}
              </option>
            ))}
          </select>

          <input
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value);
              setPage(1);
            }}
            placeholder="Filter by department"
            className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                void fetchStudents(page)
              }
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
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
              Loading students...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers
              size={46}
              className="mx-auto text-gray-300"
            />

            <p className="mt-4 font-medium text-gray-700">
              No students found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Adjust the filters or add a new student.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              <FiPlus />
              Add Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Roll Number</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Semester</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.full_name ||
                            "Unknown Student"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {student.email || "No email"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {student.roll_number || "N/A"}
                    </TableCell>

                    <TableCell>
                      {student.department || "N/A"}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        Semester {student.semester}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          student.status,
                          student.is_active,
                        )}`}
                      >
                        {student.status ||
                          (student.is_active
                            ? "Active"
                            : "Inactive")}
                      </span>
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(student)
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          aria-label={`Edit ${student.full_name}`}
                          title="Edit student"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId === student.id
                          }
                          onClick={() =>
                            void handleDelete(student)
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${student.full_name}`}
                          title="Delete student"
                        >
                          {deletingId === student.id ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {page} · Showing {students.length}{" "}
            student
            {students.length === 1 ? "" : "s"}
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() =>
                setPage(
                  (currentPage) => currentPage + 1,
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
        <StudentModal
          editingStudent={editingStudent}
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

interface StudentModalProps {
  editingStudent: AdminStudent | null;
  form: StudentFormState;
  formErrors: Partial<
    Record<keyof StudentFormState, string>
  >;
  modalError: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  onFieldChange: (
    field: keyof StudentFormState,
    value: string,
  ) => void;
}

function StudentModal({
  editingStudent,
  form,
  formErrors,
  modalError,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
}: StudentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2
              id="student-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {editingStudent
                ? "Edit Student"
                : "Add Student"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingStudent
                ? "Update the student account and academic profile."
                : "Create a login account and student profile automatically."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <FiX size={21} />
          </button>
        </div>

        <form
          onSubmit={(event) => void onSubmit(event)}
          className="p-6"
        >
          {modalError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Full Name"
              required
              error={formErrors.fullName}
            >
              <input
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  onFieldChange(
                    "fullName",
                    event.target.value,
                  )
                }
                placeholder="Enter student's full name"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.fullName),
                )}
              />
            </FormField>

            <FormField
              label="Email"
              required
              error={formErrors.email}
            >
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  onFieldChange(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="student@example.com"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.email),
                )}
              />
            </FormField>

            {!editingStudent && (
              <FormField
                label="Temporary Password"
                required
                error={formErrors.password}
              >
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    onFieldChange(
                      "password",
                      event.target.value,
                    )
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={submitting}
                  className={getInputClass(
                    Boolean(formErrors.password),
                  )}
                />
              </FormField>
            )}

            <FormField
              label="Roll Number"
              required
              error={formErrors.rollNumber}
            >
              <input
                type="text"
                value={form.rollNumber}
                onChange={(event) =>
                  onFieldChange(
                    "rollNumber",
                    event.target.value,
                  )
                }
                placeholder="Example: SEC-BCT-001"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.rollNumber),
                )}
              />
            </FormField>

            <FormField
              label="Department"
              required
              error={formErrors.department}
            >
              <input
                type="text"
                value={form.department}
                onChange={(event) =>
                  onFieldChange(
                    "department",
                    event.target.value,
                  )
                }
                placeholder="Example: Computer Engineering"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.department),
                )}
              />
            </FormField>

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
              label="Enrollment Year"
              required
              error={formErrors.enrollmentYear}
            >
              <input
                type="number"
                min="2000"
                max={CURRENT_YEAR + 1}
                value={form.enrollmentYear}
                onChange={(event) =>
                  onFieldChange(
                    "enrollmentYear",
                    event.target.value,
                  )
                }
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.enrollmentYear),
                )}
              />
            </FormField>

            <FormField
              label="Status"
              required
              error={formErrors.status}
            >
              <select
                value={form.status}
                onChange={(event) =>
                  onFieldChange(
                    "status",
                    event.target.value,
                  )
                }
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.status),
                )}
              >
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
                <option value="Graduated">
                  Graduated
                </option>
                <option value="Suspended">
                  Suspended
                </option>
              </select>
            </FormField>

            <FormField
              label="Phone"
              error={formErrors.phone}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  onFieldChange(
                    "phone",
                    event.target.value,
                  )
                }
                placeholder="Student phone number"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.phone),
                )}
              />
            </FormField>

            <FormField
              label="Parent Email"
              error={formErrors.parentEmail}
            >
              <input
                type="email"
                value={form.parentEmail}
                onChange={(event) =>
                  onFieldChange(
                    "parentEmail",
                    event.target.value,
                  )
                }
                placeholder="parent@example.com"
                disabled={submitting}
                className={getInputClass(
                  Boolean(formErrors.parentEmail),
                )}
              />
            </FormField>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                : editingStudent
                  ? "Save Changes"
                  : "Create Student"}
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
          <span className="ml-1 text-red-500">*</span>
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
  align?: "left" | "right";
}

function TableHeader({
  children,
  align = "left",
}: TableHeaderProps) {
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

interface TableCellProps {
  children: ReactNode;
  align?: "left" | "right";
}

function TableCell({
  children,
  align = "left",
}: TableCellProps) {
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
    "w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getStatusClass(
  status: string | null | undefined,
  isActive: boolean,
): string {
  const normalisedStatus = (
    status || (isActive ? "Active" : "Inactive")
  ).toLowerCase();

  if (normalisedStatus === "active") {
    return "bg-green-100 text-green-700";
  }

  if (normalisedStatus === "graduated") {
    return "bg-blue-100 text-blue-700";
  }

  if (normalisedStatus === "suspended") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
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
      return "The submitted student information is invalid.";
    }

    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "The requested student was not found.";
    }

    if (error.response?.status === 409) {
      return "A user with this email or student roll number already exists.";
    }

    if (error.response?.status === 422) {
      return "Please check all required fields and enter valid information.";
    }

    if (error.response?.status === 500) {
      return "The server could not process the request.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default AdminStudentsPage;