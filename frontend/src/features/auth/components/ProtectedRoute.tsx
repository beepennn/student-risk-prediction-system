import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";

import type { User } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: User["role"][];
}

function getRoleHome(
  role: User["role"],
): string {
  switch (role) {
    case "Admin":
      return "/admin";

    case "Teacher":
      return "/teacher";

    case "Student":
      return "/student";

    default:
      return "/login";
  }
}

function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    token,
    user,
    isInitializing,
  } = useAuth();

  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={getRoleHome(user.role)}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;