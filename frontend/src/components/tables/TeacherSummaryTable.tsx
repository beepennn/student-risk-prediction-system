import type { TeacherSummary } from "../../features/admin/types/dashboard";

interface Props {
  teachers: TeacherSummary[];
}

function TeacherSummaryTable({ teachers }: Props) {
  if (teachers.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No teacher data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-3 text-left">
              Teacher
            </th>

            <th className="border-b px-4 py-3 text-left">
              Email
            </th>

            <th className="border-b px-4 py-3 text-center">
              Students
            </th>

            <th className="border-b px-4 py-3 text-center">
              Interventions
            </th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr
              key={teacher.teacher_id}
              className="hover:bg-gray-50"
            >
              <td className="border-b px-4 py-3">
                {teacher.teacher_name}
              </td>

              <td className="border-b px-4 py-3">
                {teacher.email}
              </td>

              <td className="border-b px-4 py-3 text-center">
                {teacher.students_handled}
              </td>

              <td className="border-b px-4 py-3 text-center">
                {teacher.total_interventions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherSummaryTable;