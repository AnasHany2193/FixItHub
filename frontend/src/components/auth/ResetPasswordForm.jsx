import { z } from "zod";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { LoadingSpinner } from "../common/LoadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const resetSchema = z
  .object({
    email: z.string().email("Valid email required"),
    code: z.string().length(6, "6-digit OTP required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
      .regex(/[0-9]/, "Must contain at least one number (0-9)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Password requirements for validation
const PASSWORD_REQUIREMENTS = [
  { label: "6+ characters", regex: /.{6,}/ },
  { label: "Uppercase (A-Z)", regex: /[A-Z]/ },
  { label: "Lowercase (a-z)", regex: /[a-z]/ },
  { label: "Number (0-9)", regex: /[0-9]/ },
  { label: "Special char", regex: /[^A-Za-z0-9]/ },
];

const ResetPasswordForm = () => {
  const { mutate: resetPassword, isPending } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("newPassword");
  const passwordRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.regex.test(password || ""),
      })),
    [password]
  );

  const onSubmit = (values) => resetPassword(values);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden Email Field */}
        <input type="hidden" {...form.register("email")} />

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>

        {/* OTP Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Verification Code
                </FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSeparator />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSeparator />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* New Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="New password"
                      disabled={isPending}
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
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      startIcon={
                        <ShieldCheck className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Confirm password"
                      disabled={isPending}
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
        </motion.div>

        {/* Password Strength */}
        <TooltipProvider>
          {password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
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
            </motion.div>
          )}
        </TooltipProvider>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-5 font-semibold transition-colors bg-blue-600 dark:text-white h-11 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Reset Password"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
