// Import necessary components and contexts
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

// Define the DashboardLayout component
export const DashboardLayout = () => {
  // Get the dark mode state from the AppContext
  const { darkMode } = useApp();

  // Initialize the sidebar open state
  const [isOpen, setIsOpen] = useState(false);

  // Define the sidebar trigger button styles
  const triggerButtonStyles = {
    variant: "ghost",
    className: `rounded-full w-8 h-8 ${
      darkMode
        ? "text-indigo-300 hover:bg-indigo-800/30"
        : "text-blue-700 hover:bg-blue-100"
    }`,
  };

  // Define the sidebar trigger button aria label
  const triggerButtonAriaLabel = "Toggle sidebar";

  // Return the JSX element
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Trigger */}
      <div className="absolute z-20 top-2 left-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              {...triggerButtonStyles}
              aria-label={triggerButtonAriaLabel}
            >
              <PanelLeftOpen className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <DashboardSidebar setIsOpen={setIsOpen} />
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 transition-all">
        <Outlet />
      </main>
    </div>
  );
};

// Export the DashboardLayout component as the default export
export default DashboardLayout;
