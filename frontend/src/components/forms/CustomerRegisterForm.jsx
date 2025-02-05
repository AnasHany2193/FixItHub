import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "@/hooks/useAuth";

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

// Strong of the Password
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
  const { mutate: registerUser, isPending } = useRegisterMutation();

  // Password States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = (values) => {
    registerUser({ ...values, role: "customer" });
  };

  // Watch password changes
  const password = form.watch("password");
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password || ""));
  }, [password]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Back to Role Selection */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-blue-500 hover:underline dark:text-indigo-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Role Selection
        </button>

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
                    disabled={isPending}
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
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
                    disabled={isPending}
                    autoComplete="email"
                    placeholder="email@example.com"
                    className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
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
                      disabled={isPending}
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-blue-500 dark:hover:text-indigo-400"
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

          {/* Confirm Field */}
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
                      autoComplete="new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-blue-500 dark:hover:text-indigo-400"
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

          {/* Password Strength */}
          <div className="sm:col-span-2">
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    passwordStrength > i
                      ? "bg-blue-500 dark:bg-indigo-400"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Password strength:{" "}
              {["Weak", "Fair", "Good", "Strong"][passwordStrength - 1]}
            </p>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full py-5 font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerRegisterForm;
