import { useEffect, useMemo, useState } from "react";
import {
  FiClipboard,
  FiEye,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/useAuth";

import { getTeacherInterventions } from "../services/teacherInterventionsService";

import type { TeacherIntervention } from "../types/teacherInterventions";

function TeacherInterventionsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [interventions, setInterventions] = useState<
    TeacherIntervention[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInterventions() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getTeacherInterventions(token);

        setInterventions(data);
      } catch (error) {
        console.error(
          "Teacher interventions error:",
          error,
        );

        setError(
          "Failed to load teacher interventions.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInterventions();
  }, [token]);

  const filteredInterventions = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value) {
      return interventions;
    }

    return interventions.filter((intervention) => {
      return (
        intervention.student_name
          .toLowerCase()
          .includes(value) ||
        intervention.student_id
          .toString()
          .includes(value) ||
        intervention.action_taken
          .toLowerCase()
          .includes(value) ||
        intervention.remarks
          .toLowerCase()
          .includes(value)
      );
    });
  }, [interventions, searchTerm]);

  if (loading) {
    return (
      <p className="text-gray-600">
        Loading interventions...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Interventions
        </h1>

        <p className="mt-2 text-gray-500">
          View all academic interventions recorded for
          students.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Interventions
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {interventions.length}
              </p>
            </div>

            <div className="rounded-full bg-blue-100 p-4 text-blue-600">
              <FiClipboard size={28} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Students Supported
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {
                  new Set(
                    interventions.map(
                      (intervention) =>
                        intervention.student_id,
                    ),
                  ).size
                }
              </p>
            </div>

            <div className="rounded-full bg-green-100 p-4 text-green-600">
              <FiUser size={28} />
            </div>
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
            placeholder="Search by student name, ID, action or remarks"
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        {filteredInterventions.length === 0 ? (
          <div className="p-10 text-center">
            <FiClipboard
              className="mx-auto text-gray-300"
              size={48}
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              No interventions found
            </h2>

            <p className="mt-2 text-gray-500">
              There are no interventions matching your
              search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Intervention ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Action Taken
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Remarks
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredInterventions.map(
                  (intervention) => (
                    <tr
                      key={intervention.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        #{intervention.id}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <FiUser />
                          </div>

                          <span className="font-medium text-gray-900">
                            {
                              intervention.student_name
                            }
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {intervention.student_id}
                      </td>

                      <td className="min-w-64 px-6 py-4 text-sm text-gray-700">
                        {
                          intervention.action_taken
                        }
                      </td>

                      <td className="min-w-64 px-6 py-4 text-sm text-gray-600">
                        {intervention.remarks}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/teacher/students/${intervention.student_id}`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <FiEye />
                          View Student
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherInterventionsPage;