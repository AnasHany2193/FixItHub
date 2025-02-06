import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useApp } from "@/contexts/AppContext";
import { useUser } from "@/contexts/UserContext";

export const MainLayout = () => {
  const location = useLocation();
  const { darkMode, changeMode } = useApp();
  const { user, logout } = useUser();

  return (
    <div className="w-full min-h-screen text-gray-800 bg-gradient-to-br from-blue-300 via-gray-300 to-gray-800 dark:from-indigo-900 dark:via-gray-700 dark:to-black dark:text-gray-200">
      {/* Main NavBar */}
      <nav className="fixed z-10 flex items-center justify-between w-full px-6 py-3 shadow-md bg-inherit dark:text-gray-200">
        {/* Logo */}
        <div className="hidden md:flex">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-indigo-300">
            FixItHub
          </h1>
        </div>

        {/* Routes */}
        <div className="flex gap-6 text-lg font-medium">
          <Link
            className={`pb-1 border-b-2 ${
              location.pathname === "/"
                ? "border-indigo-900 dark:border-blue-300"
                : "border-transparent hover:border-gray-500 dark:hover:border-gray-300"
            }`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`pb-1 border-b-2 ${
              location.pathname === "/about"
                ? "border-indigo-900 dark:border-blue-300"
                : "border-transparent hover:border-gray-500 dark:hover:border-gray-300"
            }`}
            to="/about"
          >
            About
          </Link>

          {user && (
            <Link
              className={`pb-1 border-b-2 ${
                location.pathname === "/dashboard"
                  ? "border-indigo-900 dark:border-blue-300"
                  : "border-transparent hover:border-gray-500 dark:hover:border-gray-300"
              }`}
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Sign In and Register */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Button
                onClick={logout}
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white dark:border-red-300 dark:text-red-300 dark:hover:bg-red-300 dark:hover:text-black"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="pb-1 border-b-2 border-transparent hover:border-blue-500 dark:hover:border-indigo-400"
              >
                Join Us
              </Link>
              <Separator
                orientation="vertical"
                className="h-5 bg-gray-600 dark:bg-gray-400"
              />
              <Link
                to="/login"
                className="pb-1 border-b-2 border-transparent hover:border-blue-500 dark:hover:border-indigo-400"
              >
                Login
              </Link>
            </>
          )}

          <Separator
            orientation="vertical"
            className="h-5 bg-gray-600 dark:bg-gray-400"
          />

          {/* Dark Mode Toggle */}
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
