import type { SemesterSummary } from "../../features/admin/types/dashboard";

interface Props {
  semesters: SemesterSummary[];
}

function SemesterSummaryTable({ semesters }: Props) {
  if (semesters.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No semester data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-3 text-left">
              Semester
            </th>

            <th className="border-b px-4 py-3 text-center">
              Students
            </th>

            <th className="border-b px-4 py-3 text-center">
              High
            </th>

            <th className="border-b px-4 py-3 text-center">
              Medium
            </th>

            <th className="border-b px-4 py-3 text-center">
              Low
            </th>
          </tr>
        </thead>

        <tbody>
          {semesters.map((semester) => (
            <tr
              key={semester.semester}
              className="hover:bg-gray-50"
            >
              <td className="border-b px-4 py-3">
                Semester {semester.semester}
              </td>

              <td className="border-b px-4 py-3 text-center">
                {semester.total_students}
              </td>

              <td className="border-b px-4 py-3 text-center text-red-500">
                {semester.high_risk}
              </td>

              <td className="border-b px-4 py-3 text-center text-yellow-500">
                {semester.medium_risk}
              </td>

              <td className="border-b px-4 py-3 text-center text-green-600">
                {semester.low_risk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SemesterSummaryTable;