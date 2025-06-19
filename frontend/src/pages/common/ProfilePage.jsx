import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Globe,
  Briefcase,
  Save,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import axiosClient from "@/api/client";

const Section = ({ title, icon, children, isOpen, setIsOpen }) => (
  <div className="mb-6 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-700">
    <button
      className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-gray-800/50 dark:to-gray-800/30"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 text-indigo-600 bg-indigo-100 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>

    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="p-4 bg-white dark:bg-gray-800/50"
      >
        {children}
      </motion.div>
    )}
  </div>
);

const InfoCard = ({ title, icon, children }) => (
  <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-medium text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
    {children}
  </div>
);

const ProfileSkeleton = () => (
  <div className="max-w-4xl px-4 py-8 mx-auto">
    <div className="relative h-40 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="absolute inset-0 bg-black/20" />
    </div>

    <div className="flex flex-col items-center -mt-20">
      <Skeleton className="w-32 h-32 border-4 border-white rounded-full dark:border-gray-800" />
      <Skeleton className="w-48 h-8 mt-4" />
      <Skeleton className="w-24 h-6 mt-2" />
    </div>

    <div className="mt-8 space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl dark:border-gray-700"
        >
          <Skeleton className="w-full h-16" />
          <div className="p-4">
            <div className="space-y-3">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
              <Skeleton className="w-full h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function UserProfilePage() {
  const { data: profile, isLoading, isError } = useMyProfile();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [openSections, setOpenSections] = useState({
    personal: true,
    address: false,
    social: false,
    worker: false,
  });

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !profile?.data) {
    return (
      <NotFoundStatus
        title="Profile Not Found"
        icon={<User className="w-12 h-12 text-gray-400" />}
        message="Unable to load your profile."
      />
    );
  }

  const user = profile.data;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    setFormData((prev) => {
      let current = { ...prev };
      let ref = current;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = ref[keys[i]] || {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return current;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "error",
          title: "Invalid File",
          description: "Please upload an image file.",
        });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    const formData = new FormData();
    formData.append("image", avatarFile);
    try {
      const { data } = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.result; // { url, public_id }
    } catch (error) {
      toast({
        variant: "error",
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload image.",
      });
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updates = { ...formData };
      if (avatarFile) {
        const avatar = await uploadAvatar();
        if (avatar) {
          updates["profile.avatar.url"] = avatar.url;
          updates["profile.avatar.public_id"] = avatar.public_id;
        }
      }
      updateProfile(updates, {
        onSuccess: () => {
          setAvatarFile(null);
          setAvatarPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      });
    } catch {
      // Error handled by useUpdateMyProfile hook
    }
  };

  const availabilityOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "unavailable", label: "Unavailable" },
  ];

  const experienceOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ];

  const getCompletionPercentage = () => {
    const fields = [
      user.username,
      user.email,
      user.profile?.phone,
      user.profile?.bio,
      user.profile?.address?.street,
      user.profile?.socialMedia?.linkedin,
    ];

    if (user.role === "worker") {
      fields.push(
        user.workerApplication?.skills?.length > 0,
        user.workerApplication?.experience
      );
    }

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header Gradient */}
      <div className="relative h-48 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Profile Completion */}
        <div className="absolute p-3 rounded-lg top-4 right-4 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">
              Profile Complete
            </span>
            <span className="text-sm font-bold text-white">
              {completionPercentage}%
            </span>
          </div>
          <Progress
            value={completionPercentage}
            className="h-2 bg-white/20"
            indicatorClassName="bg-white"
          />
        </div>
      </div>

      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center px-4 -mt-24">
        <motion.div whileHover={{ scale: 1.05 }} className="relative group">
          <Avatar className="w-40 h-40 border-4 border-white shadow-lg dark:border-gray-800">
            <AvatarImage
              src={avatarPreview || user.profile?.avatar?.url}
              className="object-cover"
            />
            <AvatarFallback className="text-5xl text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300">
              {user.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <label
            htmlFor="avatar-upload"
            className="absolute p-2 transition-opacity bg-white rounded-full shadow-md cursor-pointer bottom-2 right-2 group-hover:opacity-100 opacity-90"
          >
            <Edit className="w-4 h-4 text-indigo-600" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 capitalize dark:text-white">
            {user.username?.replace(/_/g, " ") || "User"}
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className="text-indigo-800 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {user.role}
            </Badge>

            {user.workerApplication?.status && (
              <Badge
                variant={
                  user.workerApplication.status === "approved"
                    ? "success"
                    : user.workerApplication.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className="capitalize"
              >
                {user.workerApplication.status}
              </Badge>
            )}

            <Badge variant="outline">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Badge>
          </div>

          {user.profile?.bio && (
            <p className="max-w-2xl mt-3 text-gray-600 dark:text-gray-300">
              {user.profile.bio}
            </p>
          )}
        </motion.div>
      </div>

      {/* Stats Cards */}
      {user.role !== "customer" && (
        <div className="grid grid-cols-1 gap-4 px-4 mt-8 md:grid-cols-3">
          <InfoCard
            title="Repair Stats"
            icon={
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Completed
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.stats?.completedRepairs || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Response Rate
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.stats?.responseRate || 0}%
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Sales Stats"
            icon={
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Completed
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.stats?.completedSales || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Rating
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.rating?.average || 0}/5
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Account Info"
            icon={<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
              </div>
              {user.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {user.profile.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {user.isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </InfoCard>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="px-4 pb-8 mt-8">
        {/* Personal Info */}
        <Section
          title="Personal Information"
          icon={<User className="w-5 h-5" />}
          isOpen={openSections.personal}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, personal: open })
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="username"
                className="text-gray-700 dark:text-gray-300"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username || user.username || ""}
                onChange={handleInputChange}
                disabled
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || user.email || ""}
                onChange={handleInputChange}
                disabled
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="phone"
                className="text-gray-700 dark:text-gray-300"
              >
                Phone
              </Label>
              <Input
                id="phone"
                name="profile.phone"
                value={formData.profile?.phone || user.profile?.phone || ""}
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
                Bio
              </Label>
              <textarea
                id="bio"
                name="profile.bio"
                value={formData.profile?.bio || user.profile?.bio || ""}
                onChange={handleInputChange}
                className="flex w-full h-24 px-3 py-2 mt-1 text-sm transition-colors border border-gray-300 rounded-md shadow-sm bg-gray-50 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section
          title="Address"
          icon={<MapPin className="w-5 h-5" />}
          isOpen={openSections.address}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, address: open })
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="street"
                className="text-gray-700 dark:text-gray-300"
              >
                Street
              </Label>
              <Input
                id="street"
                name="profile.address.street"
                value={
                  formData.profile?.address?.street ||
                  user.profile?.address?.street ||
                  ""
                }
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="city"
                className="text-gray-700 dark:text-gray-300"
              >
                City
              </Label>
              <Input
                id="city"
                name="profile.address.city"
                value={
                  formData.profile?.address?.city ||
                  user.profile?.address?.city ||
                  ""
                }
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="state"
                className="text-gray-700 dark:text-gray-300"
              >
                State
              </Label>
              <Input
                id="state"
                name="profile.address.state"
                value={
                  formData.profile?.address?.state ||
                  user.profile?.address?.state ||
                  ""
                }
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="zip" className="text-gray-700 dark:text-gray-300">
                ZIP Code
              </Label>
              <Input
                id="zip"
                name="profile.address.zip"
                value={
                  formData.profile?.address?.zip ||
                  user.profile?.address?.zip ||
                  ""
                }
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="country"
                className="text-gray-700 dark:text-gray-300"
              >
                Country
              </Label>
              <Input
                id="country"
                name="profile.address.country"
                value={
                  formData.profile?.address?.country ||
                  user.profile?.address?.country ||
                  ""
                }
                onChange={handleInputChange}
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>
          </div>
        </Section>

        {/* Social Media */}
        <Section
          title="Social Media"
          icon={<Globe className="w-5 h-5" />}
          isOpen={openSections.social}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, social: open })
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="website"
                className="text-gray-700 dark:text-gray-300"
              >
                Website
              </Label>
              <Input
                id="website"
                name="profile.socialMedia.website"
                value={
                  formData.profile?.socialMedia?.website ||
                  user.profile?.socialMedia?.website ||
                  ""
                }
                onChange={handleInputChange}
                type="url"
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="linkedin"
                className="text-gray-700 dark:text-gray-300"
              >
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                name="profile.socialMedia.linkedin"
                value={
                  formData.profile?.socialMedia?.linkedin ||
                  user.profile?.socialMedia?.linkedin ||
                  ""
                }
                onChange={handleInputChange}
                type="url"
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="twitter"
                className="text-gray-700 dark:text-gray-300"
              >
                Twitter
              </Label>
              <Input
                id="twitter"
                name="profile.socialMedia.twitter"
                value={
                  formData.profile?.socialMedia?.twitter ||
                  user.profile?.socialMedia?.twitter ||
                  ""
                }
                onChange={handleInputChange}
                type="url"
                className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
              />
            </div>
          </div>
        </Section>

        {/* Worker Details (if worker) */}
        {user.role === "worker" && (
          <Section
            title="Worker Details"
            icon={<Briefcase className="w-5 h-5" />}
            isOpen={openSections.worker}
            setIsOpen={(open) =>
              setOpenSections({ ...openSections, worker: open })
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label
                  htmlFor="skills"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Skills (comma-separated)
                </Label>
                <Input
                  id="skills"
                  name="workerApplication.skills"
                  value={(
                    formData.workerApplication?.skills ||
                    user.workerApplication?.skills ||
                    []
                  ).join(", ")}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "workerApplication.skills",
                        value: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                  className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="certifications"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Certifications (comma-separated)
                </Label>
                <Input
                  id="certifications"
                  name="workerApplication.certifications"
                  value={(
                    formData.workerApplication?.certifications ||
                    user.workerApplication?.certifications ||
                    []
                  ).join(", ")}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "workerApplication.certifications",
                        value: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g., OSHA, MUFCI, Welding"
                  className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
                />
              </div>

              <div>
                <Label
                  htmlFor="experience"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Experience
                </Label>
                <select
                  id="experience"
                  name="workerApplication.experience"
                  value={
                    formData.workerApplication?.experience ||
                    user.workerApplication?.experience ||
                    ""
                  }
                  onChange={handleInputChange}
                  className="flex w-full h-10 px-3 py-2 mt-1 text-sm transition-colors border border-gray-300 rounded-md shadow-sm bg-gray-50 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-500"
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="availability"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Availability
                </Label>
                <select
                  id="availability"
                  name="workerApplication.availability"
                  value={
                    formData.workerApplication?.availability ||
                    user.workerApplication?.availability ||
                    ""
                  }
                  onChange={handleInputChange}
                  className="flex w-full h-10 px-3 py-2 mt-1 text-sm transition-colors border border-gray-300 rounded-md shadow-sm bg-gray-50 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-500"
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Section>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="gap-2 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30"
              disabled={isPending}
            >
              <Save className="w-5 h-5" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
