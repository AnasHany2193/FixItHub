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
import WorkerActiveRepairDetailsPage from "./pages/worker/WorkerActiveRepairDetailsPage";
import WorkerHistoryPage from "./pages/worker/WorkerHistoryPage";

import ProductListPage from "./pages/worker/ProductListPage";
import AddProductPage from "./pages/worker/AddProductPage";

import AdminDashboard from "./pages/admin/AdminDashboard";

import Layout from "./components/layout/Layout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import UpdateProductPage from "./pages/worker/UpdateProductPage";

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
            <Route path="/repairs">
              <Route path="new" element={<NewRepairPage />} />
              <Route path="history" element={<RepairHistoryPage />} />
              <Route path="all" element={<RepairRequestsPage />} />
              <Route path=":id" element={<RepairDetailsPage />} />
              <Route path=":id/edit" element={<EditRepairPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={["worker"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/repairs">
              <Route
                path="auctions"
                element={<FindRepairsPage type="auctions" />}
              />
              <Route
                path="direct-offers"
                element={<FindRepairsPage type="direct-offers" />}
              />
              <Route path="worker-history" element={<WorkerHistoryPage />} />
              <Route
                path="auctions/:id"
                element={<WorkerRepairDetailPage type="auction" />}
              />
              <Route
                path="direct-offers/:id"
                element={<WorkerRepairDetailPage type="offer" />}
              />
              <Route path="active" element={<WorkerActiveRepairsPage />} />
              <Route
                path="active/:id"
                element={<WorkerActiveRepairDetailsPage />}
              />
            </Route>
            <Route
              path="/marketplace/my-products"
              element={<ProductListPage />}
            />
            <Route
              path="/marketplace/new-product"
              element={<AddProductPage />}
            />
            <Route
              path="/marketplace/edit-product/:productId"
              element={<UpdateProductPage />}
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
