import { Outlet } from "react-router-dom";

import Navbar from "../../components/navigation/Navbar";
import Sidebar from "../../components/navigation/Sidebar";


function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Navbar />

          <main className="min-w-0 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}


export default DashboardLayout;