import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  const { darkMode, changeMode } = useApp();

  return (
    <div className="flex items-center justify-center w-full min-h-screen dark:bg-gradient-to-tl dark:from-indigo-900/90 dark:via-gray-800 dark:to-black bg-gradient-to-tr from-blue-300 via-gray-300 to-gray-600">
      {/* Auth Card */}
      <Card className="relative w-full max-w-md p-8 border border-blue-200 backdrop-blur-lg dark:bg-indigo-900/30 dark:border-indigo-800 bg-white/80">
        {/* Decorative Light */}
        <div className="absolute w-24 h-24 bg-blue-400 rounded-full opacity-50 -top-6 -left-6 blur-xl dark:bg-indigo-600" />

        {/* Login || Register */}
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
