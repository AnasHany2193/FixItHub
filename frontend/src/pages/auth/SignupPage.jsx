// features/auth/SignupPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLink } from "@/components/auth/AuthLink";

import RoleSelection from "@/components/auth/RoleSelection";
import CustomerRegisterForm from "@/components/auth/CustomerRegisterForm";
import WorkerRegisterForm from "@/components/auth/WorkerRegisterForm";
import { Helmet } from "react-helmet-async";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="relative z-10 w-full space-y-6">
      <Helmet>
        <title>Signup | FixItHub</title>
      </Helmet>
      <CardHeader className="p-0 space-y-2 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CardTitle className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text dark:from-indigo-400 dark:to-indigo-300">
            Join FixItHub
          </CardTitle>
        </motion.div>
        <CardDescription className="text-gray-600 dark:text-gray-300/90">
          {!selectedRole
            ? "Select your account type"
            : "Create your account in 30 seconds"}
        </CardDescription>
      </CardHeader>
      <motion.div
        key={selectedRole ? "form" : "role-select"}
        initial={{ opacity: 0, x: selectedRole ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: selectedRole ? -50 : 50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {!selectedRole ? (
          <RoleSelection onSelect={setSelectedRole} />
        ) : selectedRole === "customer" ? (
          <CustomerRegisterForm onBack={() => setSelectedRole(null)} />
        ) : (
          <WorkerRegisterForm onBack={() => setSelectedRole(null)} />
        )}
      </motion.div>
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-gray-600 dark:text-gray-400">
        <p>Already have an account?</p>
        <AuthLink to="/login">Log In</AuthLink>
      </CardFooter>
    </div>
  );
}
