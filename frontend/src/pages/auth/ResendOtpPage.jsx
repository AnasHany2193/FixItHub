import { Link } from "react-router-dom";

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ResendOtpForm } from "@/components/forms/ResendOtpForm";

export const ResendOtpPage = () => {
  return (
    <div className="relative z-10 max-w-md py-6 space-y-6">
      {/* Header */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-2xl font-bold text-blue-900 sm:text-3xl dark:text-indigo-300">
          Resend OTP
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Enter your email to resend the one-time password.
        </CardDescription>
      </CardHeader>

      {/* Resend OTP Form */}
      <ResendOtpForm />

      {/* Footer */}
      <CardFooter className="grid w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400 md:grid-cols-2">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Register
          </Link>
        </p>
        <p>
          Already verified?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </div>
  );
};

export default ResendOtpPage;
