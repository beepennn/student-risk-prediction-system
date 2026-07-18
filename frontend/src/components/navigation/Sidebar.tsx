function Sidebar() {
  return (
    <aside className="h-full w-64 bg-slate-800 text-white">
      <nav className="p-4">
        <ul className="space-y-4">
          <li>Dashboard</li>
          <li>Students</li>
          <li>Teachers</li>
          <li>Analytics</li>
          <li>Notifications</li>
          <li>Recommendations</li>
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;