import { useState } from "react";
import RoleSelection from "@/components/forms/RoleSelection";
import CustomerRegisterForm from "@/components/forms/CustomerRegisterForm";
import WorkerRegisterForm from "@/components/forms/WorkerRegisterForm";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="relative max-w-md py-6 space-y-4">
      {/* Register Header */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-2xl font-bold text-blue-900 sm:text-3xl dark:text-indigo-300">
          Join FixItHub
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          {!selectedRole
            ? "Select your account type"
            : selectedRole === "customer"
              ? "Create your account in 30 seconds"
              : "Apply to join our professional team"}
        </CardDescription>
      </CardHeader>

      {/* Register Body */}
      {!selectedRole ? (
        <RoleSelection onSelect={setSelectedRole} />
      ) : selectedRole === "customer" ? (
        <CustomerRegisterForm onBack={() => setSelectedRole(null)} />
      ) : (
        <WorkerRegisterForm onBack={() => setSelectedRole(null)} />
      )}

      {/* Register Footer */}
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-gray-600 dark:text-gray-400">
        <p>Already have an account?</p>
        <Link
          to="/login"
          className="text-blue-500 hover:underline dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-400"
        >
          Log In
        </Link>
      </CardFooter>
    </div>
  );
};
