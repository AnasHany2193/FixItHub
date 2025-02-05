import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/hooks/useAuth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

// Icons
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Schema validation
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const { mutate: loginUser, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    loginUser(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Username Field */}
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
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    disabled={isPending}
                  />
                  <button
                    type="button"
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

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full py-5 font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
        </Button>
      </form>
    </Form>
  );
};
