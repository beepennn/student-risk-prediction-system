import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  getStudentNotifications,
  markAllStudentNotificationsAsRead,
  markStudentNotificationAsRead,
} from "../services/studentNotificationsService";

import type {
  StudentNotification,
} from "../types/studentNotifications";


type ReadFilter =
  | "all"
  | "unread"
  | "read";


function StudentNotificationsPage() {
  const { token } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState<StudentNotification[]>([]);

  const [search, setSearch] =
    useState("");

  const [readFilter, setReadFilter] =
    useState<ReadFilter>("all");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    updatingNotificationId,
    setUpdatingNotificationId,
  ] = useState<number | null>(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const fetchNotifications =
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
          await getStudentNotifications(
            token,
          );

        setNotifications(
          [...data].sort(
            (
              firstNotification,
              secondNotification,
            ) =>
              new Date(
                secondNotification.created_at,
              ).getTime()
              - new Date(
                firstNotification.created_at,
              ).getTime(),
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load notifications:",
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
    void fetchNotifications();
  }, [fetchNotifications]);

  const notificationTypes =
    useMemo(() => {
      return Array.from(
        new Set(
          notifications
            .map(
              (notification) =>
                notification
                  .notification_type,
            )
            .filter(Boolean),
        ),
      );
    }, [notifications]);

  const filteredNotifications =
    useMemo(() => {
      const normalisedSearch =
        search.trim().toLowerCase();

      return notifications.filter(
        (notification) => {
          const matchesSearch =
            !normalisedSearch
            || notification.title
              .toLowerCase()
              .includes(normalisedSearch)
            || notification.message
              .toLowerCase()
              .includes(normalisedSearch);

          const matchesReadStatus =
            readFilter === "all"
            || (
              readFilter === "read"
              && notification.is_read
            )
            || (
              readFilter === "unread"
              && !notification.is_read
            );

          const matchesType =
            !typeFilter
            || notification
              .notification_type
              .toLowerCase()
              === typeFilter.toLowerCase();

          return (
            matchesSearch
            && matchesReadStatus
            && matchesType
          );
        },
      );
    }, [
      notifications,
      search,
      readFilter,
      typeFilter,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length;

  async function handleMarkAsRead(
    notificationId: number,
  ) {
    if (!token) {
      return;
    }

    try {
      setUpdatingNotificationId(
        notificationId,
      );

      await markStudentNotificationAsRead(
        token,
        notificationId,
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) =>
              notification.id
                === notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification,
          ),
      );
    } catch (requestError) {
      console.error(
        "Failed to mark notification as read:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setUpdatingNotificationId(null);
    }
  }

  async function handleMarkAllAsRead() {
    if (!token || unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);
      setError("");

      await markAllStudentNotificationsAsRead(
        token,
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            }),
          ),
      );
    } catch (requestError) {
      console.error(
        "Failed to mark all notifications as read:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setMarkingAll(false);
    }
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
            View updates about your predictions
            and academic recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void handleMarkAllAsRead()
          }
          disabled={
            markingAll
            || unreadCount === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiCheckCircle />

          {markingAll
            ? "Updating..."
            : "Mark All as Read"}
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total"
          value={notifications.length}
        />

        <SummaryCard
          title="Unread"
          value={unreadCount}
        />

        <SummaryCard
          title="Read"
          value={
            notifications.length
            - unreadCount
          }
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
              placeholder="Search notifications..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={readFilter}
            onChange={(event) =>
              setReadFilter(
                event.target
                  .value as ReadFilter,
              )
            }
            className={getInputClass()}
          >
            <option value="all">
              All notifications
            </option>

            <option value="unread">
              Unread
            </option>

            <option value="read">
              Read
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value,
              )
            }
            className={getInputClass()}
          >
            <option value="">
              All types
            </option>

            {notificationTypes.map(
              (notificationType) => (
                <option
                  key={notificationType}
                  value={notificationType}
                >
                  {notificationType}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      {error && (
        <ErrorState
          message={error}
          onRetry={() =>
            void fetchNotifications()
          }
        />
      )}

      {!error && loading && (
        <LoadingState />
      )}

      {!error
        && !loading
        && filteredNotifications.length
          === 0 && (
        <EmptyState
          hasFilters={
            Boolean(search)
            || readFilter !== "all"
            || Boolean(typeFilter)
          }
        />
      )}

      {!error
        && !loading
        && filteredNotifications.length
          > 0 && (
        <section className="space-y-4">
          {filteredNotifications.map(
            (notification) => (
              <NotificationCard
                key={notification.id}
                notification={
                  notification
                }
                updating={
                  updatingNotificationId
                  === notification.id
                }
                onMarkAsRead={
                  handleMarkAsRead
                }
              />
            ),
          )}
        </section>
      )}
    </div>
  );
}


function NotificationCard({
  notification,
  updating,
  onMarkAsRead,
}: {
  notification: StudentNotification;
  updating: boolean;
  onMarkAsRead: (
    notificationId: number,
  ) => Promise<void>;
}) {
  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        notification.is_read
          ? "border-gray-200 bg-white"
          : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              notification.is_read
                ? "bg-gray-100 text-gray-500"
                : "bg-blue-600 text-white"
            }`}
          >
            <FiBell size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-gray-900">
                {notification.title}
              </h2>

              {!notification.is_read && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                  New
                </span>
              )}
            </div>

            <p className="mt-2 leading-7 text-gray-700">
              {notification.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                {
                  notification
                    .notification_type
                }
              </span>

              <span>
                {formatDate(
                  notification.created_at,
                )}
              </span>
            </div>
          </div>
        </div>

        {!notification.is_read && (
          <button
            type="button"
            onClick={() =>
              void onMarkAsRead(
                notification.id,
              )
            }
            disabled={updating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            <FiCheck />

            {updating
              ? "Updating..."
              : "Mark as Read"}
          </button>
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
      <p className="text-sm text-gray-500">
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
        Loading notifications...
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
      <FiBell
        size={46}
        className="mx-auto text-gray-300"
      />

      <p className="mt-4 font-medium text-gray-700">
        {hasFilters
          ? "No notifications match your filters."
          : "You do not have any notifications yet."}
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
      error.response?.status === 401
    ) {
      return (
        "Your session has expired. "
        + "Please log in again."
      );
    }

    if (
      error.response?.status === 404
    ) {
      return (
        "No notifications are available."
      );
    }

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }
  }

  return "Failed to load notifications.";
}


export default StudentNotificationsPage;