import { Link, Outlet } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useApp } from "@/contexts/AppContext";

export const AuthLayout = () => {
  const { darkMode, changeMode } = useApp();

  return (
    <div className="flex items-center justify-center w-full min-h-screen dark:bg-gradient-to-tl dark:from-indigo-900/90 dark:via-gray-800 dark:to-black bg-gradient-to-tr from-blue-300 via-gray-300 to-gray-600">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed z-20 text-base text-blue-500 rounded-full md:text-xl top-4 left-4 hover:text-blue-600 dark:text-indigo-400 dark:hover:text-indigo-300 md:block"
      >
        ← Back to Home Page
      </Link>

      {/* Auth Card */}
      <Card className="relative w-full max-w-md px-8 mx-auto overflow-auto border border-blue-200 max-h-[95vh] backdrop-blur-lg dark:bg-indigo-900/30 dark:border-indigo-800 bg-white/80 min-h-[450px] flex flex-col justify-evenly">
        {/* Decorative Light */}
        <div className="absolute w-24 h-24 bg-blue-400 rounded-full opacity-50 -top-6 -left-6 blur-xl dark:bg-indigo-600" />
        <Outlet />
      </Card>

      <Button
        onClick={changeMode}
        variant="icon"
        size="sm"
        className="fixed text-xl rounded-full bottom-4 left-4"
      >
        {darkMode ? "🌞" : "🌙"}
      </Button>
    </div>
  );
};
