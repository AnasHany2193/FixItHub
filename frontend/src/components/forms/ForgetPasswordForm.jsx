// frontend/src/components/forms/ForgetPasswordForm.jsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPasswordMutation } from "@/hooks/useAuth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Define the validation schema for the forgot password form.
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ForgetPasswordForm = () => {
  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  // Set up the form with React Hook Form and zodResolver.
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Submit handler for requesting password reset.
  const onSubmit = (values) => {
    console.log("values", values);
    forgotPassword(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                  disabled={isPending}
                />
              </FormControl>
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
            "Send Reset OTP"
          )}
        </Button>
      </form>
    </Form>
  );
};
