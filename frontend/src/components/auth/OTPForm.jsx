import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router";

import { useVerifyOTP } from "@/hooks/useAuth";
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

const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

const OTPForm = () => {
  const navigate = useNavigate();
  const { mutate: verifyOtp, isPending } = useVerifyOTP();

  const form = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", code: "" },
  });

  const onSubmit = (values) => verifyOtp(values);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/signup")}
            className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Email Address
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
                    className="border-2 border-blue-200/70 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:ring-indigo-400/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
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
            {isPending ? <LoadingSpinner size="sm" /> : "Verify Account"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default OTPForm;
