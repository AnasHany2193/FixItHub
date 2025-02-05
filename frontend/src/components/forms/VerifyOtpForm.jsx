import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerifyOtpMutation } from "@/hooks/useAuth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useNavigate } from "react-router";

// Define validation schema for OTP verification.
// In this example, we expect an email and a 6-digit code.
const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().min(6, "Your one-time password must be 6 characters."),
});

export const VerifyOtpForm = () => {
  const navigate = useNavigate();
  // Initialize the OTP verification mutation
  const { mutate: verifyOtp, isPending } = useVerifyOtpMutation();

  // Set up the form with React Hook Form and zodResolver.
  const form = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  // Submit handler for OTP verification
  const onSubmit = (values) => {
    verifyOtp(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Back to Role Selection */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 text-blue-500 hover:underline dark:text-indigo-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Role Selection
        </button>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">
                Email
              </FormLabel>{" "}
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OTP Code Field using specialized OTP input components */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">
                One-Time Password
              </FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                    <InputOTPSlot
                      index={1}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={2}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                    <InputOTPSlot
                      index={3}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={4}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                    <InputOTPSlot
                      index={5}
                      className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-5 font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify OTP"
          )}
        </Button>
      </form>
    </Form>
  );
};
