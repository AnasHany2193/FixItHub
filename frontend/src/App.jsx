import { Navigate, Route, Routes } from "react-router-dom";
import {
  AuthGuard,
  PublicGuard,
  RoleGuard,
} from "./components/auth/RouteGuards";

import AuthLayout from "./components/layout/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicGuard />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyOTPPage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        <Route element={<RoleGuard allowedRoles={["customer"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={["worker"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Common Public Routes */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
