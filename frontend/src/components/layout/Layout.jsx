import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import { TextLogo } from "../common/Logo";

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!isAuthenticated) return "/login";
    return (
      {
        customer: "/dashboard",
        worker: "/worker-dashboard",
        admin: "/admin-dashboard",
      }[user?.role] || "/login"
    );
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-indigo-300 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 ">
              <TextLogo />
            </Link>

            {/* Desktop Navigation */}
            <div className="items-center hidden gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="border-2 border-indigo-100 h-9 w-9 dark:border-gray-600">
                      <AvatarImage
                        src={user?.profile.avatar.url}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-indigo-600 capitalize bg-indigo-100 dark:bg-gray-700 dark:text-indigo-300">
                        {user?.username?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.name}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user?.role?.toUpperCase()}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => navigate(getDashboardPath())}
                      className="cursor-pointer dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
                      <span className="dark:text-gray-200">Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 cursor-pointer dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden gap-2 md:flex">
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-indigo-300"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 md:hidden hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 bg-white border-b md:hidden top-16 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t dark:border-gray-700">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(getDashboardPath());
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 rounded-lg hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full px-4 py-2 text-left text-gray-700 rounded-lg hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="w-full px-4 py-2 text-left text-indigo-600 rounded-lg hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t dark:border-gray-700 dark:bg-gray-800">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/help"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Connect
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/twitter"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    to="/facebook"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link
                    to="/linkedin"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-12 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} FixItHub, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
};

export default Layout;
