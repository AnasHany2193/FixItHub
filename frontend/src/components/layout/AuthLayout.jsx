import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { TextLogo } from "../common/Logo";

export const AuthLayout = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden text-white bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 rounded-full top-1/4 left-1/4 bg-emerald-500/30 filter blur-3xl"
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
          className="absolute w-48 h-48 rounded-full top-1/3 right-1/4 bg-purple-500/30 filter blur-3xl"
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
          className="absolute w-56 h-56 rounded-full bottom-1/4 left-1/3 bg-blue-500/30 filter blur-3xl"
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
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <TextLogo className="mb-5" />

        {/* Form container */}
        <div className="p-4 border shadow-xl bg-white/5 backdrop-blur-sm rounded-2xl border-white/10">
          <Outlet />
          {/* This renders the child routes (login/signup/verify/opt/forget-reset password components) */}
        </div>
      </div>
    </div>
  );
};
