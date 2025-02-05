import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useApp } from "@/contexts/AppContext";

export const MainLayout = () => {
  const location = useLocation(); // Get current route location
  const { darkMode, changeMode } = useApp();

  return (
    <div className="w-full min-h-screen text-gray-800 bg-gradient-to-br from-blue-300 via-gray-300 to-gray-800 dark:from-indigo-900 dark:via-gray-700 dark:to-black dark:text-gray-200">
      {/* Main NavBar */}
      <nav className="fixed z-10 flex items-center justify-between w-full gap-3 px-6 py-2 shadow-sm bg-inherit dark:text-gray-200">
        {/* Logo */}
        <div className="hidden md:flex">
          <h1 className="text-xl font-bold">FixItHub</h1>
        </div>

        {/* Routes */}
        <div className="flex gap-5">
          <Link
            className={`border-indigo-900 hover:border-b dark:border-blue-300 ${
              location.pathname === "/" ? "border-b" : ""
            }`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`border-indigo-900 hover:border-b dark:border-blue-300 ${
              location.pathname === "/about" ? "border-b" : ""
            }`}
            to="about"
          >
            About
          </Link>
        </div>

        {/* Sign In and Register */}
        <div className="flex items-center gap-5">
          <Link
            to="register"
            className="border-indigo-900 hover:border-b dark:border-blue-300"
          >
            Join Us
          </Link>
          <Separator
            orientation="vertical"
            className="h-5 bg-indigo-900 dark:bg-blue-300"
          />
          <Button
            onClick={changeMode}
            variant="icon"
            size="sm"
            className="p-0.5 text-base"
          >
            {darkMode ? "🌞" : "🌙"}
          </Button>
        </div>
      </nav>

      {/* Animated Content Area */}
      <Outlet />
    </div>
  );
};
