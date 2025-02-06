import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (You can add navigation for different roles here) */}
      <aside className="w-64 p-4 text-white bg-gray-800">
        <h2 className="text-xl font-bold">Dashboard</h2>
        {/* Navigation can be role-based */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
