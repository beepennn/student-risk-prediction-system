import api from "../../../config/api";

import type { TeacherInterventionsResponse } from "../types/teacherInterventions";

export async function getTeacherInterventions(
  token: string,
): Promise<TeacherInterventionsResponse> {
  const response =
    await api.get<TeacherInterventionsResponse>(
      "/teacher/interventions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
}