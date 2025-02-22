// Sidebar.jsx
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../ui/separator";
import { Logo, TextLogo } from "../common/Logo";

const Sidebar = ({
  isCollapsed,
  toggleCollapse,
  user,
  navItems,
  darkMode,
  toggleDarkMode,
  logout,
}) => {
  return (
    <motion.aside
      className="sticky top-0 h-screen bg-white border-r dark:bg-gray-800 dark:border-gray-700"
      animate={{
        width: isCollapsed ? 80 : 240,
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo Section */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center mt-2"
        >
          <Link to="/" className="flex items-center gap-2">
            {isCollapsed ? (
              <Logo className="w-8 h-8" />
            ) : (
              <TextLogo className="w-10 h-10" />
            )}
          </Link>
        </motion.div>

        <Separator />

        {/* Header Section */}
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-indigo-100 dark:border-gray-600 ">
            <AvatarImage
              src={user?.profile?.avatar?.url}
              className="object-cover"
            />
            <AvatarFallback className="text-gray-800 bg-indigo-100 dark:bg-gray-700 dark:text-white">
              {user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              <h3 className="font-medium capitalize dark:text-white">
                {user?.username}
              </h3>
              <p className="text-sm text-gray-500 capitalize dark:text-gray-400">
                {user?.role}
              </p>
            </motion.div>
          )}

          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {isCollapsed ? (
              <PanelRightClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        <Separator />

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                } ${isCollapsed ? "justify-center" : "px-4"}`
              }
            >
              <motion.span whileHover={{ scale: 1.05 }}>
                {item.icon}
              </motion.span>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 text-sm"
                >
                  {item.name}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* Footer Actions */}
        <div className="pt-4 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {!isCollapsed && <span className="ml-3 text-sm">Toggle Theme</span>}
          </button>

          <button
            onClick={logout}
            className="flex items-center w-full p-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
