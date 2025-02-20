import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed p-3 text-gray-800 transition-transform bg-gray-200 rounded-full shadow-lg bottom-4 left-4 dark:bg-gray-700 dark:text-gray-200 hover:scale-110"
    >
      {darkMode ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </button>
  );
}
