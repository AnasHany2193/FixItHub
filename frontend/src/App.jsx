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
import CustomerProducts from "./pages/customer/Products";
import DashboardRedirect from "./components/shared/DashboardRedirect";
import RoleProtectedRoute from "./components/shared/RoleProtectedRoute";

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
            {/* Join in */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* verify email */}
            <Route path="verify-email" element={<VerifyOtpPage />} />
            <Route path="/resend-otp" element={<ResendOtpPage />} />

            {/* reset Password */}
            <Route path="forget-password" element={<ForgetPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}

        {/* Protected Routes: requires authentication and may be role-specific*/}
        {/* <Route path="dashboard" element={<DashboardLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
            <Route path="worker" element={<WorkerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="customer" element={<CustomerDashboard />} />
            <Route path="products" element={<CustomerProducts />} />
          </Route>
        </Route> */}

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "worker", "customer"]} />
          }
        >
          {/* Redirect to appropriate dashboard if needed */}
          <Route index element={<DashboardRedirect />} />

          {/* Customer Dashboard Route */}
          <Route
            path="customer"
            element={
              <RoleProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Standalone Customer Products Route */}
          <Route
            path="customer/products"
            element={
              <RoleProtectedRoute requiredRole="customer">
                <CustomerProducts />
              </RoleProtectedRoute>
            }
          />

          {/* Other Dashboard Routes */}
          <Route
            path="worker"
            element={
              <RoleProtectedRoute requiredRole="worker">
                <WorkerDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
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
