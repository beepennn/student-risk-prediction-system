import type {
  TeacherStudent,
} from "../../features/teacher/types/teacherDashboard";


interface TeacherStudentsTableProps {
  title: string;
  students: TeacherStudent[];
}


function TeacherStudentsTable({
  title,
  students,
}: TeacherStudentsTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h2>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {students.length}{" "}
          {students.length === 1
            ? "student"
            : "students"}
        </span>
      </div>

      {students.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-slate-500">
            No students found.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-225 divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableHeader>
                  Student
                </TableHeader>

                <TableHeader>
                  Roll Number
                </TableHeader>

                <TableHeader>
                  Department
                </TableHeader>

                <TableHeader>
                  Semester
                </TableHeader>

                <TableHeader>
                  Risk Level
                </TableHeader>

                <TableHeader>
                  Prediction Date
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {student.student_name
                        || "Student"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ID:{" "}
                      {student.student_id}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {student.roll_number}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {student.department}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    Semester{" "}
                    {student.semester}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                        student.risk_level,
                      )}`}
                    >
                      {student.risk_level
                        || "Not Predicted"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      student.prediction_date,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


function TableHeader({
  children,
}: {
  children: string;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}


function getRiskClass(
  riskLevel: string | null | undefined,
): string {
  const risk = (
    riskLevel || ""
  ).toLowerCase();

  if (risk.includes("high")) {
    return "bg-red-100 text-red-700";
  }

  if (risk.includes("medium")) {
    return "bg-amber-100 text-amber-700";
  }

  if (risk.includes("low")) {
    return "bg-green-100 text-green-700";
  }

  return "bg-slate-100 text-slate-600";
}


function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "N/A";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}


export default TeacherStudentsTable;