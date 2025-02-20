// src/components/Logo.jsx
import { motion } from "framer-motion";
import { Wrench, Shield } from "lucide-react";

export const Logo = ({ className }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main logo icon */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wrench
          className="w-full h-full text-emerald-500"
          strokeWidth={2}
          aria-hidden="true"
        />

        {/* Shield badge */}
        <motion.div
          className="absolute p-1 bg-white rounded-full shadow-lg -top-2 -right-3 dark:bg-slate-900"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Shield
            className="w-3 h-3 text-emerald-500"
            fill="currentColor"
            strokeWidth={1}
          />
        </motion.div>
      </motion.div>

      {/* Optional text */}
      <motion.span
        className="sr-only"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        FixItHub
      </motion.span>
    </motion.div>
  );
};

// Optional text logo variant
export const TextLogo = ({ className }) => {
  return (
    <motion.div
      className={`flex items-center gap-2 ${className} gap-3 justify-center`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Logo className="w-8 h-8" />
      <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
        FixItHub
      </span>
    </motion.div>
  );
};
