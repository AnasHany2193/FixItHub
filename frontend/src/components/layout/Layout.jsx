import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../common/Header";
import Footer from "../common/Footer";
import ThemeToggle from "../common/ThemeToggle";

const Layout = () => {
  // Then in your component:
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900 font-JosefinSans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-[calc(100vh-160px)] bg-gradient-to-b from-white/50 via-transparent to-transparent dark:from-gray-900/50"
      >
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            className="space-y-8"
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <Footer />
      <ThemeToggle />
    </div>
  );
};

export default Layout;
