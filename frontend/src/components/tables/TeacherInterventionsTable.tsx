import type {
  TeacherIntervention,
} from "../../features/teacher/types/teacherDashboard";


interface TeacherInterventionsTableProps {
  interventions: TeacherIntervention[];
}


function TeacherInterventionsTable({
  interventions,
}: TeacherInterventionsTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
          Recent Interventions
        </h2>

        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {interventions.length} recent
        </span>
      </div>

      {interventions.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-slate-500">
            No interventions found.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-250 divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableHeader>
                  Student
                </TableHeader>

                <TableHeader>
                  Roll Number
                </TableHeader>

                <TableHeader>
                  Action Taken
                </TableHeader>

                <TableHeader>
                  Remarks
                </TableHeader>

                <TableHeader>
                  Date
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {interventions.map(
                (intervention) => (
                  <tr
                    key={intervention.id}
                    className="align-top transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {intervention.student_name
                          || "Student"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Student ID:{" "}
                        {intervention.student_id}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                      {intervention.roll_number
                        || "N/A"}
                    </td>

                    <td className="min-w-64 px-5 py-4 text-sm leading-6 text-slate-700">
                      {intervention.action_taken}
                    </td>

                    <td className="min-w-64 px-5 py-4 text-sm leading-6 text-slate-600">
                      {intervention.remarks
                        || "No remarks provided."}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {formatDate(
                        intervention.date,
                      )}
                    </td>
                  </tr>
                ),
              )}
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


export default TeacherInterventionsTable;