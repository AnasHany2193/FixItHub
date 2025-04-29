import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Activity,
  Briefcase,
  Clock,
  Cog,
  Gavel,
  Handshake,
  History,
  LayoutDashboard,
  List,
  Package,
  PackageCheck,
  PackageSearch,
  Plus,
  PlusCircle,
  PocketKnife,
  Search,
  Settings,
  ShoppingBasket,
  ShoppingCart,
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
            name: "Active Products",
            path: "/marketplace/products",
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
          },
          {
            path: "/repairs/history",
            name: "Repair History",
            icon: <History className="w-4 h-4" />,
          },
          {
            path: "/repairs/new",
            name: "New Request",
            icon: <Plus className="w-4 h-4" />,
            variant: "success",
          },
        ],
      },
      {
        type: "group",
        name: "Marketplace",
        icon: <ShoppingCart className="w-5 h-5" />,
        items: [
          {
            path: "/marketplace/products",
            name: "Browse Products",
            icon: <PackageSearch className="w-4 h-4" />,
          },
          {
            path: "/marketplace/collections",
            name: "Collections",
            icon: <ShoppingBasket className="w-4 h-4" />,
            badge: "cart",
          },
          {
            path: "/marketplace/orders",
            name: "My Orders",
            icon: <PackageCheck className="w-4 h-4" />,
          },
        ],
      },
    ],
    worker: [
      {
        type: "dashboard",
        path: "/worker-dashboard",
        name: "Work Hub",
        icon: <Briefcase className="w-5 h-5" />,
        quickActions: [
          {
            name: "Active Jobs",
            path: "/repairs/active",
            icon: <Wrench className="w-4 h-4" />,
          },
          {
            name: "New Opportunities",
            path: "/repairs/auctions",
            icon: <Zap className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Find Work",
        icon: <Search className="w-5 h-5" />,
        items: [
          {
            path: "/repairs/auctions",
            name: "Live Auctions",
            icon: <Gavel className="w-4 h-4" />,
            badge: "live",
            description: "Bid on repair projects",
          },
          {
            path: "/repairs/direct-offers",
            name: "Direct Repairs",
            icon: <Handshake className="w-4 h-4" />,
            badge: "new",
            description: "Immediate repair offers",
          },
        ],
      },
      {
        type: "group",
        name: "My Repairs",
        icon: <PocketKnife className="w-5 h-5" />,
        items: [
          {
            path: "/repairs/active",
            name: "Active Jobs",
            icon: <Activity className="w-4 h-4" />,
            description: "Currently assigned repairs",
          },
          {
            path: "/repairs/worker-history",
            name: "Work History",
            icon: <History className="w-4 h-4" />,
            description: "Finished repair history",
          },
        ],
      },
      {
        type: "group",
        name: "My Products",
        icon: <Package className="w-5 h-5" />,
        items: [
          {
            path: "/marketplace/my-products",
            name: "Product Listings",
            icon: <List className="w-4 h-4" />,
          },
          {
            path: "/marketplace/new-product",
            name: "Add Product",
            icon: <Plus className="w-4 h-4" />,
            variant: "success",
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
