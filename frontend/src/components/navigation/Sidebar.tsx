import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiBarChart2,
  FiBell,
  FiSettings,
} from "react-icons/fi";

function Sidebar() {
  return (
    <aside className="h-full w-64 bg-slate-800 text-white">
      <nav className="p-4">
        <ul className="space-y-2">

          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-700"
                }`
              }
            >
              <FiHome />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/student"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-700"
            >
              <FiUsers />
              Students
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/teacher"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-700"
            >
              <FiUser />
              Teachers
            </NavLink>
          </li>

          <li className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-700">
            <FiBarChart2 />
            Analytics
          </li>

          <li className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-700">
            <FiBell />
            Notifications
          </li>

          <li className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-700">
            <FiSettings />
            Settings
          </li>

        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;