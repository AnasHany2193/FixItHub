import { Routes, Route } from "react-router";
import { useApp } from "./contexts/AppContext";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { MainLayout } from "./pages/public/MainLayout";

function App() {
  const { darkMode } = useApp();

  return (
    <main className={`${darkMode ? "dark" : ""} flex min-h-screen`}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
