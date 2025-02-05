// frontend/src/pages/auth/ResetPasswordPage.jsx
import { Link } from "react-router-dom";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <div className="relative z-10 max-w-md py-6 space-y-6">
      {/* Header and Description */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-2xl font-bold text-blue-900 sm:text-3xl dark:text-indigo-300">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Enter your email, the OTP you received, and set your new password.
        </CardDescription>
      </CardHeader>

      {/* Reset Password Form */}
      <ResetPasswordForm />

      {/* Footer */}
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <p>Remember your password?</p>
        <Link
          to="/login"
          className="text-blue-500 hover:underline dark:text-indigo-400"
        >
          Login
        </Link>
      </CardFooter>
    </div>
  );
};
