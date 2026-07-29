import {
  FiMenu,
  FiUser,
} from "react-icons/fi";

import {
  useAuth,
} from "../../features/auth/context/useAuth";


interface NavbarProps {
  onOpenSidebar: () => void;
}


function Navbar({
  onOpenSidebar,
}: NavbarProps) {
  const {
    user,
  } = useAuth();

  return (
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-5 lg:min-h-18.5 lg:px-6 lg:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          aria-controls="dashboard-sidebar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
        >
          <FiMenu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate font-bold text-blue-600">
            <span className="text-lg sm:hidden">
              StudentAlert
            </span>

            <span className="hidden text-xl sm:inline lg:text-2xl">
              Student Risk Prediction System
            </span>
          </h1>

          <p className="hidden text-xs text-slate-500 md:block">
            Explainable academic risk monitoring
          </p>
        </div>
      </div>


      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden max-w-48 min-w-0 text-right md:block">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.full_name
              || user?.email
              || "User"}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user?.role
              ?? "Account"}
          </p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-11 sm:w-11"
          title={
            user?.full_name
            || user?.email
            || "User"
          }
        >
          <FiUser size={20} />
        </div>
      </div>
    </header>
  );
}


export default Navbar;