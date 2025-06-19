import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Moon,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../ui/separator";
import { Logo, TextLogo } from "../common/Logo";
import { useState } from "react";

const Sidebar = ({
  isCollapsed,
  toggleCollapse,
  user,
  navItems,
  darkMode,
  toggleDarkMode,
  logout,
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Get role-specific quick actions
  const quickActions =
    navItems.find((item) => item.type === "dashboard")?.quickActions || [];

  const renderQuickActions = () => (
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 mb-4 space-y-2 rounded-lg bg-indigo-50 dark:bg-gray-700"
        >
          {quickActions.map((action) => (
            <NavLink
              key={action.path}
              to={action.path}
              className="flex items-center p-2 text-sm transition-colors rounded-md hover:bg-indigo-100 dark:hover:bg-gray-600"
            >
              {action.icon}
              <span className="ml-2">{action.name}</span>
            </NavLink>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupName) ? next.delete(groupName) : next.add(groupName);
      return next;
    });
  };

  const renderNavItem = (item, level = 0) => {
    if (item.type === "group") {
      return (
        <div key={item.name} className="space-y-1">
          <button
            onClick={() => toggleGroup(item.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleGroup(item.name);
            }}
            aria-expanded={expandedGroups.has(item.name)}
            aria-controls={`group-${item.name}`}
            className={`flex items-center w-full p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${
              level > 0 ? "pl-8" : ""
            } ${
              expandedGroups.has(item.name)
                ? "bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center flex-1 gap-3">
              {item.icon}
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{item.name}</span>
                  <motion.div
                    animate={{
                      rotate: expandedGroups.has(item.name) ? 180 : 0,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </div>
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedGroups.has(item.name) && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-3 space-y-1 border-l-2 border-indigo-300 rounded-lg dark:border-gray-700"
              >
                {item.items.map((subItem) => renderNavItem(subItem, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center p-3 rounded-lg transition-colors pl-3 ${
            isActive
              ? "bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          } ${!isCollapsed ? "px-4" : "justify-center"} ${level ? "pl-6" : ""}`
        }
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          {item.icon}
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.name}</span>
              {item.badge && (
                <span className="px-2 text-xs text-indigo-600 bg-indigo-100 rounded-full dark:bg-gray-700 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </motion.span>
      </NavLink>
    );
  };

  return (
    <motion.aside
      className="sticky top-0 h-screen bg-white border-r dark:bg-gray-800 dark:border-gray-700"
      animate={{
        width: isCollapsed ? 80 : 270,
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col h-full p-4">
        <SidebarHeader
          user={user}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        {/* Navigation Items */}
        <nav className="flex-1 px-1 space-y-1 overflow-auto">
          {renderQuickActions()}
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <SidebarFooter
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          logout={logout}
          isCollapsed={isCollapsed}
        />
      </div>
    </motion.aside>
  );
};

export const SidebarHeader = ({ user, isCollapsed, toggleCollapse }) => (
  <>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center mt-2"
    >
      <Link to="/" className="flex items-center gap-2">
        {isCollapsed ? <Logo /> : <TextLogo />}
      </Link>
    </motion.div>

    <Separator />

    <div className="flex items-center gap-3">
      <Link to="profile">
        <Avatar className="border-2 border-indigo-100 cursor-pointer dark:border-gray-600">
          <AvatarImage
            src={user?.profile?.avatar?.url}
            className="object-cover"
          />
          <AvatarFallback className="text-gray-800 bg-indigo-100 dark:bg-gray-700 dark:text-white">
            {user?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Collapse button */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
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

      <motion.button
        onClick={toggleCollapse}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 transition-all group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="absolute inset-0 top-0 transition-opacity rounded-full right-3 -left-3 bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-gray-600 dark:to-gray-800 opacity-10 group-hover:opacity-20" />
        <div className="relative z-10 p-1.5 -left-3 right-3 border border-gray-200 rounded-full shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm dark:border-gray-700">
          <motion.div
            key={String(isCollapsed)}
            initial={{ rotate: isCollapsed ? -180 : 0 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {isCollapsed ? (
              <PanelRightClose className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </motion.div>
        </div>
        {isCollapsed && (
          <div className="absolute px-2 py-1 ml-2 text-xs font-medium transition-opacity -translate-y-1/2 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 left-full top-1/2 dark:bg-gray-800 dark:border-gray-700 group-hover:opacity-100">
            {isCollapsed ? "Expand" : "Collapse"}
          </div>
        )}
      </motion.button>
    </div>

    <Separator />
  </>
);

export const SidebarFooter = ({
  darkMode,
  toggleDarkMode,
  logout,
  isCollapsed,
}) => (
  <>
    <Separator />

    <div className="space-y-2">
      <motion.button
        onClick={toggleDarkMode}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle dark mode"
        className="flex items-center w-full px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        {!isCollapsed && <span className="ml-3 text-sm">Toggle Theme</span>}
      </motion.button>

      <motion.button
        onClick={logout}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center w-full px-3 py-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <LogOut className="w-5 h-5" />
        {!isCollapsed && <span className="ml-3 text-sm">Logout</span>}
        {isCollapsed && (
          <div className="absolute px-2 py-1 ml-2 text-xs font-medium transition-opacity -translate-y-1/2 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 left-full top-1/2 dark:bg-gray-800 dark:border-gray-700 group-hover:opacity-100">
            Logout
          </div>
        )}
      </motion.button>
    </div>
  </>
);

export default Sidebar;
