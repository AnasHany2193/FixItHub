// frontend/src/components/layout/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import {
  Briefcase,
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const roleConfig = {
    customer: [
      {
        path: "/dashboard",
        name: "Overview",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        path: "/requests",
        name: "Requests",
        icon: <Briefcase className="w-5 h-5" />,
      },
      {
        path: "/payments",
        name: "Payments",
        icon: <Wallet className="w-5 h-5" />,
      },
    ],
    worker: [
      {
        path: "/worker-dashboard",
        name: "Jobs",
        icon: <Briefcase className="w-5 h-5" />,
      },
      {
        path: "/schedule",
        name: "Schedule",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        path: "/earnings",
        name: "Earnings",
        icon: <Wallet className="w-5 h-5" />,
      },
    ],
    admin: [
      {
        path: "/admin-dashboard",
        name: "Analytics",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      { path: "/users", name: "Users", icon: <Users className="w-5 h-5" /> },
      {
        path: "/settings",
        name: "Settings",
        icon: <Settings className="w-5 h-5" />,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        user={user}
        navItems={roleConfig[user?.role] || []}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        logout={logout}
      />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
