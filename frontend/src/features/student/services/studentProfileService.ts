import api from "../../../config/api";

import type { StudentProfile } from "../types/studentProfile";

export async function getStudentProfile(
  token: string,
): Promise<StudentProfile> {
  const response = await api.get<StudentProfile>(
    "/students/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}