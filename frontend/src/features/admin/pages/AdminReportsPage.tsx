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
  FiAlertCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import {
  downloadAdminCsv,
  getAdminReports,
  getRiskStudentReport,
} from "../services/adminReportsService";

import type {
  AdminReportsData,
  ExportReportType,
  ReportRiskLevel,
  RiskStudentReport,
} from "../types/adminReports";


const emptyReports: AdminReportsData = {
  summary: {
    total_students: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
  },

  departments: [],
  semesters: [],
  latestPredictions: [],

  interventionSummary: {
    total_interventions: 0,
  },
};


function AdminReportsPage() {
  const { token } = useAuth();

  const [reports, setReports] =
    useState<AdminReportsData>(
      emptyReports,
    );

  const [selectedRisk, setSelectedRisk] =
    useState<ReportRiskLevel>(
      "High Risk",
    );

  const [riskStudents, setRiskStudents] =
    useState<RiskStudentReport[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [riskLoading, setRiskLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    downloadingReport,
    setDownloadingReport,
  ] = useState<ExportReportType | null>(
    null,
  );


  const fetchReports =
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
          await getAdminReports(token);

        setReports(data);
      } catch (requestError) {
        console.error(
          "Failed to load reports:",
          requestError,
        );

        setError(
          getErrorMessage(requestError),
        );
      } finally {
        setLoading(false);
      }
    }, [token]);


  const fetchRiskStudents =
    useCallback(async () => {
      if (!token) {
        return;
      }

      try {
        setRiskLoading(true);

        const data =
          await getRiskStudentReport(
            token,
            selectedRisk,
          );

        setRiskStudents(data);
      } catch (requestError) {
        console.error(
          "Failed to load risk report:",
          requestError,
        );

        setError(
          getErrorMessage(requestError),
        );
      } finally {
        setRiskLoading(false);
      }
    }, [selectedRisk, token]);


  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);


  useEffect(() => {
    void fetchRiskStudents();
  }, [fetchRiskStudents]);


  const maximumDepartmentTotal =
    useMemo(
      () =>
        Math.max(
          ...reports.departments.map(
            (department) =>
              department.total_students,
          ),
          1,
        ),
      [reports.departments],
    );


  const maximumSemesterTotal =
    useMemo(
      () =>
        Math.max(
          ...reports.semesters.map(
            (semester) =>
              semester.total_students,
          ),
          1,
        ),
      [reports.semesters],
    );


  async function handleDownload(
    reportType: ExportReportType,
  ) {
    if (!token) {
      return;
    }

    try {
      setDownloadingReport(reportType);
      setError("");

      await downloadAdminCsv(
        token,
        reportType,
      );
    } catch (requestError) {
      console.error(
        "CSV export failed:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setDownloadingReport(null);
    }
  }


  if (loading) {
    return <LoadingState />;
  }


  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiFileText
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Reports and Export
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Review system statistics and
            download administrative CSV files.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void fetchReports();
            void fetchRiskStudents();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw />
          Refresh Reports
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


      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Students"
          value={
            reports.summary.total_students
          }
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="High Risk"
          value={
            reports.summary.high_risk
          }
          icon={
            <FiAlertTriangle size={30} />
          }
        />

        <StatCard
          title="Medium Risk"
          value={
            reports.summary.medium_risk
          }
          icon={<FiBarChart2 size={30} />}
        />

        <StatCard
          title="Low Risk"
          value={
            reports.summary.low_risk
          }
          icon={<FiUsers size={30} />}
        />

        <StatCard
          title="Interventions"
          value={
            reports
              .interventionSummary
              .total_interventions
          }
          icon={<FiActivity size={30} />}
        />
      </section>


      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Export CSV Reports
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Download the latest system data for
          documentation and further analysis.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ExportButton
            title="Students"
            reportType="students"
            downloading={
              downloadingReport
              === "students"
            }
            onDownload={handleDownload}
          />

          <ExportButton
            title="Predictions"
            reportType="predictions"
            downloading={
              downloadingReport
              === "predictions"
            }
            onDownload={handleDownload}
          />

          <ExportButton
            title="Interventions"
            reportType="interventions"
            downloading={
              downloadingReport
              === "interventions"
            }
            onDownload={handleDownload}
          />

          <ExportButton
            title="Notifications"
            reportType="notifications"
            downloading={
              downloadingReport
              === "notifications"
            }
            onDownload={handleDownload}
          />
        </div>
      </section>


      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DistributionCard
          title="Students by Department"
          items={reports.departments.map(
            (department) => ({
              label: department.department,
              value:
                department.total_students,
              maximum:
                maximumDepartmentTotal,
            }),
          )}
        />

        <DistributionCard
          title="Students by Semester"
          items={reports.semesters.map(
            (semester) => ({
              label: `Semester ${semester.semester}`,
              value:
                semester.total_students,
              maximum:
                maximumSemesterTotal,
            }),
          )}
        />
      </section>


      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Risk Student Report
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest prediction for students
              in the selected risk category.
            </p>
          </div>

          <select
            value={selectedRisk}
            onChange={(event) =>
              setSelectedRisk(
                event.target
                  .value as ReportRiskLevel,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="High Risk">
              High Risk
            </option>

            <option value="Medium Risk">
              Medium Risk
            </option>

            <option value="Low Risk">
              Low Risk
            </option>
          </select>
        </div>

        <div className="mt-6">
          {riskLoading ? (
            <p className="py-8 text-center text-gray-500">
              Loading risk report...
            </p>
          ) : (
            <PredictionTable
              predictions={riskStudents}
              emptyMessage={`No ${selectedRisk.toLowerCase()} students found.`}
            />
          )}
        </div>
      </section>


      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Latest Predictions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Most recent prediction generated
          for every student.
        </p>

        <div className="mt-6">
          <PredictionTable
            predictions={
              reports.latestPredictions
            }
            emptyMessage="No predictions are available."
          />
        </div>
      </section>
    </div>
  );
}


function ExportButton({
  title,
  reportType,
  downloading,
  onDownload,
}: {
  title: string;
  reportType: ExportReportType;
  downloading: boolean;
  onDownload: (
    type: ExportReportType,
  ) => Promise<void>;
}) {
  return (
    <button
      type="button"
      disabled={downloading}
      onClick={() =>
        void onDownload(reportType)
      }
      className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
    >
      <div>
        <p className="font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Download CSV
        </p>
      </div>

      <FiDownload
        size={22}
        className="text-blue-600"
      />
    </button>
  );
}


function DistributionCard({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    value: number;
    maximum: number;
  }[];
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="mt-5 text-gray-500">
          No distribution data available.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((item) => {
            const width = Math.max(
              4,
              (
                item.value
                / item.maximum
              ) * 100,
            );

            return (
              <div key={item.label}>
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>

                  <span className="font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function PredictionTable({
  predictions,
  emptyMessage,
}: {
  predictions: RiskStudentReport[];
  emptyMessage: string;
}) {
  if (predictions.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader>Student</TableHeader>
            <TableHeader>Department</TableHeader>
            <TableHeader>Semester</TableHeader>
            <TableHeader>Risk Level</TableHeader>
            <TableHeader>
              Confidence
            </TableHeader>
            <TableHeader>Date</TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {predictions.map(
            (prediction) => (
              <tr
                key={prediction.student_id}
                className="hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">
                    {prediction.full_name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {
                      prediction.roll_number
                    }
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {prediction.department}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  Semester{" "}
                  {prediction.semester}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskClass(
                      prediction.risk_level,
                    )}`}
                  >
                    {prediction.risk_level}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                  {getRiskProbability(
                    prediction,
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                  {formatDate(
                    prediction
                      .prediction_date,
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}


function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
          Loading reports...
        </p>
      </div>
    </div>
  );
}


function getRiskProbability(
  prediction: RiskStudentReport,
): string {
  const risk =
    prediction.risk_level.toLowerCase();

  let probability = 0;

  if (risk.includes("high")) {
    probability =
      prediction.high_probability;
  } else if (
    risk.includes("medium")
  ) {
    probability =
      prediction.medium_probability;
  } else if (
    risk.includes("low")
  ) {
    probability =
      prediction.low_probability;
  }

  return `${(
    probability * 100
  ).toFixed(2)}%`;
}


function getRiskClass(
  riskLevel: string,
): string {
  const risk =
    riskLevel.toLowerCase();

  if (risk.includes("high")) {
    return "bg-red-100 text-red-700";
  }

  if (risk.includes("medium")) {
    return (
      "bg-yellow-100 text-yellow-700"
    );
  }

  if (risk.includes("low")) {
    return "bg-green-100 text-green-700";
  }

  return "bg-gray-100 text-gray-700";
}


function formatDate(
  date: string | null,
): string {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "N/A";
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

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }

    if (error.response.status === 403) {
      return (
        "You do not have permission "
        + "to view or export reports."
      );
    }

    if (error.response.status >= 500) {
      return (
        "The backend could not generate "
        + "one of the reports."
      );
    }
  }

  return "Failed to load reports.";
}

export default AdminReportsPage;