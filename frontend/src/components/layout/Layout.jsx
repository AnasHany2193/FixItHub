import { Outlet } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

export default function Layout() {
  return (
    <div className="min-h-screen text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100">
      <Outlet />
      <ThemeToggle />
    </div>
  );
}
