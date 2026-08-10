import type {
  ReactNode,
} from "react";

import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiClock,
  FiFileText,
  FiHome,
  FiLogOut,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiX,
  FiUserCheck
} from "react-icons/fi";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../features/auth/context/useAuth";


interface SidebarItem {
  name: string;
  path: string;
  icon: ReactNode;
}


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const {
    user,
    logout,
  } = useAuth();

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
      name: "Teachers",
      path: "/admin/teachers",
      icon: <FiUserCheck size={20} />,
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
    {
      name: "Reports & Export",
      path: "/admin/reports",
      icon: <FiFileText size={20} />,
    },
    {
      name: "Audit Logs",
      path: "/admin/audit-logs",
      icon: <FiClock size={20} />,
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
    onClose();
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }


  const menuItems =
    getMenuItems();


  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          isOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[86vw] flex-col overflow-y-auto bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-700 px-5 py-5 lg:px-6 lg:py-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">
              StudentAlert
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Risk Prediction System
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <FiX size={22} />
          </button>
        </div>


        <div className="border-b border-slate-700 px-5 py-5 lg:px-6">
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
                {user?.role
                  || "Account"}
              </p>
            </div>
          </div>
        </div>


        <nav className="flex-1 space-y-1.5 px-3 py-5 lg:px-4 lg:py-6">
          {menuItems.map(
            (item) => {
              const active =
                isMenuItemActive(
                  item.path,
                );

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="shrink-0">
                    {item.icon}
                  </span>

                  <span className="min-w-0 truncate">
                    {item.name}
                  </span>
                </NavLink>
              );
            },
          )}
        </nav>


        <div className="border-t border-slate-700 p-3 lg:p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-600 hover:text-white"
          >
            <FiLogOut
              size={20}
              className="shrink-0"
            />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}


export default Sidebar;