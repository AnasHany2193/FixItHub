import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router";

export const MainLayout = () => {
  const navigate = useNavigate();
  const { darkMode, changeMode } = useApp();

  return (
    <div className="w-full dark:bg-slate-800 dark:text-gray-400">
      {/* Main NavBar */}
      <nav className="flex justify-between w-full gap-5 px-5 py-3 shadow-md">
        <div className="flex">
          <p
            className="px-5 py-1 text-lg font-bold rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </p>
          <p
            className="px-5 py-1 text-lg font-bold rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => {
              navigate("/about");
            }}
          >
            About
          </p>
        </div>

        <div className="flex">
          <p
            className="px-5 py-1 text-lg font-bold rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => {
              navigate("/");
            }}
          >
            Sign In
          </p>
          <p
            className="px-5 py-1 text-lg font-bold rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => {
              navigate("/about");
            }}
          >
            Register
          </p>

          <Button
            onClick={() => {
              changeMode();
            }}
            className="p-2 text-xl rounded-full cursor-pointer dark:bg-gray-800 hover:drop-shadow-lg"
          >
            {darkMode ? "🌞" : "🌙"}
          </Button>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};
