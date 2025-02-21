import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import ResendOtpForm from "@/components/auth/ResendOtpForm";
import { AuthLink } from "@/components/auth/AuthLink";

const ResendOtpPage = () => {
  return (
    <div className="relative z-10 w-full space-y-6">
      <CardHeader className="p-0 space-y-2 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CardTitle className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text dark:from-indigo-400 dark:to-indigo-300">
            Resend Verification Code
          </CardTitle>
        </motion.div>
        <CardDescription className="text-gray-600 dark:text-gray-300/90">
          Enter your email to receive a new OTP
        </CardDescription>
      </CardHeader>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ResendOtpForm />
      </motion.div>

      <CardFooter className="flex flex-col items-center gap-3 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <div className="flex gap-2">
          <p>Remember your password?</p>
          <AuthLink to="/login">Login instead</AuthLink>
        </div>
      </CardFooter>
    </div>
  );
};

export default ResendOtpPage;
