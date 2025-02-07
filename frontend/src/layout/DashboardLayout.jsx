import { Outlet, useNavigate } from "react-router-dom";

// Import the icons you need from lucide-react:
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";

export const DashboardLayout = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/dashboard/${user.role}`);
  }, [user, navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-4 bg-gray-50">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
