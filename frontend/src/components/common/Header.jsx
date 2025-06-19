import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, Settings, LogOut, User } from "lucide-react";

import { TextLogo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Animation configurations
const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 + 0.3, duration: 0.3 },
  }),
};

const mobileMenuVariants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  closed: { height: 0, opacity: 0 },
};

const mobileItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { darkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
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
    { name: "How It Works", path: "/how-it-works" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="sticky top-0 z-50 border-b border-indigo-300 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80"
    >
      <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Animated Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center gap-2">
              <TextLogo />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="items-center hidden gap-6 md:flex">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.path;
              return (
                <motion.div
                  key={link.name}
                  variants={navItemVariants}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors link-underline ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span
                        className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"
                        layoutId="underline"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 1,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={{ rotate: darkMode ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
            </motion.button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="relative border-2 border-indigo-100 h-9 w-9 dark:border-gray-600">
                      <motion.div
                        className="absolute inset-0 rounded-full shadow-lg"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <AvatarImage
                        src={user?.profile.avatar.url}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-indigo-600 capitalize bg-indigo-100 dark:bg-gray-700 dark:text-indigo-300">
                        {user?.username?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 dark:bg-gray-800 dark:border-gray-700"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="capitalize px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.username}
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
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
                      <span className="dark:text-gray-200">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 cursor-pointer dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden gap-2 md:flex">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-indigo-300"
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-indigo-100"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              aria-label="Toggle mobile menu"
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              className="p-2 text-gray-600 md:hidden hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Animated Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="overflow-hidden md:hidden dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div key={link.name} variants={mobileItemVariants}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg ${
                        isActive
                          ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-gray-700"
                          : "text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="pt-4 border-t dark:border-gray-700">
                {isAuthenticated ? (
                  <>
                    <motion.div variants={mobileItemVariants}>
                      <button
                        onClick={() => {
                          navigate(getDashboardPath());
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 rounded-lg hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Dashboard
                      </button>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={mobileItemVariants}>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full px-4 py-2 text-left text-gray-700 rounded-lg hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Sign In
                      </button>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <button
                        onClick={() => navigate("/signup")}
                        className="w-full px-4 py-2 text-left text-indigo-600 rounded-lg hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
                      >
                        Create Account
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
