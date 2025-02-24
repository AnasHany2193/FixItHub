// frontend/src/components/layout/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import {
  Activity,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Cog,
  CreditCard,
  FileText,
  Flag,
  Gavel,
  Hand,
  Heart,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  Package,
  Plus,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

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
            path: "/requests/new",
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
            path: "/requests/active",
            name: "Active Requests",
            icon: <Clock className="w-4 h-4" />,
            badge: 3, // Ongoing repairs
          },
          {
            path: "/requests/history",
            name: "Repair History",
            icon: <History className="w-4 h-4" />,
            progress: 2, // Completed repairs
          },
          {
            path: "/requests/new",
            name: "New Request",
            icon: <Plus className="w-4 h-4" />,
            variant: "success",
          },
        ],
      },
      {
        type: "group",
        name: "Auctions & Bids",
        icon: <Gavel className="w-5 h-5" />,
        items: [
          {
            path: "/auctions/active",
            name: "Active Auctions",
            icon: <Zap className="w-4 h-4" />,
            badge: 5,
          },
          {
            path: "/bids/active",
            name: "My Bids",
            icon: <Hand className="w-4 h-4" />,
          },
          {
            path: "/auctions/won",
            name: "Won Auctions",
            icon: <Award className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Marketplace",
        icon: <ShoppingCart className="w-5 h-5" />,
        items: [
          {
            path: "/products",
            name: "Browse Products",
            icon: <Search className="w-4 h-4" />,
          },
          {
            path: "/wishlist",
            name: "Wishlist",
            icon: <Heart className="w-4 h-4" />,
          },
          {
            path: "/orders",
            name: "Purchase History",
            icon: <Package className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Financials",
        icon: <Wallet className="w-5 h-5" />,
        items: [
          {
            path: "/payments/methods",
            name: "Payment Methods",
            icon: <CreditCard className="w-4 h-4" />,
          },
          {
            path: "/transactions",
            name: "Transaction History",
            icon: <ListOrdered className="w-4 h-4" />,
          },
          {
            path: "/invoices",
            name: "Tax Invoices",
            icon: <FileText className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "group",
        name: "Community",
        icon: <Users className="w-5 h-5" />,
        items: [
          {
            path: "/reviews",
            name: "My Reviews",
            icon: <Star className="w-4 h-4" />,
          },
          {
            path: "/reports",
            name: "Reports",
            icon: <Flag className="w-4 h-4" />,
          },
          {
            path: "/support",
            name: "Live Support",
            icon: <LifeBuoy className="w-4 h-4" />,
          },
        ],
      },
      {
        type: "settings",
        path: "/settings",
        name: "Account Settings",
        icon: <Settings className="w-5 h-5" />,
        subsections: ["Profile", "Security", "Notifications", "Preferences"],
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
