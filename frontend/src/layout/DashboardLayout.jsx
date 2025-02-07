import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

export const DashboardLayout = () => {
  const { darkMode } = useApp();

  return (
    <div
      className={`flex min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Sidebar Trigger */}
      <div className="absolute z-20 top-2 left-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="w-8 h-8 transition-all bg-white rounded-full shadow-md hover:bg-gray-200"
              aria-label="Toggle sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <DashboardSidebar />
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 transition-all">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
