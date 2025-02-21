import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="fixed z-50 p-2 transition-all duration-300 border rounded-full shadow-lg backdrop-blur-lg bottom-4 left-4 hover:scale-110 focus:outline-none focus:ring-2"
      style={{
        borderColor: darkMode
          ? "rgba(99, 102, 241, 0.2)"
          : "rgba(96, 165, 250, 0.2)",
        backgroundColor: darkMode
          ? "rgba(30, 41, 59, 0.3)"
          : "rgba(255, 255, 255, 0.3)",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        key={darkMode ? "sun" : "moon"}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 45, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? (
          <SunIcon className="w-5 h-5 text-indigo-300" />
        ) : (
          <MoonIcon className="w-5 h-5 text-blue-600" />
        )}
      </motion.div>
    </motion.button>
  );
}
