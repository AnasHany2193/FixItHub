// features/auth/components/CustomerRegisterForm.jsx
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";

export const CustomerRegisterForm = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    <Button
      variant="ghost"
      onClick={onBack}
      className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Selection
    </Button>

    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <Input
          type="text"
          placeholder="John Doe"
          className="pl-10 bg-white/80 dark:bg-indigo-900/20"
          startIcon={<User className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <Input
          type="email"
          placeholder="john@example.com"
          className="pl-10 bg-white/80 dark:bg-indigo-900/20"
          startIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          className="pl-10 bg-white/80 dark:bg-indigo-900/20"
          startIcon={<Lock className="w-4 h-4" />}
        />
      </div>

      <Button
        type="submit"
        className="w-full py-5 font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Create Account
      </Button>
    </form>
  </motion.div>
);
