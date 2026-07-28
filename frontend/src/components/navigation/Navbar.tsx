import { FiUser } from "react-icons/fi";

import { useAuth } from "../../features/auth/context/useAuth";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex min-h-[74px] items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-blue-600 sm:text-2xl">
          Student Risk Prediction System
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user?.full_name ||
              user?.email ||
              "User"}
          </p>

          <p className="text-xs text-gray-500">
            {user?.role ?? "Account"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <FiUser size={20} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;