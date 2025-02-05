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
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <p>Don&apos;t have an account?</p>
        <Link
          to="/register"
          className="text-blue-500 hover:underline dark:text-indigo-400"
        >
          Register
        </Link>
      </CardFooter>
    </div>
  );
};

export default LoginPage;
