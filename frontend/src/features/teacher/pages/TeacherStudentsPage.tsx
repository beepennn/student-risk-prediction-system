import { useEffect, useState } from "react";
import { FiEye, FiSearch, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/useAuth";

import { getTeacherStudents } from "../services/teacherStudentsService";

import type { TeacherStudent } from "../types/teacherStudents";

function TeacherStudentsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const studentsData = await getTeacherStudents(token);

        setStudents(studentsData);
      } catch (error) {
        console.error("Teacher students error:", error);
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [token]);

  const filteredStudents = students.filter((student) => {
    const searchValue = searchTerm.toLowerCase();

    return (
      student.student_name.toLowerCase().includes(searchValue) ||
      student.roll_number.toLowerCase().includes(searchValue) ||
      student.department.toLowerCase().includes(searchValue) ||
      student.risk_level.toLowerCase().includes(searchValue)
    );
  });

  function getRiskClass(riskLevel: string) {
    const risk = riskLevel.toLowerCase();

    if (risk.includes("high")) {
      return "bg-red-100 text-red-700";
    }

    if (risk.includes("medium")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (risk.includes("low")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function getStatusClass(status: string) {
    if (status.toLowerCase() === "active") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  if (loading) {
    return <p>Loading Students...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Teacher Students
        </h1>

        <p className="mt-2 text-gray-500">
          View and manage the students assigned to you.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-blue-100 p-4 text-blue-600">
            <FiUsers size={30} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total Students
            </p>

            <p className="text-3xl font-bold text-gray-900">
              {students.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-white p-5 shadow-md">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by name, roll number, department or risk level"
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Student List
        </h2>

        {filteredStudents.length === 0 ? (
          <p className="text-gray-500">
            No students found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Roll Number
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Department
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Semester
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Risk Level
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.student_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">
                        {student.student_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        ID: {student.student_id}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {student.roll_number}
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {student.department}
                    </td>

                    <td className="px-4 py-4 text-center text-gray-700">
                      {student.semester}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                          student.status,
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getRiskClass(
                          student.risk_level,
                        )}`}
                      >
                        {student.risk_level}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/teacher/students/${student.student_id}`,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <FiEye />

                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherStudentsPage;