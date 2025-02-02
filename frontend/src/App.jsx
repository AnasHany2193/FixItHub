import { Routes, Route } from "react-router";
import { useApp } from "./contexts/AppContext";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { MainLayout } from "./layout/MainLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AuthLayout } from "./layout/AuthLayout";

function App() {
  const { darkMode } = useApp();

  return (
    <main
      className={`${darkMode ? "dark" : ""} flex min-h-screen font-JosefinSans`}
    >
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
