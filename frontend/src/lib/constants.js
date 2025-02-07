import {
  Drill,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Star,
} from "lucide-react";

export const customerNavigationItems = [
  {
    category: "General",
    items: [
      { name: "Dashboard", icon: Menu, path: "/dashboard/customer" },
      {
        name: "Browse Products",
        icon: ShoppingCart,
        path: "/dashboard/customer/products",
      },
    ],
  },
  {
    category: "My Activity",
    items: [
      {
        name: "My Purchases",
        icon: Package,
        path: "/dashboard/customer/purchases",
      },
      {
        name: "Repair Requests",
        icon: Drill,
        path: "/dashboard/customer/repairs",
      },
      {
        name: "Messages",
        icon: MessageSquare,
        path: "/dashboard/customer/messages",
      },
      {
        name: "Reviews & Ratings",
        icon: Star,
        path: "/dashboard/customer/reviews",
      },
    ],
  },
  {
    category: "Settings",
    items: [
      {
        name: "Settings",
        icon: Settings,
        path: "/dashboard/customer/settings",
      },
    ],
  },
];
