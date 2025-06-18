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

// Main Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Customer
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NewRepairPage from "./pages/customer/repairs/NewRepairPage";
import EditRepairPage from "./pages/customer/repairs/EditRepairPage";
import RepairDetailsPage from "./pages/customer/repairs/RepairDetailsPage";
import RepairHistoryPage from "./pages/customer/repairs/RepairHistoryPage";
import RepairRequestsPage from "./pages/customer/repairs/RepairRequestsPage";

import OrderDetailsPage from "./pages/customer/products/OrderDetailsPage";
import CustomerOrdersPage from "./pages/customer/products/CustomerOrdersPage";
import CartAndFavoritesPage from "./pages/customer/products/CartAndFavoritesPage";
import CustomerMarketplacePage from "./pages/customer/products/CustomerMarketplacePage";
import CustomerMarketplaceDetailsPage from "./pages/customer/products/CustomerMarketplaceDetailsPage";

// Worker
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import FindRepairsPage from "./pages/worker/repairs/FindRepairsPage";
import WorkerHistoryPage from "./pages/worker/repairs/WorkerHistoryPage";
import WorkerRepairDetailPage from "./pages/worker/repairs/WorkerRepairDetailPage";
import WorkerActiveRepairsPage from "./pages/worker/repairs/WorkerActiveRepairsPage";
import WorkerActiveRepairDetailsPage from "./pages/worker/repairs/WorkerActiveRepairDetailsPage";

import AddProductPage from "./pages/worker/products/AddProductPage";
import ProductListPage from "./pages/worker/products/ProductListPage";
import UpdateProductPage from "./pages/worker/products/UpdateProductPage";
import WorkerProductDetailsPage from "./pages/worker/products/WorkerProductDetailsPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminRepairsPage from "./pages/admin/AdminRepairsPage";
import AdminRepairDetailsPage from "./pages/admin/AdminRepairDetailsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductDetailsPage from "./pages/admin/AdminProductDetailsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";

// Public
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
            <Route path="/repairs">
              <Route path="new" element={<NewRepairPage />} />
              <Route path="history" element={<RepairHistoryPage />} />
              <Route path="all" element={<RepairRequestsPage />} />
              <Route path=":id" element={<RepairDetailsPage />} />
              <Route path=":id/edit" element={<EditRepairPage />} />
            </Route>
            <Route path="/marketplace">
              <Route path="products" element={<CustomerMarketplacePage />} />
              <Route
                path="products/:productId"
                element={<CustomerMarketplaceDetailsPage />}
              />
              <Route path="collections" element={<CartAndFavoritesPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailsPage />} />
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
            <Route path="/marketplace">
              <Route path="my-products" element={<ProductListPage />} />
              <Route
                path="my-products/:productId"
                element={<WorkerProductDetailsPage />}
              />
              <Route path="new-product" element={<AddProductPage />} />
              <Route
                path="edit-product/:productId"
                element={<UpdateProductPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin">
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="repairs" element={<AdminRepairsPage />} />
              <Route path="repairs/:id" element={<AdminRepairDetailsPage />} />

              {/* Product Routes */}
              <Route path="products" element={<AdminProductsPage />} />
              <Route
                path="products/:id"
                element={<AdminProductDetailsPage />}
              />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>
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
