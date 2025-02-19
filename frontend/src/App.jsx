import { Navigate, Route, Routes } from "react-router-dom";
import {
  AuthGuard,
  PublicGuard,
  RoleGuard,
} from "./components/auth/RouteGuards";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicGuard />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
