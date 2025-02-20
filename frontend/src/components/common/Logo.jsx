// src/components/Logo.jsx
import { motion } from "framer-motion";
import { Wrench, Shield } from "lucide-react";
import { useNavigate } from "react-router";

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
          className="w-full h-full transition-colors text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-400 dark:group-hover:text-emerald-300"
          strokeWidth={2.5}
          aria-hidden="true"
        />

        {/* Shield badge */}
        <motion.div
          className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-white/80 dark:bg-slate-900/80 p-1 md:p-1.5 rounded-full shadow-lg backdrop-blur-sm"
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
            className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 dark:text-emerald-400"
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
  const navigate = useNavigate();

  return (
    <motion.div
      className={`flex items-center ${className} gap-2 md:gap-3 justify-center cursor-pointer`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate("/")}
    >
      <Logo className="w-8 h-8 md:w-10 md:h-10" />
      <span className="text-xl font-bold text-transparent md:text-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-300 dark:to-cyan-300 bg-clip-text">
        FixItHub
      </span>
    </motion.div>
  );
};
