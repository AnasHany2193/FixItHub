import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function NotFoundStatus({
  icon,
  title,
  message,
  buttonText,
  buttonVariant = "default",
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
        {React.cloneElement(icon, {
          className: "w-12 h-12 text-indigo-600 dark:text-indigo-400",
        })}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
        {message}
      </p>
      {buttonText && (
        <Button
          className="mt-4"
          variant={buttonVariant}
          onClick={() => navigate(-1)}
        >
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
}
