import { Outlet } from "react-router-dom";

import { AppSheetSidebar } from "@/components/shared/AppSidebar";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const DashboardLayout = () => {
  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-100">
      <AppSheetSidebar />

      {/* This renders nested routes */}
      <Outlet />
    </main>
  );
};

export default DashboardLayout;
