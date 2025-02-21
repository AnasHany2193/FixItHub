import { motion } from "framer-motion";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

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
import { LoadingSpinner } from "../common/LoadingSpinner";

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
      className="w-full space-y-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
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
                    disabled={isPending}
                    autoComplete="email"
                    placeholder="email@example.com"
                    startIcon={
                      <Mail className="text-gray-400 dark:text-indigo-300/80" />
                    }
                    className="pr-4 transition-colors border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                  />
                </FormControl>
                <FormMessage className="text-sm" />
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
                      placeholder="••••••••"
                      disabled={isPending}
                      startIcon={
                        <Lock className="text-gray-400 dark:text-indigo-300/80" />
                      }
                      className="pr-4 border-2 border-blue-200/70 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700 dark:focus:ring-indigo-400/20"
                    />
                    <button
                      type="button"
                      className="absolute p-1 text-gray-400 transition-colors -translate-y-1/2 rounded-md right-3 top-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
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
            className="w-full font-semibold transition-colors bg-blue-600 dark:text-white h-11 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            disabled={isPending}
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Log In"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};
