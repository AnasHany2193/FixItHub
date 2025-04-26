import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  User,
  Mail,
  Lock,
  X,
} from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { useRegister, useUpload } from "@/hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Progress } from "../ui/progress";

// Zod schema for form validation
const workerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
      .regex(/[0-9]/, "Must contain at least one number (0-9)"),
    confirm: z.string().min(6, "Please confirm your password"),
    skills: z.string(),
    experience: z.enum(["beginner", "intermediate", "expert"]),
    availability: z.enum(["full-time", "part-time", "unavailable"]),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// Password requirements for validation
const PASSWORD_REQUIREMENTS = [
  { label: "6+ characters", regex: /.{6,}/ },
  { label: "Uppercase (A-Z)", regex: /[A-Z]/ },
  { label: "Lowercase (a-z)", regex: /[a-z]/ },
  { label: "Number (0-9)", regex: /[0-9]/ },
  { label: "Special char", regex: /[^A-Za-z0-9]/ },
];

const WorkerRegisterForm = ({ onBack }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const { mutate: registerUser, isPending } = useRegister();

  const [documents, setDocuments] = useState([]);
  const { mutate: uploadDocument, isPending: isUploading } = useUpload();

  const [showPassword, setShowPassword] = useState(false);
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
  const passwordRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.regex.test(password || ""),
      })),
    [password]
  );

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file); // Field name must match multer's .single('image')

    uploadDocument(formData, {
      onSuccess: ({ result }) => {
        setDocuments((prev) => [
          ...prev,
          {
            url: result.url,
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
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Step {step} of 2</span>
            <Progress value={step === 1 ? 50 : 100} className="w-24 h-2" />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      startIcon={
                        <User className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="Enter your username"
                      disabled={isPending}
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      startIcon={
                        <Mail className="text-gray-400 dark:text-indigo-300" />
                      }
                      placeholder="email@example.com"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Fields */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        startIcon={
                          <Lock className="text-gray-400 dark:text-indigo-300" />
                        }
                        placeholder="Create password"
                        disabled={isPending}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        className="absolute p-1.5 text-gray-400 transition-colors rounded-md right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
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

            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        startIcon={
                          <Lock className="text-gray-400 dark:text-indigo-300" />
                        }
                        placeholder="Confirm password"
                        disabled={isPending}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        className="absolute p-1.5 text-gray-400 transition-colors rounded-md right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
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
            <TooltipProvider>
              {password && (
                <div className="p-4 space-y-2 rounded-lg bg-blue-50 dark:bg-indigo-900/20">
                  <div className="grid grid-cols-5 gap-2">
                    {passwordRequirements.map((req) => (
                      <Tooltip key={req.label}>
                        <TooltipTrigger className="w-full">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              req.met
                                ? "bg-blue-500 dark:bg-indigo-400"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {req.met ? "✓ Met: " : "✕ Missing: "}
                          {req.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Meeting{" "}
                    {passwordRequirements.filter((req) => req.met).length} of{" "}
                    {PASSWORD_REQUIREMENTS.length} requirements
                  </p>
                </div>
              )}
            </TooltipProvider>

            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-5 font-semibold transition-colors bg-blue-600 dark:text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Continue to Details →
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Skills Field */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., plumbing, electrical, carpentry"
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
                    <FormLabel>Experience Level</FormLabel>

                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          Beginner (0-2 years experience)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (3-5 years experience)
                        </SelectItem>
                        <SelectItem value="expert">
                          Expert (6+ years experience)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Availability Field */}
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Availability
                    </FormLabel>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.public_id} className="relative group">
                    <img
                      src={doc.url}
                      alt="Document preview"
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
                <FormLabel>Verification Documents</FormLabel>

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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-5 font-semibold transition-colors bg-blue-600 dark:text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Register as Worker"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </Form>
  );
};

export default WorkerRegisterForm;
