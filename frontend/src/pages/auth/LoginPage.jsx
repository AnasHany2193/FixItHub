import { LoginForm } from "@/components/auth/LoginForm";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";

export default function LoginPage() {
  return (
    <div className="relative z-10 w-full space-y-6">
      {/* Header and Description */}
      <CardHeader className="p-0 space-y-2 text-center">
        <CardTitle className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text dark:from-indigo-400 dark:to-indigo-300">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300/90">
          Sign in to manage your repairs and products
        </CardDescription>
      </CardHeader>

      {/* Login Form */}
      <LoginForm />

      {/* Footer Links */}
      <CardFooter className="flex flex-col gap-3 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
          <Link
            to="/signup"
            className="relative text-blue-600 transition-colors hover:text-blue-700 dark:text-indigo-400 dark:hover:text-indigo-300 link-underline"
          >
            Create Account
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to="/forget-password"
            className="text-blue-600 transition-colors hover:text-blue-700 dark:text-indigo-400 dark:hover:text-indigo-300 link-underline"
          >
            Forgot Password?
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to="/verify-email"
            className="text-blue-600 transition-colors hover:text-blue-700 dark:text-indigo-400 dark:hover:text-indigo-300 link-underline"
          >
            Resend Verification
          </Link>
        </div>
      </CardFooter>
    </div>
  );
}
