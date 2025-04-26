import { Navigate, Route, Routes } from "react-router-dom";
import {
  AuthGuard,
  PublicGuard,
  RoleGuard,
} from "./components/auth/RouteGuards";

import AuthLayout from "./components/layout/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";
import ResendOtpPage from "./pages/auth/ResendOtpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage";

import DashboardLayout from "./components/layout/DashboardLayout";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NewRepairPage from "./pages/customer/NewRepairPage";
import EditRepairPage from "./pages/customer/EditRepairPage";
import RepairRequestsPage from "./pages/customer/RepairRequestsPage";
import RepairDetailsPage from "./pages/customer/RepairDetailsPage";
import RepairHistoryPage from "./pages/customer/RepairHistoryPage";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import FindRepairsPage from "./pages/worker/FindRepairsPage";
import WorkerActiveRepairsPage from "./pages/worker/WorkerActiveRepairsPage";
import WorkerRepairDetailPage from "./pages/worker/WorkerRepairDetailPage";
import WorkerRepairDetailsPage from "./pages/worker/WorkerRepairDetailsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicGuard />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyOTPPage />} />
          <Route path="/resend-otp" element={<ResendOtpPage />} />
          <Route path="/forgot-password" element={<ForgetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        <Route element={<RoleGuard allowedRoles={["customer"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/repairs/new" element={<NewRepairPage />} />
            <Route path="/repairs/history" element={<RepairHistoryPage />} />
            <Route path="/repairs/all" element={<RepairRequestsPage />} />
            <Route path="/repairs/:id" element={<RepairDetailsPage />} />
            <Route path="/repairs/:id/edit" element={<EditRepairPage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={["worker"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />

            <Route
              path="/repairs/auctions"
              element={<FindRepairsPage type="auctions" />}
            />
            <Route
              path="/repairs/direct-offers"
              element={<FindRepairsPage type="direct-offers" />}
            />

            <Route
              path="/repairs/auctions/:id"
              element={<WorkerRepairDetailPage type="auction" />}
            />
            <Route
              path="/repairs/direct-offers/:id"
              element={<WorkerRepairDetailPage type="offer" />}
            />

            <Route
              path="/repairs/active"
              element={<WorkerActiveRepairsPage />}
            />
            <Route
              path="/repairs/active/:id"
              element={<WorkerRepairDetailsPage />}
            />
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
        <Route path="/how-it-works" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
