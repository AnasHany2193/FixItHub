import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

export default function Layout() {
  const { isLoading, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo & Nav links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                FixItHub
              </Link>
              <div className="items-center hidden space-x-4 md:flex">
                <Link to="/" className="dark:text-gray-300">
                  Home
                </Link>
                <Link to="/about" className="dark:text-gray-300">
                  About
                </Link>
                <Link to="/contact" className="dark:text-gray-300">
                  Contact
                </Link>
              </div>
            </div>

            {/* Right side - Auth/User controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {isLoading ? (
                <LoadingSpinner />
              ) : user ? (
                <div className="relative group">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                  <div className="absolute right-0 w-48 py-1 mt-2 transition-opacity bg-white rounded-md shadow-lg opacity-0 dark:bg-gray-800 group-hover:opacity-100">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      Hi, {user?.username}
                    </div>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="inline w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login">
                    <Button variant="outline" className="dark:text-gray-300">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Outlet />
        <ThemeToggle />
      </main>
    </div>
  );
}
