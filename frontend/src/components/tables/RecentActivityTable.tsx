type Activity = {
  id: number;
  action: string;
  user: string;
  time: string;
};

const activities: Activity[] = [
  {
    id: 1,
    action: "Student record updated",
    user: "Admin",
    time: "10:30 AM",
  },
  {
    id: 2,
    action: "Risk prediction generated",
    user: "System",
    time: "10:15 AM",
  },
  {
    id: 3,
    action: "Teacher assigned",
    user: "Admin",
    time: "09:45 AM",
  },
  {
    id: 4,
    action: "Recommendation created",
    user: "System",
    time: "09:20 AM",
  },
];

function RecentActivityTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-3 text-left">
              Time
            </th>

            <th className="border-b px-4 py-3 text-left">
              Action
            </th>

            <th className="border-b px-4 py-3 text-left">
              User
            </th>
          </tr>
        </thead>

        <tbody>
          {activities.map((activity) => (
            <tr
              key={activity.id}
              className="hover:bg-gray-50"
            >
              <td className="border-b px-4 py-3">
                {activity.time}
              </td>

              <td className="border-b px-4 py-3">
                {activity.action}
              </td>

              <td className="border-b px-4 py-3">
                {activity.user}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentActivityTable;