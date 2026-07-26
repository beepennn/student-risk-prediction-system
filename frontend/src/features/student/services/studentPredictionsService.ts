import api from "../../../config/api";

import type { StudentPredictionsResponse } from "../types/studentPredictions";

export async function getStudentPredictions(
  token: string,
): Promise<StudentPredictionsResponse> {
  const response = await api.get<StudentPredictionsResponse>(
    "/students/me/predictions",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}