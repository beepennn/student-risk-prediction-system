import api from "../../../config/api";

import type {
  CreateTeacherInterventionPayload,
  TeacherStudentIntervention,
  TeacherStudentPrediction,
  TeacherStudentProfileResponse,
} from "../types/teacherStudentProfile";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getTeacherStudentProfile(
  token: string,
  studentId: number,
): Promise<TeacherStudentProfileResponse> {
  const response =
    await api.get<TeacherStudentProfileResponse>(
      `/teacher/students/${studentId}/profile`,
      {
        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}

export async function generateTeacherStudentPrediction(
  token: string,
  studentId: number,
): Promise<TeacherStudentPrediction> {
  const response =
    await api.post<TeacherStudentPrediction>(
      `/predictions/generate/${studentId}`,
      {},
      {
        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}

export async function createTeacherStudentIntervention(
  token: string,
  studentId: number,
  payload: CreateTeacherInterventionPayload,
): Promise<TeacherStudentIntervention> {
  const response =
    await api.post<TeacherStudentIntervention>(
      `/teacher/students/${studentId}/intervene`,
      payload,
      {
        headers: getAuthHeaders(token),
      },
    );

  return response.data;
}

export async function getTeacherPredictionShap(
  token: string,
  predictionId: number,
): Promise<unknown> {
  const response = await api.get<unknown>(
    `/predictions/${predictionId}/shap`,
    {
      headers: getAuthHeaders(token),
    },
  );

  return response.data;
}