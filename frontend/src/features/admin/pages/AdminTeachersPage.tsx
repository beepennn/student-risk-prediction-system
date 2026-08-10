import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAdminTeacher,
  deleteAdminTeacher,
  getAdminTeachers,
  updateAdminTeacher,
} from "../services/teacherManagementService";

import type {
  AdminTeacher,
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "../types/teacherManagement";


interface TeacherFormState {
  full_name: string;
  email: string;
  password: string;
  is_active: boolean;
}


interface TeacherFormErrors {
  full_name?: string;
  email?: string;
  password?: string;
}


const EMPTY_FORM: TeacherFormState = {
  full_name: "",
  email: "",
  password: "",
  is_active: true,
};


function AdminTeachersPage() {
  const { token } = useAuth();

  const [teachers, setTeachers] = useState<
    AdminTeacher[]
  >([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingTeacher, setEditingTeacher] =
    useState<AdminTeacher | null>(null);

  const [form, setForm] =
    useState<TeacherFormState>(
      EMPTY_FORM,
    );

  const [formErrors, setFormErrors] =
    useState<TeacherFormErrors>({});


  const fetchTeachers =
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

        const teacherData =
          await getAdminTeachers(token);

        setTeachers(teacherData);
      } catch (requestError) {
        console.error(
          "Failed to load teachers:",
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
    void fetchTeachers();
  }, [fetchTeachers]);


  const filteredTeachers =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return teachers;
      }

      return teachers.filter(
        (teacher) =>
          teacher.full_name
            .toLowerCase()
            .includes(
              normalizedSearch,
            )
          || teacher.email
            .toLowerCase()
            .includes(
              normalizedSearch,
            )
          || (
            teacher.is_active
              ? "active"
              : "inactive"
          ).includes(
            normalizedSearch,
          ),
      );
    }, [searchTerm, teachers]);


  const statistics = useMemo(
    () => {
      const active =
        teachers.filter(
          (teacher) =>
            teacher.is_active,
        ).length;

      return {
        total: teachers.length,
        active,
        inactive:
          teachers.length - active,
      };
    },
    [teachers],
  );


  function openCreateModal() {
    setEditingTeacher(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setError("");
    setModalOpen(true);
  }


  function openEditModal(
    teacher: AdminTeacher,
  ) {
    setEditingTeacher(teacher);

    setForm({
      full_name: teacher.full_name,
      email: teacher.email,
      password: "",
      is_active:
        teacher.is_active,
    });

    setFormErrors({});
    setError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingTeacher(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }


  function validateForm(): boolean {
    const errors:
      TeacherFormErrors = {};

    const fullName =
      form.full_name.trim();

    const email =
      form.email.trim();

    if (!fullName) {
      errors.full_name =
        "Teacher name is required.";
    } else if (
      fullName.length < 2
    ) {
      errors.full_name =
        "Teacher name is too short.";
    }

    if (!email) {
      errors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      errors.email =
        "Enter a valid email address.";
    }

    if (
      !editingTeacher
      && !form.password
    ) {
      errors.password =
        "Password is required.";
    } else if (
      !editingTeacher
      && form.password.length < 6
    ) {
      errors.password =
        "Password must contain at least 6 characters.";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setError(
        "You are not authenticated.",
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingTeacher) {
        const payload:
          UpdateTeacherPayload = {
            full_name:
              form.full_name.trim(),
            email:
              form.email
                .trim()
                .toLowerCase(),
            is_active:
              form.is_active,
          };

        await updateAdminTeacher(
          token,
          editingTeacher.id,
          payload,
        );

        setSuccessMessage(
          "Teacher updated successfully.",
        );
      } else {
        const payload:
          CreateTeacherPayload = {
            full_name:
              form.full_name.trim(),
            email:
              form.email
                .trim()
                .toLowerCase(),
            password:
              form.password,
            is_active:
              form.is_active,
          };

        await createAdminTeacher(
          token,
          payload,
        );

        setSuccessMessage(
          "Teacher account created successfully.",
        );
      }

      closeModal();
      await fetchTeachers();
    } catch (requestError) {
      console.error(
        "Failed to save teacher:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(
    teacher: AdminTeacher,
  ) {
    if (!token) {
      setError(
        "You are not authenticated.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete teacher "${teacher.full_name}"?\n\nThis action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(teacher.id);
      setError("");
      setSuccessMessage("");

      await deleteAdminTeacher(
        token,
        teacher.id,
      );

      setSuccessMessage(
        "Teacher deleted successfully.",
      );

      await fetchTeachers();
    } catch (requestError) {
      console.error(
        "Failed to delete teacher:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setDeletingId(null);
    }
  }


  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiUserCheck
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Teacher Management
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Create, update, activate and
            remove teacher accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <FiPlus />
          Add Teacher
        </button>
      </header>

      {successMessage && (
        <AlertMessage
          type="success"
          message={successMessage}
          onClose={() =>
            setSuccessMessage("")
          }
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() =>
            setError("")
          }
        />
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Teachers"
          value={statistics.total}
          icon={
            <FiUsers size={24} />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Active Teachers"
          value={statistics.active}
          icon={
            <FiCheckCircle
              size={24}
            />
          }
          iconClassName="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Inactive Teachers"
          value={statistics.inactive}
          icon={
            <FiXCircle size={24} />
          }
          iconClassName="bg-red-50 text-red-600"
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search teacher by name, email or status..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void fetchTeachers()
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState />
        ) : filteredTeachers.length ===
          0 ? (
          <EmptyState
            hasTeachers={
              teachers.length > 0
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>
                    Teacher
                  </TableHeader>

                  <TableHeader>
                    Email
                  </TableHeader>

                  <TableHeader>
                    Role
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map(
                  (teacher) => (
                    <tr
                      key={teacher.id}
                      className="transition hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {getInitials(
                              teacher.full_name,
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {
                                teacher.full_name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              ID:{" "}
                              {teacher.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {teacher.email}
                      </TableCell>

                      <TableCell>
                        {teacher.role
                          ?? "Teacher"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            teacher.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {teacher.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                teacher,
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit teacher"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId
                              === teacher.id
                            }
                            onClick={() =>
                              void handleDelete(
                                teacher,
                              )
                            }
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            title="Delete teacher"
                          >
                            {deletingId
                              === teacher.id ? (
                              <Spinner />
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

        {!loading && (
          <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
            Showing{" "}
            {filteredTeachers.length} of{" "}
            {teachers.length} teacher
            {teachers.length === 1
              ? ""
              : "s"}
          </div>
        )}
      </section>

      {modalOpen && (
        <TeacherFormModal
          editingTeacher={
            editingTeacher
          }
          form={form}
          errors={formErrors}
          saving={saving}
          onChange={(
            field,
            value,
          ) =>
            setForm(
              (currentForm) => ({
                ...currentForm,
                [field]: value,
              }),
            )
          }
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}


interface TeacherFormModalProps {
  editingTeacher:
    AdminTeacher | null;

  form: TeacherFormState;
  errors: TeacherFormErrors;
  saving: boolean;

  onChange: <
    Field extends
      keyof TeacherFormState,
  >(
    field: Field,
    value:
      TeacherFormState[Field],
  ) => void;

  onClose: () => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}


function TeacherFormModal({
  editingTeacher,
  form,
  errors,
  saving,
  onChange,
  onClose,
  onSubmit,
}: TeacherFormModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTeacher
                ? "Edit Teacher"
                : "Add Teacher"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingTeacher
                ? "Update the teacher account information."
                : "Create a new teacher login account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <FiX size={21} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <FormField
            label="Full Name"
            required
            error={
              errors.full_name
            }
          >
            <input
              type="text"
              value={form.full_name}
              onChange={(event) =>
                onChange(
                  "full_name",
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="Enter teacher name"
              className={getInputClass(
                Boolean(
                  errors.full_name,
                ),
              )}
            />
          </FormField>

          <FormField
            label="Email Address"
            required
            error={errors.email}
          >
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                onChange(
                  "email",
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="teacher@example.com"
              className={getInputClass(
                Boolean(
                  errors.email,
                ),
              )}
            />
          </FormField>

          {!editingTeacher && (
            <FormField
              label="Temporary Password"
              required
              error={errors.password}
            >
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  onChange(
                    "password",
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Minimum 6 characters"
                className={getInputClass(
                  Boolean(
                    errors.password,
                  ),
                )}
              />

              <p className="mt-2 text-xs text-gray-500">
                The teacher can use this
                password for their first
                login.
              </p>
            </FormField>
          )}

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">
                Active Account
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Inactive teachers cannot
                access the system.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                onChange(
                  "is_active",
                  event.target.checked,
                )
              }
              disabled={saving}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Spinner />}

              {saving
                ? "Saving..."
                : editingTeacher
                  ? "Update Teacher"
                  : "Add Teacher"}
            </button>
          </div>
        </form>
      </div>
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
  children: React.ReactNode;
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
        <span className="mt-2 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}


function SummaryCard({
  title,
  value,
  icon,
  iconClassName,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${iconClassName}`}
        >
          {icon}
        </div>
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


function LoadingState() {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

      <p className="mt-4 text-gray-500">
        Loading teachers...
      </p>
    </div>
  );
}


function EmptyState({
  hasTeachers,
  onCreate,
}: {
  hasTeachers: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="p-12 text-center">
      <FiUsers
        size={48}
        className="mx-auto text-gray-300"
      />

      <p className="mt-4 font-semibold text-gray-700">
        {hasTeachers
          ? "No matching teachers"
          : "No teachers found"}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {hasTeachers
          ? "Try another search value."
          : "Create the first teacher account."}
      </p>

      {!hasTeachers && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          <FiPlus />
          Add Teacher
        </button>
      )}
    </div>
  );
}


function Spinner() {
  return (
    <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}


function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
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
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}


function getInitials(
  fullName: string,
): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");

  return initials || "T";
}


function getInputClass(
  hasError: boolean,
): string {
  return [
    "w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition disabled:bg-gray-100",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
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

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object"
            && item !== null
            && "msg" in item
            && typeof item.msg
              === "string"
          ) {
            return item.msg;
          }

          return "Validation error";
        })
        .join(", ");
    }

    if (
      error.response?.status === 401
    ) {
      return "Your session has expired. Please log in again.";
    }

    if (
      error.response?.status === 403
    ) {
      return "Only administrators can manage teachers.";
    }

    if (
      error.response?.status === 404
    ) {
      return "Teacher not found.";
    }

    if (
      error.response?.status === 400
    ) {
      return "The email may already be registered.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}


export default AdminTeachersPage;