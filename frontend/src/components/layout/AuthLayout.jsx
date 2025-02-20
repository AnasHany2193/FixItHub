import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";

import { TextLogo } from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

export const AuthLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden text-gray-900 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 font-JosefinSans">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-40 h-40 rounded-full md:w-64 md:h-64 -left-4 md:-left-8 top-4 bg-emerald-500 filter blur-xl md:blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-40 h-40 bg-blue-500 rounded-full top-1/2 right-1/2 filter blur-xl md:blur-3xl"
          animate={{
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-32 h-32 bg-purple-500 rounded-full md:w-48 md:h-48 -right-4 md:-right-8 bottom-4 filter blur-xl md:blur-3xl"
          animate={{
            scale: [1, 0.8, 1],
            x: [-50, 50, -50],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content container */}
      <motion.div
        className="relative z-10 w-full max-w-md text-center sm:max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo with enhanced spacing */}
        <TextLogo className="mb-6 text-xl md:text-3xl md:mb-10" />

        {/* This renders the child routes (login/signup/verify/opt/forget-reset password components) */}
        <Outlet />

        {/* Auth navigation links */}
        <div className="mt-4 space-y-2 text-xs md:mt-8 md:text-sm">
          <p className="font-bold text-gray-600 dark:text-white/70">
            {pathname.includes("login") ? (
              <>
                New to FixItHub?{" "}
                <Link
                  to="/signup"
                  className="link-underline text-emerald-600 dark:text-emerald-400"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                Already registered?{" "}
                <Link
                  to="/login"
                  className="link-underline text-emerald-600 dark:text-emerald-400"
                >
                  Sign In
                </Link>
              </>
            )}
          </p>
          <p className="text-white/70">
            <Link
              to="/forgot-password"
              className="link-underline text-emerald-600 dark:text-emerald-400"
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </motion.div>
      {/* Theme toggle with responsive positioning */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <ThemeToggle />
      </div>
    </div>
  );
};
