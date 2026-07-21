import StatCard from "../../../components/cards/StatCard";

function TeacherDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Teacher Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Students" value="120" />
        <StatCard title="Assignments" value="15" />
        <StatCard title="Attendance" value="96%" />
        <StatCard title="Alerts" value="8" />
      </div>
    </div>
  );
}

export default TeacherDashboardPage;