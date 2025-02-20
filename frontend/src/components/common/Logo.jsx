// src/components/Logo.jsx
import { motion } from "framer-motion";
import { Wrench, Shield } from "lucide-react";

export const Logo = ({ className }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Main logo icon */}
      <motion.div
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wrench
          className="w-full h-full transition-colors text-emerald-400 group-hover:text-emerald-300"
          strokeWidth={2.5}
          aria-hidden="true"
        />

        {/* Shield badge */}
        <motion.div
          className="absolute -top-3 -right-3 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-full shadow-lg backdrop-blur-sm"
          animate={{
            y: [0, -8, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Shield
            className="w-3 h-3 text-emerald-400"
            fill="currentColor"
            strokeWidth={1.5}
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
      className={`flex items-center ${className} gap-3 justify-center`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Logo className="w-10 h-10" />
      <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text">
        FixItHub
      </span>
    </motion.div>
  );
};
