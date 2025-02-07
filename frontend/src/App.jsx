import { Routes, Route, Navigate } from "react-router-dom";

import { useApp } from "./contexts/AppContext";
import { useUser } from "./contexts/UserContext";

import { ProtectedRoute } from "./components/shared/ProtectedRoute";

import { MainLayout } from "./layout/MainLayout";
import { AuthLayout } from "./layout/AuthLayout";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { VerifyOtpPage } from "./pages/auth/VerifyOtpPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { WorkerDashboard } from "./pages/worker/WorkerDashboard";
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";
import ResendOtpPage from "./pages/auth/ResendOtpPage";
import DashboardLayout from "./layout/DashboardLayout";

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
        {user ? (
          <Route
            path="*"
            element={<Navigate to={`/dashboard/${user.role}`} replace />}
          />
        ) : (
          <Route element={<AuthLayout />}>
            {/* Join */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* verify email */}
            <Route path="verify-email" element={<VerifyOtpPage />} />
            <Route path="/resend-otp" element={<ResendOtpPage />} />

            {/* reset Password */}
            <Route path="forget-password" element={<ForgetPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        )}

        {/* Protected Dashboard Routes Inside Layout */}
        <Route element={<DashboardLayout />}>
          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
            <Route
              path="/dashboard/customer/products"
              element={<div>ProductsPage</div>}
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          {/* Worker Routes */}
          <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
            <Route path="/dashboard/worker" element={<WorkerDashboard />} />
          </Route>
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
