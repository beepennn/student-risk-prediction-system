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
  FiBell,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAdminNotification,
  deleteAdminNotification,
  getAdminNotifications,
  markAdminNotificationAsSent,
} from "../services/notificationManagementService";

import { getAdminStudents } from "../services/studentManagementService";

import type {
  AdminNotification,
  Notification,
  NotificationPayload,
} from "../types/notificationManagement";

import type { AdminStudent } from "../types/studentManagement";

const PAGE_SIZE = 10;

interface NotificationFormState {
  studentId: string;
  title: string;
  message: string;
  notificationType: string;
}

const emptyForm: NotificationFormState = {
  studentId: "",
  title: "",
  message: "",
  notificationType: "in_app",
};

function AdminNotificationsPage() {
  const { token } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [students, setStudents] = useState<
    AdminStudent[]
  >([]);

  const [searchInput, setSearchInput] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [sentFilter, setSentFilter] =
    useState("");

  const [readFilter, setReadFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [sendingId, setSendingId] = useState<
    number | null
  >(null);

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

  const [form, setForm] =
    useState<NotificationFormState>(emptyForm);

  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<
        keyof NotificationFormState,
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

      const [notificationData, studentData] =
        await Promise.all([
          getAdminNotifications(token),

          getAdminStudents(token, {
            skip: 0,
            limit: 1000,
          }),
        ]);

      setNotifications(notificationData);
      setStudents(studentData);
    } catch (requestError) {
      console.error(
        "Failed to load notifications:",
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

  const combinedNotifications =
    useMemo<AdminNotification[]>(() => {
      return notifications.map(
        (notification) => {
          const student = studentsById.get(
            notification.student_id,
          );

          return {
            ...notification,

            student_name:
              student?.full_name ??
              "Unknown Student",

            roll_number:
              student?.roll_number ?? "N/A",

            department:
              student?.department ?? "N/A",

            semester:
              student?.semester ?? 0,
          };
        },
      );
    }, [notifications, studentsById]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch =
      searchInput.trim().toLowerCase();

    return combinedNotifications.filter(
      (notification) => {
        const matchesSearch =
          !normalizedSearch ||
          notification.student_name
            .toLowerCase()
            .includes(normalizedSearch) ||
          notification.roll_number
            .toLowerCase()
            .includes(normalizedSearch) ||
          notification.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          notification.message
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesType =
          !typeFilter ||
          notification.notification_type ===
            typeFilter;

        const matchesSent =
          !sentFilter ||
          String(notification.is_sent) ===
            sentFilter;

        const matchesRead =
          !readFilter ||
          String(notification.is_read) ===
            readFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesSent &&
          matchesRead
        );
      },
    );
  }, [
    combinedNotifications,
    searchInput,
    typeFilter,
    sentFilter,
    readFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNotifications.length / PAGE_SIZE,
    ),
  );

  const paginatedNotifications = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return filteredNotifications.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredNotifications, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const statistics = useMemo(() => {
    return combinedNotifications.reduce(
      (result, notification) => {
        result.total += 1;

        if (notification.is_sent) {
          result.sent += 1;
        } else {
          result.unsent += 1;
        }

        if (!notification.is_read) {
          result.unread += 1;
        }

        return result;
      },
      {
        total: 0,
        sent: 0,
        unsent: 0,
        unread: 0,
      },
    );
  }, [combinedNotifications]);

  function openModal() {
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
    field: keyof NotificationFormState,
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
        keyof NotificationFormState,
        string
      >
    > = {};

    if (!form.studentId) {
      errors.studentId =
        "Please select a student.";
    }

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    }

    if (!form.message.trim()) {
      errors.message = "Message is required.";
    }

    if (!form.notificationType) {
      errors.notificationType =
        "Notification type is required.";
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

      const payload: NotificationPayload = {
        student_id: Number(form.studentId),
        title: form.title.trim(),
        message: form.message.trim(),
        notification_type:
          form.notificationType,
        is_sent: false,
      };

      await createAdminNotification(
        token,
        payload,
      );

      setSuccessMessage(
        "Notification created successfully.",
      );

      closeModal();
      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to create notification:",
        requestError,
      );

      setModalError(
        getErrorMessage(requestError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkAsSent(
    notification: AdminNotification,
  ) {
    if (!token || notification.is_sent) {
      return;
    }

    try {
      setSendingId(notification.id);
      setError("");
      setSuccessMessage("");

      await markAdminNotificationAsSent(
        token,
        notification.id,
      );

      setSuccessMessage(
        "Notification marked as sent.",
      );

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to mark notification as sent:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setSendingId(null);
    }
  }

  async function handleDelete(
    notification: AdminNotification,
  ) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the notification "${notification.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(notification.id);
      setError("");
      setSuccessMessage("");

      await deleteAdminNotification(
        token,
        notification.id,
      );

      setSuccessMessage(
        "Notification deleted successfully.",
      );

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to delete notification:",
        requestError,
      );

      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setSearchInput("");
    setTypeFilter("");
    setSentFilter("");
    setReadFilter("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiBell
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Create and manage student risk
            notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <FiPlus />
          Add Notification
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
          label="Sent"
          value={statistics.sent}
          className="bg-green-50 text-green-700"
        />

        <SummaryCard
          label="Not Sent"
          value={statistics.unsent}
          className="bg-yellow-50 text-yellow-700"
        />

        <SummaryCard
          label="Unread"
          value={statistics.unread}
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
              placeholder="Search notification or student..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">All types</option>
            <option value="in_app">
              In App
            </option>
            <option value="email">Email</option>
            <option value="alert">Alert</option>
          </select>

          <select
            value={sentFilter}
            onChange={(event) => {
              setSentFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">
              All delivery statuses
            </option>
            <option value="true">Sent</option>
            <option value="false">
              Not Sent
            </option>
          </select>

          <select
            value={readFilter}
            onChange={(event) => {
              setReadFilter(event.target.value);
              setPage(1);
            }}
            className={getInputClass(false)}
          >
            <option value="">
              All read statuses
            </option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 disabled:opacity-50"
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
            className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <LoadingState text="Loading notifications..." />
        ) : paginatedNotifications.length ===
          0 ? (
          <EmptyState
            title="No notifications found"
            description="Create a notification or generate a prediction."
            action="Add Notification"
            onAction={openModal}
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
                    Notification
                  </TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Sent</TableHeader>
                  <TableHeader>Read</TableHeader>
                  <TableHeader>Created</TableHeader>
                  <TableHeader
                    align="right"
                  >
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedNotifications.map(
                  (notification) => (
                    <tr
                      key={notification.id}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <p className="font-medium text-gray-900">
                          {
                            notification.student_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            notification.roll_number
                          }
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {
                          notification.notification_type
                        }
                      </TableCell>

                      <TableCell>
                        <BooleanBadge
                          value={
                            notification.is_sent
                          }
                          trueText="Sent"
                          falseText="Not Sent"
                        />
                      </TableCell>

                      <TableCell>
                        <BooleanBadge
                          value={
                            notification.is_read
                          }
                          trueText="Read"
                          falseText="Unread"
                        />
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          notification.created_at,
                        )}
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleMarkAsSent(
                                notification,
                              )
                            }
                            disabled={
                              notification.is_sent ||
                              sendingId ===
                                notification.id
                            }
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-40"
                            title="Mark as sent"
                          >
                            {notification.is_sent ? (
                              <FiCheck />
                            ) : (
                              <FiSend />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                notification,
                              )
                            }
                            disabled={
                              deletingId ===
                              notification.id
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete notification"
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
            filteredNotifications.length
          }
          label="notifications"
          loading={loading}
          onPageChange={setPage}
        />
      </section>

      {isModalOpen && (
        <NotificationModal
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

function NotificationModal({
  students,
  form,
  formErrors,
  modalError,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
}: {
  students: AdminStudent[];
  form: NotificationFormState;
  formErrors: Partial<
    Record<
      keyof NotificationFormState,
      string
    >
  >;
  modalError: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  onFieldChange: (
    field: keyof NotificationFormState,
    value: string,
  ) => void;
}) {
  return (
    <ModalContainer>
      <ModalHeader
        title="Add Notification"
        description="Create a notification for a selected student."
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
              Boolean(formErrors.studentId),
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
                {student.roll_number}
              </option>
            ))}
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
            placeholder="Notification title"
            className={getInputClass(
              Boolean(formErrors.title),
            )}
          />
        </FormField>

        <FormField
          label="Message"
          required
          error={formErrors.message}
        >
          <textarea
            rows={5}
            value={form.message}
            onChange={(event) =>
              onFieldChange(
                "message",
                event.target.value,
              )
            }
            disabled={submitting}
            placeholder="Enter the notification message."
            className={getInputClass(
              Boolean(formErrors.message),
            )}
          />
        </FormField>

        <FormField
          label="Notification Type"
          required
          error={
            formErrors.notificationType
          }
        >
          <select
            value={form.notificationType}
            onChange={(event) =>
              onFieldChange(
                "notificationType",
                event.target.value,
              )
            }
            disabled={submitting}
            className={getInputClass(
              Boolean(
                formErrors.notificationType,
              ),
            )}
          >
            <option value="in_app">
              In App
            </option>
            <option value="email">Email</option>
            <option value="alert">Alert</option>
          </select>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : "Create Notification"}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
}

function BooleanBadge({
  value,
  trueText,
  falseText,
}: {
  value: boolean;
  trueText: string;
  falseText: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        value
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {value ? trueText : falseText}
    </span>
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
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
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
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
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
      <FiBell
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

function formatDate(date: string): string {
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
      return "You do not have permission to manage notifications.";
    }

    if (error.response?.status === 404) {
      return "The selected student or notification was not found.";
    }

    if (!error.response) {
      return "Cannot connect to the backend server.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default AdminNotificationsPage;