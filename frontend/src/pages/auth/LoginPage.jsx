import { useState } from "react";
import { Link } from "react-router-dom";

// Form Component
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Style Component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Icons
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Schema validation
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const error = false;
  const loading = false;

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("values", values);
  }

  return (
    <div className="relative z-10 space-y-6">
      {/* Header and Description */}
      <CardHeader className="p-0 text-center">
        <CardTitle className="text-3xl font-bold text-blue-900 dark:text-indigo-300">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Sign in to manage your repairs and products
        </CardDescription>
      </CardHeader>

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your username"
                    className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                    disabled={loading}
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
                      disabled={loading}
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

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full py-5 font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
          </Button>
        </form>
      </Form>

      <CardFooter className="flex justify-center w-full gap-2 p-0 text-sm text-center text-gray-600 dark:text-gray-400">
        <p>Don&apos;t have an account?</p>
        <Link
          to="/register"
          className="text-blue-500 hover:underline dark:text-indigo-400"
        >
          Register
        </Link>
      </CardFooter>
    </div>
  );
};
