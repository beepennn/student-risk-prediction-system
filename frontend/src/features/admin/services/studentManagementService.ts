import api from "../../../config/api";

import type {
  AdminStudent,
  CreateAdminStudentPayload,
  CreateStudentPayload,
  CreateUserPayload,
  Student,
  StudentFilters,
  UpdateAdminStudentPayload,
  User,
} from "../types/studentManagement";

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminUsers(
  token: string,
): Promise<User[]> {
  const response = await api.get<User[]>("/users/", {
    headers: getAuthHeaders(token),
  });

  return response.data;
}

export async function getAdminStudents(
  token: string,
  filters: StudentFilters,
): Promise<AdminStudent[]> {
  const [studentsResponse, usersResponse] =
    await Promise.all([
      api.get<Student[]>("/students/", {
        headers: getAuthHeaders(token),
        params: {
          skip: filters.skip,
          limit: filters.limit,
          search: filters.search || undefined,
          semester: filters.semester || undefined,
          department: filters.department || undefined,
        },
      }),

      api.get<User[]>("/users/", {
        headers: getAuthHeaders(token),
      }),
    ]);

  const usersById = new Map(
    usersResponse.data.map((user) => [
      user.id,
      user,
    ]),
  );

  return studentsResponse.data.map((student) => {
    const user = usersById.get(student.user_id);

    return {
      ...student,
      full_name: user?.full_name ?? "Unknown Student",
      email: user?.email ?? "N/A",
      is_active: user?.is_active ?? false,
    };
  });
}

export async function createAdminStudent(
  token: string,
  payload: CreateAdminStudentPayload,
): Promise<AdminStudent> {
  let createdUser: User | null = null;

  try {
    const userPayload: CreateUserPayload = {
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
      role: "student",
    };

    const userResponse = await api.post<User>(
      "/users/",
      userPayload,
      {
        headers: getAuthHeaders(token),
      },
    );

    createdUser = userResponse.data;

    const studentPayload: CreateStudentPayload = {
      user_id: createdUser.id,
      roll_number: payload.roll_number,
      department: payload.department,
      semester: payload.semester,
      phone: payload.phone || null,
      parent_email: payload.parent_email || null,
      enrollment_year: payload.enrollment_year,
      status: payload.status,
    };

    const studentResponse = await api.post<Student>(
      "/students/",
      studentPayload,
      {
        headers: getAuthHeaders(token),
      },
    );

    return {
      ...studentResponse.data,
      full_name: createdUser.full_name,
      email: createdUser.email,
      is_active: createdUser.is_active,
    };
  } catch (error) {
    /*
     * If user creation succeeds but student creation fails,
     * remove the incomplete user account.
     */
    if (createdUser) {
      try {
        await api.delete(`/users/${createdUser.id}`, {
          headers: getAuthHeaders(token),
        });
      } catch (cleanupError) {
        console.error(
          "Failed to remove incomplete user:",
          cleanupError,
        );
      }
    }

    throw error;
  }
}

export async function updateAdminStudent(
  token: string,
  student: AdminStudent,
  payload: UpdateAdminStudentPayload,
): Promise<void> {
  await Promise.all([
    api.put(
      `/users/${student.user_id}`,
      {
        full_name: payload.full_name,
        email: payload.email,
      },
      {
        headers: getAuthHeaders(token),
      },
    ),

    api.put(
      `/students/${student.id}`,
      {
        roll_number: payload.roll_number,
        department: payload.department,
        semester: payload.semester,
        phone: payload.phone || null,
        parent_email: payload.parent_email || null,
        enrollment_year: payload.enrollment_year,
        status: payload.status,
      },
      {
        headers: getAuthHeaders(token),
      },
    ),
  ]);
}

export async function deleteAdminStudent(
  token: string,
  student: AdminStudent,
): Promise<void> {
  /*
   * Delete the student profile first because it references
   * the user through user_id.
   */
  await api.delete(`/students/${student.id}`, {
    headers: getAuthHeaders(token),
  });

  await api.delete(`/users/${student.user_id}`, {
    headers: getAuthHeaders(token),
  });
}