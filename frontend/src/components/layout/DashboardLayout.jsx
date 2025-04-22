import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Activity,
  Archive,
  Briefcase,
  Calendar,
  CalendarDays,
  Clock,
  Cog,
  DollarSign,
  Gavel,
  Handshake,
  History,
  LayoutDashboard,
  Plus,
  PlusCircle,
  PocketKnife,
  Search,
  Settings,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const roleConfig = {
    customer: [
      {
        type: "dashboard",
        path: "/dashboard",
        name: "Dashboard Overview",
        icon: <LayoutDashboard className="w-5 h-5" />,
        quickActions: [
          {
            name: "New Repair Request",
            path: "/repairs/new",
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            name: "Active Bids",
            path: "/bids/active",
            icon: <Activity className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Repair Services",
        icon: <Cog className="w-5 h-5" />,
        items: [
          {
            path: "/repairs/all",
            name: "Repair Requests",
            icon: <Clock className="w-4 h-4" />,
            badge: 3, // Ongoing repairs
          },
          {
            path: "/repairs/history",
            name: "Repair History",
            icon: <History className="w-4 h-4" />,
            progress: 2, // Completed repairs
          },
          {
            path: "/repairs/new",
            name: "New Request",
            icon: <Plus className="w-4 h-4" />,
            variant: "success",
          },
        ],
      },
    ],
    worker: [
      {
        type: "dashboard",
        path: "/worker-dashboard",
        name: "Work Dashboard",
        icon: <Briefcase className="w-5 h-5" />,
        quickActions: [
          {
            name: "Available Jobs",
            path: "/repairs/active",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            name: "My Earnings",
            path: "/earnings",
            icon: <DollarSign className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Repair Opportunities",
        icon: <Search className="w-5 h-5" />,
        items: [
          {
            path: "/repairs/auctions",
            name: "Auctions",
            icon: <Gavel className="w-4 h-4" />,
            badge: "live", // Indicates active auctions
          },
          {
            path: "/repairs/direct-offers",
            name: "Direct Offers",
            icon: <Handshake className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "My Work",
        icon: <PocketKnife className="w-5 h-5" />,
        items: [
          {
            path: "/repairs/active",
            name: "Active Jobs",
            icon: <Wrench className="w-4 h-4" />,
            badge: 2, // Number of active repairs
          },
          {
            path: "/repairs/history",
            name: "Job History",
            icon: <Archive className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Schedule",
        icon: <Calendar className="w-5 h-5" />,
        items: [
          {
            path: "/schedule/upcoming",
            name: "Upcoming",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            path: "/schedule/calendar",
            name: "Calendar View",
            icon: <CalendarDays className="w-4 h-4" />,
          },
        ],
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-JosefinSans">
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
