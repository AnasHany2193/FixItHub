import { Routes, Route } from "react-router-dom";
import { useApp } from "./contexts/AppContext";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { MainLayout } from "./layout/MainLayout";

import { AuthLayout } from "./layout/AuthLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

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

        <Route
          path="dashboard"
          element={
            <div className="w-full m-6 font-bold text-center">dashboard</div>
          }
        />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
