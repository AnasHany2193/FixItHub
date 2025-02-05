// /src/components/forms/WorkerRegisterForm.jsx
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowLeft, Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { useRegisterMutation, useUploadMutation } from "@/hooks/useAuth";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { Label } from "../ui/label";

const workerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Please confirm your password"),
    skills: z.string().min(3, "List at least one skill"),
    experience: z.string().min(10, "Describe your experience"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// Strong of the Password
const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
};

const WorkerRegisterForm = ({ onBack }) => {
  const { mutate: registerUser, isPending, error } = useRegisterMutation();
  const { mutate: uploadImage, isPending: isUploading } = useUploadMutation();

  // Local state to control which step of the form is shown
  const [step, setStep] = useState(1);

  // States for showing/hiding passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [documents, setDocuments] = useState([]);

  // Initialize the form with all fields defined in the schema.
  const form = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
      skills: "",
      experience: "",
    },
  });

  const {
    formState: { errors },
  } = form;
  useEffect(() => {
    if (errors.username || errors.email || errors.password || errors.confirm)
      setStep(1);
  }, [errors.username, errors.email, errors.password, errors.confirm]);

  const handleFileUpload = (file) => {
    uploadImage(file, {
      onSuccess: (data) => {
        setDocuments((prev) => [...prev, data.imageUrl]);
      },
      onError: (err) => {
        console.error("Upload error:", err);
      },
    });
  };

  // This handler is used for the final submission (step 2)
  const onSubmit = (values) => {
    // Here you can merge all the fields and send to API.
    registerUser({
      ...values,
      role: "worker",
      skills: values.skills.split(",").map((s) => s.trim()),
      documents,
    });
  };

  // Watch password changes to update strength
  const password = form.watch("password");
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password || ""));
  }, [password]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Back to Role Selection */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-blue-500 hover:underline dark:text-indigo-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Role Selection
        </button>

        {step === 1 && (
          <>
            {/* BASIC FIELDS */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        autoComplete="username"
                        placeholder="Enter your username"
                        className="bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          disabled={isPending}
                          autoComplete="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          autoComplete="new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="px-4 py-2 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 dark:bg-indigo-900/20 dark:border-indigo-700 dark:focus:ring-indigo-400"
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-blue-500 dark:hover:text-indigo-400"
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
              <div className="sm:col-span-2">
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 transition-all duration-300 rounded-full ${
                        passwordStrength > i
                          ? "bg-blue-500 dark:bg-indigo-400"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Password strength:{" "}
                  {["Weak", "Fair", "Good", "Strong"][passwordStrength - 1]}
                </p>
              </div>
            </div>

            {/* Step 1 Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={isPending}
                className="mt-4"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* WORKER-SPECIFIC FIELDS */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., plumbing, electrical"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Describe your experience"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Upload */}
            <div className="space-y-2">
              <FormLabel>Verification Documents</FormLabel>
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2 p-4 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-indigo-900/20">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-sm">Upload Certification</span>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*, .pdf"
                    onChange={(e) =>
                      e.target.files[0] && handleFileUpload(e.target.files[0])
                    }
                    disabled={isUploading}
                  />
                </Label>
                <div className="flex flex-wrap items-center justify-center gap-5">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Link
                        to={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Document {i + 1}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 dark:text-blue-400">
                {error.message}
              </p>
            )}

            {/* Navigation Buttons for Step 2 */}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                onClick={() => setStep(1)}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full max-w-xs"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Register as Worker"
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
};

export default WorkerRegisterForm;
