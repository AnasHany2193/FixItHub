import { motion } from "framer-motion";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLink } from "@/components/auth/AuthLink";
import { Mail, Lock, User, Briefcase, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="relative z-10 w-full space-y-6">
      {/* Header */}
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

      {/* Role Selection or Form */}
      <motion.div
        key={selectedRole ? "form" : "role-select"}
        initial={{ opacity: 0, x: selectedRole ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: selectedRole ? -50 : 50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {!selectedRole ? (
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-6 transition-all border cursor-pointer rounded-xl backdrop-blur-sm bg-white/80 dark:bg-indigo-900/30 border-blue-200/50 dark:border-indigo-800/30 hover:border-blue-300 dark:hover:border-indigo-500"
              onClick={() => setSelectedRole("customer")}
            >
              <div className="flex flex-col items-center gap-3">
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                  I'm a Customer
                </h3>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Find reliable professionals for your repairs
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-6 transition-all border cursor-pointer rounded-xl backdrop-blur-sm bg-white/80 dark:bg-indigo-900/30 border-blue-200/50 dark:border-indigo-800/30 hover:border-blue-300 dark:hover:border-indigo-500"
              onClick={() => setSelectedRole("worker")}
            >
              <div className="flex flex-col items-center gap-3">
                <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                  I'm a Professional
                </h3>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Offer your repair services to customers
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedRole(null)}
              className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>

            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-white/80 dark:bg-indigo-900/20"
                  startIcon={<User className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 bg-white/80 dark:bg-indigo-900/20"
                  startIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/80 dark:bg-indigo-900/20"
                  startIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-5 font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Create Account
              </Button>
            </form>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-gray-600 dark:text-gray-400">
        <p>Already have an account?</p>
        <AuthLink to="/login">Log In</AuthLink>
      </CardFooter>
    </div>
  );
}
