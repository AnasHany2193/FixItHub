import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingSpinner = ({ size = "md", variant = "primary", label }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const variants = {
    primary: "text-indigo-600 dark:text-indigo-300",
    neutral: "text-gray-600 dark:text-gray-300",
    destructive: "text-rose-600 dark:text-rose-300",
  };

  return (
    <div className="flex items-center justify-center bg-transparent rounded-full backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="relative">
          <Loader2
            className={`${sizes[size]} ${variants[variant]} animate-spin transition-colors`}
          />

          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${
              variant === "primary"
                ? "border-indigo-100 dark:border-indigo-900/30"
                : variant === "destructive"
                  ? "border-rose-100 dark:border-rose-900/30"
                  : "border-gray-100 dark:border-gray-900/30"
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </div>

        {label && (
          <motion.span
            className={`text-sm font-medium ${
              variant === "primary"
                ? "text-indigo-600 dark:text-indigo-300"
                : variant === "destructive"
                  ? "text-rose-600 dark:text-rose-300"
                  : "text-gray-600 dark:text-gray-300"
            }`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};
