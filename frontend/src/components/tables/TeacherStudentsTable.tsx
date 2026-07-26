import type { TeacherStudent } from "../../features/teacher/types/teacherDashboard";

interface Props {
  title: string;
  students: TeacherStudent[];
}

function TeacherStudentsTable({
  title,
  students,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">
        {title}
      </h2>

      {students.length === 0 ? (
        <p className="text-gray-500">
          No students found.
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

                <th className="border-b px-4 py-3 text-center">
                  Department
                </th>

                <th className="border-b px-4 py-3 text-center">
                  Semester
                </th>

                <th className="border-b px-4 py-3 text-center">
                  Risk Level
                </th>

                <th className="border-b px-4 py-3 text-center">
                  Prediction Date
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  className="hover:bg-gray-50"
                >
                  <td className="border-b px-4 py-3">
                    {student.student_name}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {student.roll_number}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {student.department}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {student.semester}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {student.risk_level}
                  </td>

                  <td className="border-b px-4 py-3 text-center">
                    {new Date(
                      student.prediction_date
                    ).toLocaleDateString()}
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

export default TeacherStudentsTable;