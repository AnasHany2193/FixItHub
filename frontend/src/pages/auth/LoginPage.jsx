import { AuthLink } from "@/components/auth/AuthLink";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <CardFooter className="flex gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <AuthLink to="/signup">Create Account</AuthLink>
        <span className="text-gray-400">•</span>
        <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
        <span className="text-gray-400">•</span>
        <AuthLink to="/verify-email">Resend Verification</AuthLink>
      </CardFooter>
    </div>
  );
}
