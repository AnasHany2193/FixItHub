import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

export const DashboardLayout = () => {
  const { darkMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex min-h-screen ${darkMode ? "bg-indigo-900/20" : "bg-blue-50"}`}
    >
      {/* Sidebar Trigger */}
      <div className="absolute z-20 top-2 left-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className={`rounded-full w-8 h-8 ${
                darkMode
                  ? "text-indigo-300 hover:bg-indigo-800/30"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
              aria-label="Toggle sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <DashboardSidebar setIsOpen={setIsOpen} />
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 transition-all bg-inherit">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
