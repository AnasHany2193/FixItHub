import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Globe,
  Briefcase,
  Save,
  Upload,
} from "lucide-react";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import axiosClient from "@/api/client";

const Section = ({ title, icon, children, isOpen, setIsOpen }) => (
  <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </CollapsibleTrigger>
    <CollapsibleContent>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="p-4 bg-white rounded-b-lg dark:bg-gray-800"
      >
        {children}
      </motion.div>
    </CollapsibleContent>
  </Collapsible>
);

const EditableField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
}) => (
  <div className="mb-4">
    <Label
      htmlFor={name}
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="mb-4">
    <Label
      htmlFor={name}
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </Label>
    <Select
      value={value || ""}
      onValueChange={(val) => onChange({ target: { name, value: val } })}
    >
      <SelectTrigger className="mt-1 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ProfileSkeleton = () => (
  <div className="max-w-4xl px-4 py-8 mx-auto">
    <Skeleton className="w-full h-40 rounded-t-xl" />
    <div className="flex justify-center -mt-20">
      <Skeleton className="w-32 h-32 rounded-full" />
    </div>
    <div className="mt-4 space-y-4">
      <Skeleton className="w-1/2 h-8 mx-auto" />
      <Skeleton className="w-1/4 h-6 mx-auto" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-lg dark:bg-gray-800">
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        ))}
      </div>
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center -mt-20">
        <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800">
          <AvatarImage
            src={avatarPreview || user.profile?.avatar?.url}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
            {user.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <label htmlFor="avatar-upload" className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="w-4 h-4" />
            Change Avatar
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 capitalize dark:text-gray-100">
          {user.username?.replace(/_/g, " ") || "User"}
        </h1>
        <Badge
          variant="secondary"
          className="mt-2 text-indigo-800 capitalize bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-100"
        >
          {user.role}
        </Badge>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Personal Info */}
        <Section
          title="Personal Information"
          icon={<User className="w-5 h-5 text-indigo-600" />}
          isOpen={openSections.personal}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, personal: open })
          }
        >
          <CardContent className="space-y-4">
            <EditableField
              label="Username"
              name="username"
              value={formData.username || user.username}
              onChange={handleInputChange}
              disabled
            />
            <EditableField
              label="Email"
              name="email"
              value={formData.email || user.email}
              onChange={handleInputChange}
              type="email"
              disabled
            />
            <EditableField
              label="Phone"
              name="profile.phone"
              value={formData.profile?.phone || user.profile?.phone}
              onChange={handleInputChange}
            />
            <EditableField
              label="Bio"
              name="profile.bio"
              value={formData.profile?.bio || user.profile?.bio}
              onChange={handleInputChange}
            />
          </CardContent>
        </Section>

        {/* Address */}
        <Section
          title="Address"
          icon={<MapPin className="w-5 h-5 text-indigo-600" />}
          isOpen={openSections.address}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, address: open })
          }
        >
          <CardContent className="space-y-4">
            <EditableField
              label="Street"
              name="profile.address.street"
              value={
                formData.profile?.address?.street ||
                user.profile?.address?.street
              }
              onChange={handleInputChange}
            />
            <EditableField
              label="City"
              name="profile.address.city"
              value={
                formData.profile?.address?.city || user.profile?.address?.city
              }
              onChange={handleInputChange}
            />
            <EditableField
              label="State"
              name="profile.address.state"
              value={
                formData.profile?.address?.state || user.profile?.address?.state
              }
              onChange={handleInputChange}
            />
            <EditableField
              label="ZIP Code"
              name="profile.address.zip"
              value={
                formData.profile?.address?.zip || user.profile?.address?.zip
              }
              onChange={handleInputChange}
            />
            <EditableField
              label="Country"
              name="profile.address.country"
              value={
                formData.profile?.address?.country ||
                user.profile?.address?.country
              }
              onChange={handleInputChange}
            />
          </CardContent>
        </Section>

        {/* Social Media */}
        <Section
          title="Social Media"
          icon={<Globe className="w-5 h-5 text-indigo-600" />}
          isOpen={openSections.social}
          setIsOpen={(open) =>
            setOpenSections({ ...openSections, social: open })
          }
        >
          <CardContent className="space-y-4">
            <EditableField
              label="Website"
              name="profile.socialMedia.website"
              value={
                formData.profile?.socialMedia?.website ||
                user.profile?.socialMedia?.website
              }
              onChange={handleInputChange}
              type="url"
            />
            <EditableField
              label="LinkedIn"
              name="profile.socialMedia.linkedin"
              value={
                formData.profile?.socialMedia?.linkedin ||
                user.profile?.socialMedia?.linkedin
              }
              onChange={handleInputChange}
              type="url"
            />
            <EditableField
              label="Twitter"
              name="profile.socialMedia.twitter"
              value={
                formData.profile?.socialMedia?.twitter ||
                user.profile?.socialMedia?.twitter
              }
              onChange={handleInputChange}
              type="url"
            />
          </CardContent>
        </Section>

        {/* Worker Details (if worker) */}
        {user.role === "worker" && (
          <Section
            title="Worker Details"
            icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
            isOpen={openSections.worker}
            setIsOpen={(open) =>
              setOpenSections({ ...openSections, worker: open })
            }
          >
            <CardContent className="space-y-4">
              <EditableField
                label="Skills (comma-separated)"
                name="workerApplication.skills"
                value={
                  formData.workerApplication?.skills?.join(", ") ||
                  user.workerApplication?.skills?.join(", ")
                }
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
              />
              <EditableField
                label="Certifications (comma-separated)"
                name="workerApplication.certifications"
                value={
                  formData.workerApplication?.certifications?.join(", ") ||
                  user.workerApplication?.certifications?.join(", ")
                }
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
              />
              <SelectField
                label="Experience"
                name="workerApplication.experience"
                value={
                  formData.workerApplication?.experience ||
                  user.workerApplication?.experience
                }
                onChange={handleInputChange}
                options={experienceOptions}
              />
              <SelectField
                label="Availability"
                name="workerApplication.availability"
                value={
                  formData.workerApplication?.availability ||
                  user.workerApplication?.availability
                }
                onChange={handleInputChange}
                options={availabilityOptions}
              />
            </CardContent>
          </Section>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={isPending}
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
