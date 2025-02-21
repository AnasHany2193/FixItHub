import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      // Add transition class to body
      document.documentElement.classList.add("theme-transition");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 300);
      return !prev;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.style.setProperty("--transition-duration", "300ms");

    return () => root.classList.remove("theme-transition");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div data-theme={darkMode ? "dark" : "light"} className="theme-container">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
