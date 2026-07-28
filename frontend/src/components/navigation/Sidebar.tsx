import type { ReactNode } from "react";

import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiHome,
  FiLogOut,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../features/auth/context/useAuth";


interface SidebarItem {
  name: string;
  path: string;
  icon: ReactNode;
}


function Sidebar() {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  const adminMenu: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FiHome size={20} />,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Academic Records",
      path: "/admin/academic-records",
      icon: <FiBookOpen size={20} />,
    },
    {
      name: "Predictions & SHAP",
      path: "/admin/predictions",
      icon: <FiTrendingUp size={20} />,
    },
    {
      name: "Recommendations",
      path: "/admin/recommendations",
      icon: <FiTarget size={20} />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <FiBell size={20} />,
    },
  ];

  const teacherMenu: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/teacher",
      icon: <FiHome size={20} />,
    },
    {
      name: "Students",
      path: "/teacher/students",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Interventions",
      path: "/teacher/interventions",
      icon: <FiActivity size={20} />,
    },
  ];

  const studentMenu: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/student",
      icon: <FiHome size={20} />,
    },
    {
      name: "Profile",
      path: "/student/profile",
      icon: <FiUser size={20} />,
    },
    {
      name: "Analytics",
      path: "/student/analytics",
      icon: <FiBarChart2 size={20} />,
    },
    {
      name: "Predictions",
      path: "/student/predictions",
      icon: <FiTrendingUp size={20} />,
    },
    {
      name: "Recommendations",
      path: "/student/recommendations",
      icon: <FiTarget size={20} />,
    },
    {
      name: "Notifications",
      path: "/student/notifications",
      icon: <FiBell size={20} />,
    },
  ];

  function getMenuItems(): SidebarItem[] {
    const role =
      user?.role
        .trim()
        .toLowerCase();

    if (role === "admin") {
      return adminMenu;
    }

    if (role === "teacher") {
      return teacherMenu;
    }

    if (role === "student") {
      return studentMenu;
    }

    return [];
  }

  function isMenuItemActive(
    path: string,
  ): boolean {
    if (
      path === "/admin"
      || path === "/teacher"
      || path === "/student"
    ) {
      return pathname === path;
    }

    return (
      pathname === path
      || pathname.startsWith(
        `${path}/`,
      )
    );
  }

  function handleLogout() {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }

  const menuItems = getMenuItems();

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-6">
        <h1 className="text-xl font-bold">
          StudentAlert
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Risk Prediction System
        </p>
      </div>

      <div className="border-b border-slate-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <FiUser size={21} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {user?.full_name
                || user?.email
                || "User"}
            </p>

            <p className="truncate text-sm text-slate-400">
              {user?.role || "Account"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const active =
            isMenuItemActive(
              item.path,
            );

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <FiLogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}


export default Sidebar;