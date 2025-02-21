import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  User,
  Mail,
  Lock,
  Briefcase,
  X,
  ChevronDown,
} from "lucide-react";
import { useRegister, useUpload } from "@/hooks/useAuth";

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
import { Label } from "../ui/label";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const workerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm: z.string().min(6, "Please confirm your password"),
    skills: z.string().min(3, "List at least one skill"),
    experience: z.string().min(10, "Describe your experience"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

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
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const { mutate: registerUser, isPending } = useRegister();

  const [documents, setDocuments] = useState([]);
  const { mutate: uploadDocument, isPending: isUploading } = useUpload();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
      skills: "",
      experience: "beginner",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password || ""));
  }, [password]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file); // Field name must match multer's .single('image')

    uploadDocument(formData, {
      onSuccess: ({ result }) => {
        console.log("result", result);
        setDocuments((prev) => [
          ...prev,
          {
            url: result.secure_url,
            public_id: result.public_id,
          },
        ]);
      },
    });
  };

  const removeDocument = (publicId) => {
    setDocuments((prev) => prev.filter((doc) => doc.public_id !== publicId));
  };

  const onSubmit = (values) => {
    if (documents.length === 0) {
      toast({
        variant: "error",
        title: "Missing Documents",
        description: "Please upload at least one verification document",
      });
      return;
    }

    registerUser({
      ...values,
      role: "worker",
      skills: values.skills.split(",").map((s) => s.trim()),
      documents,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-96">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>

        {step === 1 && (
          <>
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
                        startIcon={
                          <User className="text-gray-400 dark:text-indigo-300" />
                        }
                        placeholder="Enter your username"
                        disabled={isPending}
                        className="border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
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
                        startIcon={
                          <Mail className="text-gray-400 dark:text-indigo-300" />
                        }
                        placeholder="email@example.com"
                        disabled={isPending}
                        className="border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Fields */}
              {[
                ["password", showPassword, setShowPassword],
                ["confirm", showConfirmPassword, setShowConfirmPassword],
              ].map(([name, show, setShow]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        {name === "password" ? "Password" : "Confirm Password"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={show ? "text" : "password"}
                            startIcon={
                              <Lock className="text-gray-400 dark:text-indigo-300" />
                            }
                            placeholder={
                              name === "password"
                                ? "Enter your password"
                                : "Confirm your password"
                            }
                            disabled={isPending}
                            className="pr-12 border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                          />
                          <button
                            type="button"
                            className="absolute p-1.5 text-gray-400 transition-colors rounded-md right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                            onClick={() => setShow(!show)}
                          >
                            {show ? (
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
              ))}

              {/* Password Strength */}
              {password && (
                <div className="sm:col-span-2">
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength > i
                            ? "bg-blue-500 dark:bg-indigo-400"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Password strength:{" "}
                    <span className="font-medium text-blue-600 dark:text-indigo-300">
                      {["Weak", "Fair", "Good", "Strong"][passwordStrength - 1]}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-5 font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Next Step
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="min-w-full space-y-4">
              {/* Skills Field */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Skills (comma separated)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        startIcon={
                          <Briefcase className="text-gray-400 dark:text-indigo-300" />
                        }
                        placeholder="e.g., plumbing, electrical"
                        className="border-2 border-blue-200/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 dark:border-indigo-700/80 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Field */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Experience Level
                    </FormLabel>
                    <div className="relative">
                      <select
                        {...field}
                        className={cn(
                          "h-10 w-full rounded-lg border border-blue-200/50 bg-white/80 px-3 py-2 text-base shadow-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                          "dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:focus-visible:ring-indigo-500",
                          "appearance-none pl-10 pr-8"
                        )}
                      >
                        <option value="beginner">
                          Beginner (0-2 years experience)
                        </option>
                        <option value="intermediate">
                          Intermediate (3-5 years experience)
                        </option>
                        <option value="expert">
                          Expert (6+ years experience)
                        </option>
                      </select>
                      <Briefcase className="absolute w-5 h-5 text-gray-400 left-3 top-2.5 dark:text-indigo-300" />
                      <ChevronDown className="absolute w-4 h-4 text-gray-400 right-3 top-3.5 dark:text-indigo-300" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4 mt-4">
                {documents.map((doc) => (
                  <div key={doc.public_id} className="relative group">
                    <img
                      src={doc.url}
                      alt={`Document preview`}
                      className="object-cover w-full h-24 border-2 border-blue-100 rounded-lg dark:border-indigo-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.public_id)}
                      className="absolute top-0 right-0 p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Verification Documents
                </FormLabel>

                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2 p-4 transition-colors border-2 rounded-lg cursor-pointer border-blue-200/70 hover:border-blue-300 dark:border-indigo-700/80 dark:hover:border-indigo-400">
                    {isUploading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400 dark:text-indigo-300" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Upload certification (Images)
                    </span>
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(handleFileUpload);
                      }}
                      multiple
                    />
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg -indigo-900/20"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full py-5 font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
