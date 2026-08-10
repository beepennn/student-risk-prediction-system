import api from "../../../config/api";

import type {
  Prediction,
  PredictionFilters,
  ShapExplanation,
} from "../types/predictionManagement";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminPredictions(
  token: string,
  filters: PredictionFilters = {},
): Promise<Prediction[]> {
  const response = await api.get<Prediction[]>(
    "/predictions/admin",
    {
      headers: getAuthHeaders(token),
      params: {
        risk_level: filters.riskLevel || undefined,
        semester: filters.semester || undefined,
        department: filters.department || undefined,
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 1000,
      },
    },
  );

  return response.data;
}

export async function generateStudentPrediction(
  token: string,
  studentId: number,
): Promise<Prediction> {
  const response = await api.post<Prediction>(
    `/predictions/generate/${studentId}`,
    null,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}

export async function deleteAdminPrediction(
  token: string,
  predictionId: number,
): Promise<void> {
  await api.delete(
    `/predictions/${predictionId}`,
    {
      headers: getAuthHeaders(token),
    },
  );
}

export async function getPredictionShapExplanations(
  token: string,
  predictionId: number,
): Promise<ShapExplanation[]> {
  const response = await api.get<
    Record<string, unknown>[]
  >(`/predictions/${predictionId}/shap`, {
    headers: getAuthHeaders(token),
  });

  return response.data.map(normalizeShapExplanation);
}

function normalizeShapExplanation(
  rawExplanation: Record<string, unknown>,
): ShapExplanation {
  const featureName =
    rawExplanation.feature_name ??
    rawExplanation.feature ??
    rawExplanation.name ??
    "Unknown feature";

  const featureValue =
    rawExplanation.feature_value ??
    rawExplanation.actual_value ??
    rawExplanation.input_value ??
    null;

  const rawShapValue =
    rawExplanation.shap_value ??
    rawExplanation.value ??
    rawExplanation.impact ??
    0;

  return {
    id: toOptionalNumber(rawExplanation.id),
    prediction_id: toOptionalNumber(
      rawExplanation.prediction_id,
    ),
    feature_name: String(featureName),
    feature_value:
      typeof featureValue === "string" ||
      typeof featureValue === "number"
        ? featureValue
        : null,
    shap_value: toNumber(rawShapValue),
  };
}

function toNumber(value: unknown): number {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function toOptionalNumber(
  value: unknown,
): number | undefined {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : undefined;
}