import api from "../../../config/api";

import type { TeacherStudentProfileResponse } from "../types/teacherStudentProfile";

export async function getTeacherStudentProfile(
  token: string,
  studentId: number,
): Promise<TeacherStudentProfileResponse> {
  const response = await api.get<TeacherStudentProfileResponse>(
    `/teacher/students/${studentId}/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}