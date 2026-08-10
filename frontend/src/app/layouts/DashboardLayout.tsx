import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "../../components/navigation/Navbar";
import Sidebar from "../../components/navigation/Sidebar";


function DashboardLayout() {
  const location = useLocation();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  const openSidebar =
    useCallback(() => {
      setSidebarOpen(true);
    }, []);


  const closeSidebar =
    useCallback(() => {
      setSidebarOpen(false);
    }, []);


  useEffect(() => {
    closeSidebar();
  }, [
    closeSidebar,
    location.pathname,
  ]);


  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(max-width: 1023px)",
      );

    if (mediaQuery.matches) {
      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      const handleEscape = (
        event: KeyboardEvent,
      ) => {
        if (event.key === "Escape") {
          closeSidebar();
        }
      };

      const handleBreakpointChange = (
        event: MediaQueryListEvent,
      ) => {
        if (!event.matches) {
          closeSidebar();
        }
      };

      document.addEventListener(
        "keydown",
        handleEscape,
      );

      mediaQuery.addEventListener(
        "change",
        handleBreakpointChange,
      );

      return () => {
        document.body.style.overflow =
          previousOverflow;

        document.removeEventListener(
          "keydown",
          handleEscape,
        );

        mediaQuery.removeEventListener(
          "change",
          handleBreakpointChange,
        );
      };
    }

    return undefined;
  }, [
    closeSidebar,
    sidebarOpen,
  ]);


  return (
    <div className="min-h-screen min-w-0 bg-slate-100">
      <div className="flex min-h-screen min-w-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden">
          <Navbar
            onOpenSidebar={
              openSidebar
            }
          />

          <main className="min-w-0 p-3 sm:p-5 lg:p-8">
            <div className="mx-auto min-w-0 w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


export default DashboardLayout;