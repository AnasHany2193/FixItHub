import { motion } from "framer-motion";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

// Components
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
import { useLogin } from "@/hooks/useAuth";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const { mutate: loginUser, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values) => {
    loginUser(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="p-8 border border-purple-100 shadow-xl rounded-2xl backdrop-blur-lg bg-white/80 dark:bg-purple-900/20 dark:border-purple-800/50">
        <div className="mb-8 space-y-1 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text">
            Welcome Back
          </h2>
          <p className="text-purple-600 dark:text-purple-300">
            Sign in to continue to FixItHub
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 dark:text-purple-100">
                    Email
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-purple-400 -translate-y-1/2 left-3 top-1/2 dark:text-purple-500" />
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        disabled={isPending}
                        placeholder="email@example.com"
                        className="pl-10 text-gray-600 border-2 border-purple-200 dark:text-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:border-purple-700/50 dark:bg-purple-900/30 dark:focus:ring-purple-400"
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="dark:text-purple-300" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 dark:text-purple-100">
                    Password
                  </FormLabel>
                  <div className="relative">
                    <Lock className="absolute w-5 h-5 text-purple-400 -translate-y-1/2 left-3 top-1/2 dark:text-purple-500" />
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 text-gray-600 border-2 border-purple-200 dark:text-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:border-purple-700/50 dark:bg-purple-900/30 dark:focus:ring-purple-400"
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute text-purple-400 -translate-y-1/2 right-3 top-1/2 hover:text-purple-500 dark:text-purple-500 dark:hover:text-purple-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="dark:text-purple-300" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold transition-all bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 dark:from-purple-700 dark:to-indigo-600 dark:hover:from-purple-600 dark:hover:to-indigo-500"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              {isPending ? "Signing In..." : "Continue"}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};
