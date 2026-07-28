import api from "../../../config/api";

import type {
  AdminReportsData,
  DepartmentReport,
  ExportReportType,
  InterventionReport,
  ReportDashboardSummary,
  ReportRiskLevel,
  RiskStudentReport,
  SemesterReport,
} from "../types/adminReports";


function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}


export async function getAdminReports(
  token: string,
): Promise<AdminReportsData> {
  const results = await Promise.allSettled([
    api.get<ReportDashboardSummary>(
      "/reports/dashboard-summary",
      {
        headers: getAuthHeaders(token),
      },
    ),

    api.get<DepartmentReport[]>(
      "/reports/students-by-department",
      {
        headers: getAuthHeaders(token),
      },
    ),

    api.get<SemesterReport[]>(
      "/reports/students-by-semester",
      {
        headers: getAuthHeaders(token),
      },
    ),

    api.get<RiskStudentReport[]>(
      "/reports/latest-predictions",
      {
        headers: getAuthHeaders(token),
      },
    ),

    api.get<InterventionReport>(
      "/reports/intervention-summary",
      {
        headers: getAuthHeaders(token),
      },
    ),
  ]);

  const [
    summaryResult,
    departmentResult,
    semesterResult,
    predictionResult,
    interventionResult,
  ] = results;

  return {
    summary:
      summaryResult.status === "fulfilled"
        ? summaryResult.value.data
        : {
            total_students: 0,
            high_risk: 0,
            medium_risk: 0,
            low_risk: 0,
          },

    departments:
      departmentResult.status === "fulfilled"
        ? departmentResult.value.data
        : [],

    semesters:
      semesterResult.status === "fulfilled"
        ? semesterResult.value.data
        : [],

    latestPredictions:
      predictionResult.status === "fulfilled"
        ? predictionResult.value.data
        : [],

    interventionSummary:
      interventionResult.status === "fulfilled"
        ? interventionResult.value.data
        : {
            total_interventions: 0,
          },
  };
}


export async function getRiskStudentReport(
  token: string,
  riskLevel: ReportRiskLevel,
): Promise<RiskStudentReport[]> {
  const endpointMap: Record<
    ReportRiskLevel,
    string
  > = {
    "High Risk":
      "/reports/high-risk-students",

    "Medium Risk":
      "/reports/medium-risk-students",

    "Low Risk":
      "/reports/low-risk-students",
  };

  const response =
    await api.get<RiskStudentReport[]>(
      endpointMap[riskLevel],
      {
        params: {
          skip: 0,
          limit: 100,
          sort_by: "prediction_date",
          order: "desc",
        },

        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}


export async function downloadAdminCsv(
  token: string,
  reportType: ExportReportType,
): Promise<void> {
  const response = await api.get<Blob>(
    `/export/${reportType}.csv`,
    {
      headers: getAuthHeaders(token),
      responseType: "blob",
    },
  );

  const contentDisposition =
    response.headers[
      "content-disposition"
    ] as string | undefined;

  const filenameMatch =
    contentDisposition?.match(
      /filename="?([^"]+)"?/i,
    );

  const filename =
    filenameMatch?.[1]
    ?? `${reportType}.csv`;

  const fileUrl =
    window.URL.createObjectURL(
      response.data,
    );

  const anchor =
    document.createElement("a");

  anchor.href = fileUrl;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(fileUrl);
}