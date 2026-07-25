import { Outlet } from "react-router-dom";

function ProtectedRoute() {
  // TEMPORARY:
  // Authentication is bypassed because the local backend
  // is incomplete on this machine.
  // Restore the original authentication check once
  // the backend is fully working.

  return <Outlet />;
}

export default ProtectedRoute;