import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";

export const MainLayout = () => {
  const { darkMode, changeMode } = useApp();

  return (
    <div className="w-full text-gray-800">
      {/* Main NavBar */}
      <nav className="fixed z-10 flex items-center justify-between w-full gap-3 px-6 py-2 shadow-sm bg-inherit dark:text-gray-200">
        {/* Logo */}
        <div className="hidden md:flex">
          <h1 className="text-xl font-bold">FixItHub</h1>
        </div>

        {/* Routes */}
        <div className="flex gap-5">
          <Link
            className="border-indigo-900 hover:border-b dark:border-blue-300"
            to="/"
          >
            Home
          </Link>
          <Link
            className="border-indigo-900 hover:border-b dark:border-blue-300"
            to="about"
          >
            About
          </Link>
        </div>

        {/* Sign In and Register */}
        <div className="flex items-center gap-5">
          <Link
            to="login"
            className="border-indigo-900 hover:border-b dark:border-blue-300"
          >
            Sign In
          </Link>
          <Link
            to="register"
            className="border-indigo-900 hover:border-b dark:border-blue-300"
          >
            Register
          </Link>
          <Separator
            orientation="vertical"
            className="h-5 bg-indigo-900 dark:bg-blue-300"
          />
          <Button
            onClick={changeMode}
            variant="icon"
            size="sm"
            className="text-base"
          >
            {darkMode ? "🌞" : "🌙"}
          </Button>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};
