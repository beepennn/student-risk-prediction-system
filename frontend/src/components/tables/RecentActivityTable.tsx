import type { RecentActivity } from "../../features/admin/types/dashboard";

interface Props {
  activity: RecentActivity;
}

function RecentActivityTable({
  activity,
}: Props) {

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-3 text-left">
              Activity
            </th>

            <th className="border-b px-4 py-3 text-left">
              Student ID
            </th>

            <th className="border-b px-4 py-3 text-left">
              Date
            </th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td className="border-b px-4 py-3">
              Latest Prediction
            </td>

            <td className="border-b px-4 py-3">
              {activity.latest_prediction.student_id}
            </td>

            <td className="border-b px-4 py-3">
              {new Date(
                activity.latest_prediction.date
              ).toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="border-b px-4 py-3">
              Latest Intervention
            </td>

            <td className="border-b px-4 py-3">
              {activity.latest_intervention.student_id}
            </td>

            <td className="border-b px-4 py-3">
              {new Date(
                activity.latest_intervention.date
              ).toLocaleString()}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}

export default RecentActivityTable;