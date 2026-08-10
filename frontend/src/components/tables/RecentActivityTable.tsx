import type {
  RecentActivity,
} from "../../features/admin/types/dashboard";


interface RecentActivityTableProps {
  activity: RecentActivity;
}


function RecentActivityTable({
  activity,
}: RecentActivityTableProps) {
  const rows = [
    activity.latest_prediction
      ? {
          id: "prediction",
          activity: "Prediction Generated",
          studentId:
            activity.latest_prediction.student_id,
          details:
            activity.latest_prediction.risk_level,
          date:
            activity.latest_prediction.date,
        }
      : null,

    activity.latest_intervention
      ? {
          id: "intervention",
          activity: "Intervention Recorded",
          studentId:
            activity.latest_intervention.student_id,
          details: `Teacher #${activity.latest_intervention.teacher_id}`,
          date:
            activity.latest_intervention.date,
        }
      : null,
  ].filter(
    (
      row,
    ): row is {
      id: string;
      activity: string;
      studentId: number;
      details: string;
      date: string;
    } => row !== null,
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
        <p className="font-medium text-slate-700">
          No recent activity
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Prediction and intervention activity
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-180 divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <TableHeader>
              Activity
            </TableHeader>

            <TableHeader>
              Student ID
            </TableHeader>

            <TableHeader>
              Details
            </TableHeader>

            <TableHeader>
              Date and Time
            </TableHeader>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="transition hover:bg-slate-50"
            >
              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                {row.activity}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                #{row.studentId}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                {row.details}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                {formatDate(row.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  return date.toLocaleString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


export default RecentActivityTable;