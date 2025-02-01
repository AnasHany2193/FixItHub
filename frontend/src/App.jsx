import { Routes, Route } from "react-router";
import { useApp } from "./contexts/AppContext";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";

function App() {
  const { darkMode } = useApp();

  return (
    <main className={`${darkMode ? "dark" : ""} flex min-h-screen`}>
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route index path="/about" element={<AboutPage />} />
      </Routes>
    </main>
  );
}

export default App;
