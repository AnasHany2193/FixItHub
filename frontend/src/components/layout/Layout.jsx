import { Outlet } from "react-router-dom";

import Header from "../common/Header";
import ThemeToggle from "../common/ThemeToggle";
import Footer from "../common/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900 font-JosefinSans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
      <ThemeToggle />
    </div>
  );
};

export default Layout;
