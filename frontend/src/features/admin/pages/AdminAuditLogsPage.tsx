import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiEdit,
  FiPlusCircle,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import {
  getAdminAuditLogs,
} from "../services/adminAuditLogsService";

import type {
  AdminAuditLog,
  AuditActionFilter,
} from "../types/adminAuditLogs";


function AdminAuditLogsPage() {
  const { token } = useAuth();

  const [logs, setLogs] = useState<
    AdminAuditLog[]
  >([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState<AuditActionFilter>("All");

  const [entityFilter, setEntityFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const fetchAuditLogs =
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
          await getAdminAuditLogs(
            token,
            {
              skip: 0,
              limit: 300,
              sort_by: "created_at",
              order: "desc",
            },
          );

        setLogs(data);
      } catch (requestError) {
        console.error(
          "Audit log loading failed:",
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
    void fetchAuditLogs();
  }, [fetchAuditLogs]);


  const entityOptions = useMemo(
    () => {
      return Array.from(
        new Set(
          logs
            .map((log) => log.entity)
            .filter(Boolean),
        ),
      ).sort();
    },
    [logs],
  );


  const filteredLogs = useMemo(
    () => {
      const searchValue =
        searchTerm
          .trim()
          .toLowerCase();

      return logs.filter((log) => {
        const actionMatches =
          actionFilter === "All"
          || log.action
            .toUpperCase()
            === actionFilter;

        const entityMatches =
          entityFilter === "All"
          || log.entity
            === entityFilter;

        const searchMatches =
          !searchValue
          || log.action
            .toLowerCase()
            .includes(searchValue)
          || log.entity
            .toLowerCase()
            .includes(searchValue)
          || String(log.entity_id)
            .includes(searchValue)
          || String(log.user_id)
            .includes(searchValue)
          || (
            log.user_name
            ?? ""
          )
            .toLowerCase()
            .includes(searchValue)
          || (
            log.user_email
            ?? ""
          )
            .toLowerCase()
            .includes(searchValue);

        return (
          actionMatches
          && entityMatches
          && searchMatches
        );
      });
    },
    [
      actionFilter,
      entityFilter,
      logs,
      searchTerm,
    ],
  );


  const statistics = useMemo(
    () => {
      return {
        total: logs.length,

        created: logs.filter(
          (log) =>
            log.action.toUpperCase()
            === "CREATE",
        ).length,

        updated: logs.filter(
          (log) =>
            log.action.toUpperCase()
            === "UPDATE",
        ).length,

        deleted: logs.filter(
          (log) =>
            log.action.toUpperCase()
            === "DELETE",
        ).length,
      };
    },
    [logs],
  );


  if (loading) {
    return <LoadingState />;
  }


  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiClock
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Audit Logs
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Review administrative actions
            performed throughout the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void fetchAuditLogs()
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw />
          Refresh Logs
        </button>
      </header>


      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          <div className="flex gap-3">
            <FiAlertCircle
              size={20}
              className="mt-0.5"
            />

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}


      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Logs"
          value={statistics.total}
          icon={<FiActivity size={30} />}
        />

        <StatCard
          title="Create Actions"
          value={statistics.created}
          icon={<FiPlusCircle size={30} />}
        />

        <StatCard
          title="Update Actions"
          value={statistics.updated}
          icon={<FiEdit size={30} />}
        />

        <StatCard
          title="Delete Actions"
          value={statistics.deleted}
          icon={<FiTrash2 size={30} />}
        />
      </section>


      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search by user, action, entity or ID"
              className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(
                event.target
                  .value as AuditActionFilter,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Actions
            </option>

            <option value="CREATE">
              Create
            </option>

            <option value="UPDATE">
              Update
            </option>

            <option value="DELETE">
              Delete
            </option>
          </select>

          <select
            value={entityFilter}
            onChange={(event) =>
              setEntityFilter(
                event.target.value,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Entities
            </option>

            {entityOptions.map(
              (entity) => (
                <option
                  key={entity}
                  value={entity}
                >
                  {entity}
                </option>
              ),
            )}
          </select>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredLogs.length} of{" "}
          {logs.length} audit records.
        </p>
      </section>


      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FiClock
              size={48}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              No audit logs found
            </h2>

            <p className="mt-2 text-gray-500">
              No records match the selected
              search and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>
                    Log ID
                  </TableHeader>

                  <TableHeader>
                    User
                  </TableHeader>

                  <TableHeader>
                    Action
                  </TableHeader>

                  <TableHeader>
                    Entity
                  </TableHeader>

                  <TableHeader>
                    Entity ID
                  </TableHeader>

                  <TableHeader>
                    Date and Time
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(
                  (log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        #{log.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex min-w-52 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <FiUser />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {log.user_name
                                ?? `User #${log.user_id}`}
                            </p>

                            <p className="text-xs text-gray-500">
                              {log.user_email
                                ?? `ID: ${log.user_id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionClass(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800">
                        {formatEntity(
                          log.entity,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        #{log.entity_id}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(
                          log.created_at,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


function TableHeader({
  children,
}: {
  children: string;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}


function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-xl bg-white shadow-sm">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

        <p className="mt-4 text-gray-500">
          Loading audit logs...
        </p>
      </div>
    </div>
  );
}


function getActionClass(
  action: string,
): string {
  const normalizedAction =
    action.toUpperCase();

  if (normalizedAction === "CREATE") {
    return "bg-green-100 text-green-700";
  }

  if (normalizedAction === "UPDATE") {
    return "bg-blue-100 text-blue-700";
  }

  if (normalizedAction === "DELETE") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}


function formatEntity(
  entity: string,
): string {
  return entity
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "N/A";
  }

  return date.toLocaleString(
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

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }

    if (error.response.status === 403) {
      return (
        "Only administrators can "
        + "view audit logs."
      );
    }

    if (error.response.status >= 500) {
      return (
        "The backend could not "
        + "load the audit logs."
      );
    }
  }

  return "Failed to load audit logs.";
}


export default AdminAuditLogsPage;