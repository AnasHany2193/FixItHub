// frontend/src/components/forms/ForgetPasswordForm.jsx
import { z } from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

import { useForgotPassword } from "@/hooks/useAuth";
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
import { LoadingSpinner } from "../common/LoadingSpinner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgetPasswordForm = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values) => forgotPassword(values);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-5 font-semibold transition-colors bg-blue-600 dark:text-white h-11 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Send Reset OTP"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default ForgetPasswordForm;
