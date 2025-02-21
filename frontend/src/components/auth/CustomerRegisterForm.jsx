import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { LoadingSpinner } from "../common/LoadingSpinner";

const customerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
};

const CustomerRegisterForm = ({ onBack }) => {
  const { mutate: registerUser, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { username: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = (values) => registerUser({ ...values, role: "customer" });
  const password = form.watch("password");

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password || ""));
  }, [password]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 min-w-md"
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={
                      <User className="text-gray-400 dark:text-indigo-300" />
                    }
                    placeholder="Enter your username"
                    disabled={isPending}
                    className="border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    startIcon={
                      <Mail className="text-gray-400 dark:text-indigo-300" />
                    }
                    placeholder="email@example.com"
                    disabled={isPending}
                    className="border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Enter your password"
                      disabled={isPending}
                      className="pr-12 border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                    />
                    <button
                      type="button"
                      className="absolute p-1.5 text-gray-400 transition-colors rounded-md right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Confirm your password"
                      disabled={isPending}
                      className="pr-12 border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                    />
                    <button
                      type="button"
                      className="absolute p-1.5 text-gray-400 transition-colors rounded-md right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Strength Indicator */}
          {password && (
            <div className="sm:col-span-2">
              <div className="grid grid-cols-4 gap-2 mt-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength > i
                        ? "bg-blue-500 dark:bg-indigo-400"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Password strength:{" "}
                <span className="font-medium text-blue-600 dark:text-indigo-300">
                  {["Weak", "Fair", "Good", "Strong"][passwordStrength - 1]}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full font-semibold transition-colors bg-blue-600 dark:text-white h-11 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          disabled={isPending}
        >
          {isPending ? <LoadingSpinner size="sm" /> : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerRegisterForm;
