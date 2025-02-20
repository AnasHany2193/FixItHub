import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { TextLogo } from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

export const AuthLayout = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden text-white bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 rounded-full top-1/4 -left-0.5 bg-emerald-500 filter blur-3xl"
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
          className="absolute w-48 h-48 bg-purple-500 rounded-full top-1/2 right-1/2 filter blur-3xl"
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

        <motion.div
          className="absolute w-56 h-56 bg-blue-500 rounded-full bottom-1/4 -right-0.5 filter blur-3xl"
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
      </div>

      {/* Content container */}
      <motion.div
        className="relative z-10 w-full max-w-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo with enhanced spacing */}
        <div className="mb-10">
          <TextLogo className="text-3xl" />
          <p className="mt-4 text-sm text-white/60">
            Your Trusted Repair Marketplace
          </p>
        </div>

        {/* Form container */}
        <motion.div
          className="p-8 border shadow-2xl bg-white/5 backdrop-blur-lg rounded-2xl border-white/10"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <Outlet />
          {/* This renders the child routes (login/signup/verify/opt/forget-reset password components) */}
        </motion.div>

        {/* Auth navigation links */}
        <div className="mt-8 space-y-2 text-sm">
          <p className="text-white/70">
            {window.location.pathname.includes("login") ? (
              <>
                New to FixItHub?{" "}
                <a href="/signup" className="link-underline">
                  Create Account
                </a>
              </>
            ) : (
              <>
                Already registered?{" "}
                <a href="/login" className="link-underline">
                  Sign In
                </a>
              </>
            )}
          </p>
          <p className="text-white/70">
            <a href="/forgot-password" className="link-underline">
              Forgot Password?
            </a>
          </p>
        </div>
      </motion.div>
      <ThemeToggle />
    </div>
  );
};
