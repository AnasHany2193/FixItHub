import { Routes, Route, Navigate } from "react-router-dom";

import { useApp } from "./contexts/AppContext";
import { useUser } from "./contexts/UserContext";

import { ProtectedRoute } from "./components/shared/ProtectedRoute";

import { MainLayout } from "./layout/MainLayout";
import { AuthLayout } from "./layout/AuthLayout";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";

import { RegisterPage } from "./pages/auth/RegisterPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { WorkerDashboard } from "./pages/worker/WorkerDashboard";
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import LoginPage from "./pages/auth/LoginPage";

function App() {
  const { user } = useUser();
  const { darkMode } = useApp();

  return (
    <main className={`min-h-screen font-JosefinSans ${darkMode ? "dark" : ""}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Auth Routes: accessible only if NOT authenticated */}
        {!user ? (
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}

        {/* Protected Routes: requires authentication and may be role-specific */}
        {/* Admin protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          {/* Admin protected routes */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          {/* other admin routes */}
        </Route>

        {/* Worker protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
          <Route path="worker/dashboard" element={<WorkerDashboard />} />
          {/* other worker routes */}
        </Route>

        {/* Customer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="customer/dashboard" element={<CustomerDashboard />} />
          {/* other customer routes */}
        </Route>

        {/* Catch-All Route */}
        <Route
          path="*"
          element={
            <div className="w-full p-6 font-bold text-center text-red-600">
              Not Found
            </div>
          }
        />
      </Routes>
    </main>
  );
}

export default App;
