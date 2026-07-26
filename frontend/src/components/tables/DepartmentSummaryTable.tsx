import type { DepartmentSummary } from "../../features/admin/types/dashboard";

interface Props {
  departments: DepartmentSummary[];
}

function DepartmentSummaryTable({
  departments,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-3 text-left">
              Department
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
          {departments.map((department) => (
            <tr
              key={department.department}
              className="hover:bg-gray-50"
            >
              <td className="border-b px-4 py-3">
                {department.department}
              </td>

              <td className="border-b px-4 py-3 text-center">
                {department.total_students}
              </td>

              <td className="border-b px-4 py-3 text-center text-red-500">
                {department.high_risk}
              </td>

              <td className="border-b px-4 py-3 text-center text-yellow-500">
                {department.medium_risk}
              </td>

              <td className="border-b px-4 py-3 text-center text-green-600">
                {department.low_risk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentSummaryTable;