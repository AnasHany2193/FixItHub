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
      <CardFooter className="grid justify-center w-full grid-cols-1 gap-2 p-0 text-sm text-center text-gray-600 md:grid-cols-2 dark:text-gray-400">
        <p>
          Didn&apos;t receive an OTP?{" "}
          <Link
            to="/forget-password"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Request a new one
          </Link>
        </p>
        <p>
          Forgot your password?{" "}
          <Link
            to="/forget-password"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Reset it here
          </Link>
        </p>
      </CardFooter>
    </div>
  );
};
