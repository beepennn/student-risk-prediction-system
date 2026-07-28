export interface ReportDashboardSummary {
  total_students: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export interface DepartmentReport {
  department: string;
  total_students: number;
}

export interface SemesterReport {
  semester: number;
  total_students: number;
}

export interface InterventionReport {
  total_interventions: number;
}

export interface RiskStudentReport {
  student_id: number;
  full_name: string;
  roll_number: string;
  department: string;
  semester: number;
  risk_level: string;

  low_probability: number;
  medium_probability: number;
  high_probability: number;

  prediction_date: string | null;
}

export interface AdminReportsData {
  summary: ReportDashboardSummary;
  departments: DepartmentReport[];
  semesters: SemesterReport[];
  latestPredictions: RiskStudentReport[];
  interventionSummary: InterventionReport;
}

export type ReportRiskLevel =
  | "High Risk"
  | "Medium Risk"
  | "Low Risk";

export type ExportReportType =
  | "students"
  | "predictions"
  | "interventions"
  | "notifications";