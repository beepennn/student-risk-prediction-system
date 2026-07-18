import StatCard from "../../../components/cards/StatCard";

function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Students"
          value="524"
        />

        <StatCard
          title="At Risk Students"
          value="38"
        />

        <StatCard
          title="Teachers"
          value="21"
        />

        <StatCard
          title="Courses"
          value="15"
        />

      </div>
    </div>
  );
}

export default AdminDashboardPage;