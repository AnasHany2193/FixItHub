import { Link } from "react-router-dom";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { VerifyOtpForm } from "@/components/forms/VerifyOtpForm";

export const VerifyOtpPage = () => {
  return (
    <div className="relative z-10 max-w-md py-6 space-y-6">
      {/* Header and Description */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-2xl font-bold text-blue-900 sm:text-3xl dark:text-indigo-300">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Enter the OTP sent to your email to verify your account.
        </CardDescription>
      </CardHeader>

      {/* OTP Verification Form */}
      <VerifyOtpForm />

      {/* Footer */}
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <p>Didn&apos;t receive an OTP?</p>
        <Link
          to="/resend-otp"
          className="text-blue-500 hover:underline dark:text-indigo-400"
        >
          Resend OTP
        </Link>
      </CardFooter>
    </div>
  );
};

export default VerifyOtpPage;
