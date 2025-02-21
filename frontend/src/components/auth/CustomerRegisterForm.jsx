import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

import { useRegister } from "@/hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const customerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
      .regex(/[0-9]/, "Must contain at least one number (0-9)"),
    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// Password requirements for validation
const PASSWORD_REQUIREMENTS = [
  { label: "6+ characters", regex: /.{6,}/ },
  { label: "Uppercase (A-Z)", regex: /[A-Z]/ },
  { label: "Lowercase (a-z)", regex: /[a-z]/ },
  { label: "Number (0-9)", regex: /[0-9]/ },
  { label: "Special char", regex: /[^A-Za-z0-9]/ },
];

const CustomerRegisterForm = ({ onBack }) => {
  const { mutate: registerUser, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { username: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = (values) => registerUser({ ...values, role: "customer" });

  const password = form.watch("password");
  const passwordRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.regex.test(password || ""),
      })),
    [password]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-96">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>

        <div className="space-y-6">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={
                      <User className="text-gray-400 dark:text-indigo-300" />
                    }
                    placeholder="Enter your username"
                    disabled={isPending}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    startIcon={
                      <Mail className="text-gray-400 dark:text-indigo-300" />
                    }
                    placeholder="email@example.com"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Fields */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Create password"
                      disabled={isPending}
                      className="pr-12"
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

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Confirm password"
                      disabled={isPending}
                      className="pr-12"
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

          {/* Password Strength */}
          <TooltipProvider>
            {password && (
              <div className="p-4 space-y-2 rounded-lg bg-blue-50 dark:bg-indigo-900/20">
                <div className="grid grid-cols-5 gap-2">
                  {passwordRequirements.map((req) => (
                    <Tooltip key={req.label}>
                      <TooltipTrigger className="w-full">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            req.met
                              ? "bg-blue-500 dark:bg-indigo-400"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {req.met ? "✓ Met: " : "✕ Missing: "}
                        {req.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Meeting {passwordRequirements.filter((req) => req.met).length}{" "}
                  of {PASSWORD_REQUIREMENTS.length} requirements
                </p>
              </div>
            )}
          </TooltipProvider>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full font-semibold transition-colors bg-blue-600 dark:text-white h-11 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            disabled={isPending}
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerRegisterForm;
