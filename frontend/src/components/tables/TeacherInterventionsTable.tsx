import type { TeacherIntervention } from "../../features/teacher/types/teacherDashboard";

interface Props {
  interventions: TeacherIntervention[];
}

function TeacherInterventionsTable({
  interventions,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">
        Recent Interventions
      </h2>

      {interventions.length === 0 ? (
        <p className="text-gray-500">
          No interventions found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b px-4 py-3 text-left">
                  Student
                </th>

                <th className="border-b px-4 py-3 text-center">
                  Roll No
                </th>

                <th className="border-b px-4 py-3 text-left">
                  Action Taken
                </th>

                <th className="border-b px-4 py-3 text-left">
                  Remarks
                </th>

                <th className="border-b px-4 py-3 text-center">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {interventions.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50"
                >
                  <td className="border-b px-4 py-3">
                    {item.student_name}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {item.roll_number}
                  </td>

                  <td className="border-b px-4 py-3">
                    {item.action_taken}
                  </td>

                  <td className="border-b px-4 py-3">
                    {item.remarks}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherInterventionsTable;