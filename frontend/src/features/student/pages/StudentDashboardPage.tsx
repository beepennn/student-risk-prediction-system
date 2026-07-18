import StatCard from "../../../components/cards/StatCard";

function StudentDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Student Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Attendance" value="92%" />
        <StatCard title="CGPA" value="3.62" />
        <StatCard title="Assignments" value="12" />
        <StatCard title="Risk Level" value="Low" />
      </div>
    </div>
  );
}

export default StudentDashboardPage;