import { motion } from "framer-motion";
import { Link, Outlet } from "react-router-dom";

import { Card } from "../ui/card";
import ThemeToggle from "../common/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen overflow-auto font-JosefinSans dark:bg-gradient-to-tl dark:from-indigo-900/95 dark:via-gray-800 dark:to-gray-900 bg-gradient-to-tr from-blue-200 via-gray-100/95 to-gray-200">
      {/* Animated background container */}
      <div className="absolute inset-0 h-full overflow-hidden">
        <motion.div
          className="absolute w-40 h-40 bg-indigo-400 rounded-full top-40 left-30 filter blur-2xl dark:bg-indigo-600"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-blue-600 rounded-full top-40 right-20 filter blur-2xl dark:bg-blue-600"
          animate={{
            x: [0, -100, 100, 0],
            y: [0, -50, 50, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-indigo-600 rounded-full bottom-20 left-40 filter blur-2xl dark:bg-indigo-600"
          animate={{
            x: [0, 120, -120, 0],
            y: [0, 60, -60, 0],
            rotate: [0, 180, 0],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative w-full md:min-w-96 px-8 py-5 mx-auto max-w-[95vw] overflow-auto border border-blue-200 max-h-[90vh] backdrop-blur-lg dark:bg-indigo-900/30 dark:border-indigo-800 bg-white/80 min-h-[450px] flex flex-col justify-evenly">
          <Outlet />

          {/* Add home navigation at bottom */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 link-underline"
            >
              ← Back to Home Page
            </Link>
          </div>
        </Card>
      </motion.div>
      {/* Theme toggle */}
      <ThemeToggle className="p-2 hover:bg-white/20 dark:hover:bg-indigo-900/30 rounded-xl" />
    </div>
  );
}
