// Import the icons you need from lucide-react:
import {
  Home,
  ShoppingCart,
  Package,
  Drill,
  MessageSquare,
  Star,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Link } from "react-router";

// Define your navigation items with name, icon component, and route path.
const navigationItems = [
  { name: "Home", icon: Home, path: "/dashboard/customer" },
  {
    name: "Browse Products",
    icon: ShoppingCart,
    path: "/dashboard/customer/products",
  },
  {
    name: "My Purchases",
    icon: Package,
    path: "/dashboard/customer/purchases",
  },
  { name: "Repair Requests", icon: Drill, path: "/dashboard/customer/repairs" },
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
  { name: "Settings", icon: Settings, path: "/dashboard/customer/settings" },
];

export const AppSidebar = () => {
  return (
    <Sidebar className="transition-all duration-300 ease-in-out">
      <SidebarHeader className="p-4 text-xl font-bold border-b border-gray-700">
        FixItHub
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
