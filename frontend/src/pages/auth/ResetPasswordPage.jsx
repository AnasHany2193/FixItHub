// frontend/src/pages/auth/ResetPasswordPage.jsx
import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { AuthLink } from "@/components/auth/AuthLink";
import { Helmet } from "react-helmet-async";

const ResetPasswordPage = () => {
  return (
    <div className="relative z-10 w-full space-y-6">
      <Helmet>
        <title>Reset Password | FixItHub</title>
      </Helmet>
      <CardHeader className="p-0 space-y-2 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CardTitle className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text dark:from-indigo-400 dark:to-indigo-300">
            Reset Password
          </CardTitle>
        </motion.div>
        <CardDescription className="text-gray-600 dark:text-gray-300/90">
          Enter your new password
        </CardDescription>
      </CardHeader>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ResetPasswordForm />
      </motion.div>
      <CardFooter className="flex justify-center gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <AuthLink to="/verify-email">Login</AuthLink>
        <span className="text-gray-400">•</span>
        <AuthLink to="/forgot-password">Forgot Password</AuthLink>
        <span className="text-gray-400">•</span>
        <AuthLink to="/signup">Create Account</AuthLink>
      </CardFooter>
    </div>
  );
};

export default ResetPasswordPage;
