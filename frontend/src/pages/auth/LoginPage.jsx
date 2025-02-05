import { LoginForm } from "@/components/forms/LoginForm";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
// import LoginForm from "@/components/forms/LoginForm";

export const LoginPage = () => {
  return (
    <div className="relative z-10 max-w-md py-6 space-y-6">
      {/* Header and Description */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-2xl font-bold text-blue-900 sm:text-3xl dark:text-indigo-300">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Sign in to manage your repairs and products
        </CardDescription>
      </CardHeader>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <CardFooter className="grid w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400 md:grid-cols-3">
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
          Forgot your password?{" "}
          <Link
            to="/forget-password"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Reset it here
          </Link>
        </p>
        <p>
          Need to verify your account?{" "}
          <Link
            to="/verify-email"
            className="text-blue-500 hover:underline dark:text-indigo-400"
          >
            Verify now
          </Link>
        </p>
      </CardFooter>
    </div>
  );
};
