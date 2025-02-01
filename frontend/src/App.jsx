import { Routes, Route } from "react-router";
import { useApp } from "./contexts/AppContext";

function App() {
  const { darkMode, changeMode } = useApp();

  return (
    <main className={`${darkMode ? "dark" : ""} flex min-h-screen`}>
      <Routes>
        <Route
          index
          path="/"
          element={
            <div className="dark:bg-slate-800 dark:text-gray-400">
              Home Page
              <button
                onClick={changeMode}
                className="fixed p-2 text-xl bg-green-100 rounded-full bottom-4 left-4 dark:bg-gray-800 cursor-pointer hover:drop-shadow-lg"
              >
                {darkMode ? "🌞" : "🌙"}
              </button>
            </div>
          }
        />
        <Route index path="/about" element={<div>About Page</div>} />
      </Routes>
    </main>
  );
}

export default App;
