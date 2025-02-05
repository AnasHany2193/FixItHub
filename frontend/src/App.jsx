import { Routes, Route } from "react-router-dom";
import { useApp } from "./contexts/AppContext";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { MainLayout } from "./layout/MainLayout";

import { AuthLayout } from "./layout/AuthLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AuthRoute } from "./components/shared/AuthRoute";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

function App() {
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
        <Route element={<AuthRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Protected Routes: requires authentication and may be role-specific */}
        {/* Admin protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          {/* Admin protected routes */}
          <Route
            path="admin/dashboard"
            element={
              <div className="w-full m-6 font-bold text-center">
                Admin Dashboard
              </div>
            }
          />
          {/* other admin routes */}
        </Route>

        {/* Worker protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
          <Route
            path="worker/dashboard"
            element={
              <div className="w-full m-6 font-bold text-center">
                Worker Dashboard
              </div>
            }
          />
          {/* other worker routes */}
        </Route>

        {/* Customer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route
            path="customer/dashboard"
            element={
              <div className="w-full m-6 font-bold text-center">
                Customer Dashboard
              </div>
            }
          />
          {/* other customer routes */}
        </Route>
      </Routes>
    </main>
  );
}

export default App;
