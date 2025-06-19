import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  User,
  MapPin,
  Globe,
  Briefcase,
  Star,
  Phone,
  Mail,
  Twitter,
  Linkedin,
  Award,
  Activity,
  ShieldCheck,
  BookOpen,
  Code,
  Wrench,
} from "lucide-react";
import NotFoundStatus from "@/components/common/NotFoundStatus";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProfileCard = ({ title, icon, children, className = "" }) => (
  <motion.div
    variants={fadeIn}
    className={`overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 ${className}`}
  >
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 dark:border-gray-700">
      {icon}
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="max-w-6xl px-4 py-8 mx-auto">
    <div className="relative h-60 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
    </div>

    <div className="flex flex-col items-center -mt-20">
      <Skeleton className="w-40 h-40 border-4 border-white rounded-full dark:border-gray-800" />
      <Skeleton className="w-48 h-8 mt-4" />
      <Skeleton className="w-24 h-6 mt-2" />
    </div>

    <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-48 border border-gray-200 rounded-2xl dark:border-gray-700"
        >
          <Skeleton className="w-full h-16 bg-gradient-to-r from-indigo-500 to-purple-600" />
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

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useUserProfile(id);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !user) {
    return (
      <NotFoundStatus
        title="Profile Not Found"
        icon={<User className="w-12 h-12 text-gray-400" />}
        message="Unable to load the user's profile."
      />
    );
  }

  const getCompletionPercentage = () => {
    const fields = [
      user.username,
      user.email,
      user.profile?.phone,
      user.profile?.bio,
      user.profile?.avatar?.url,
      user.profile?.socialMedia?.linkedin || user.profile?.socialMedia?.twitter,
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

  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden h-60 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/30"></div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute p-3 border rounded-lg top-4 right-4 bg-white/10 backdrop-blur-sm border-white/20"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
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
        </motion.div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center px-4 -mt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative"
        >
          <Avatar className="border-4 border-white shadow-2xl w-36 h-36 dark:border-gray-800">
            <AvatarImage
              src={user.profile?.avatar?.url}
              className="object-cover"
            />
            <AvatarFallback className="text-4xl font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-200">
              {user.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {user.role === "worker" &&
            user.workerApplication?.status === "approved" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute bottom-0 right-0 p-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
              >
                <div className="p-1 bg-white rounded-full">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
              </motion.div>
            )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl font-bold text-transparent text-gray-900 capitalize bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text dark:text-white">
            {user.username?.replace(/_/g, " ") || "User"}
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge
              variant="secondary"
              className="px-3 py-1 font-semibold text-indigo-700 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200"
            >
              <User className="w-4 h-4 mr-1" />
              {user.role}
            </Badge>

            {user.role === "worker" && user.workerApplication?.status && (
              <Badge
                variant={
                  user.workerApplication.status === "approved"
                    ? "success"
                    : user.workerApplication.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className="px-3 py-1 font-semibold capitalize"
              >
                {user.workerApplication.status}
              </Badge>
            )}

            {user.rating?.average > 0 && (
              <Badge className="px-3 py-1 font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                <Star className="w-4 h-4 mr-1" />
                {user.rating.average.toFixed(1)}/5 (
                {formatNumber(user.rating.count)})
              </Badge>
            )}
          </div>

          {user.profile?.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto mt-4 text-lg italic text-gray-600 dark:text-gray-300"
            >
              &quot;{user.profile.bio}&quot;
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 px-4 mt-8 lg:grid-cols-4">
        {/* Left Column - User Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Card */}
          <ProfileCard
            title="Contact Info"
            icon={<Mail className="w-5 h-5 text-white" />}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.profile?.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
                    <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.profile.phone}
                    </p>
                  </div>
                </div>
              )}

              {user.profile?.fullAddress && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
                    <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.profile.fullAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ProfileCard>

          {/* Social Media Card */}
          {(user.profile?.socialMedia?.linkedin ||
            user.profile?.socialMedia?.twitter) && (
            <ProfileCard
              title="Social Profiles"
              icon={<Globe className="w-5 h-5 text-white" />}
            >
              <div className="space-y-3">
                {user.profile.socialMedia.linkedin && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    href={user.profile.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-all rounded-lg bg-gray-50 hover:shadow-md dark:bg-gray-700/50"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      LinkedIn
                    </span>
                  </motion.a>
                )}

                {user.profile.socialMedia.twitter && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    href={user.profile.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-all rounded-lg bg-gray-50 hover:shadow-md dark:bg-gray-700/50"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                      <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Twitter
                    </span>
                  </motion.a>
                )}
              </div>
            </ProfileCard>
          )}

          {/* Status Card */}
          <ProfileCard
            title="Account Status"
            icon={<ShieldCheck className="w-5 h-5 text-white" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Member Since
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account Status
                </p>
                <Badge
                  variant={user.status === "active" ? "success" : "destructive"}
                  className="mt-2 px-3 py-1.5"
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </ProfileCard>
        </div>

        {/* Center Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio Card */}
          <ProfileCard
            title="About Me"
            icon={<User className="w-5 h-5 text-white" />}
          >
            <div className="prose prose-indigo dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300">
                {user.profile?.bio || "No bio available yet."}
              </p>
            </div>
          </ProfileCard>

          {/* Worker Stats */}
          {user.role === "worker" && (
            <ProfileCard
              title="Performance Stats"
              icon={<Activity className="w-5 h-5 text-white" />}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-4 text-center bg-indigo-50 rounded-xl dark:bg-gray-700/50">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatNumber(user.stats?.completedRepairs)}
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Completed Repairs
                  </p>
                </div>

                <div className="p-4 text-center bg-indigo-50 rounded-xl dark:bg-gray-700/50">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user.rating?.average > 0
                      ? user.rating.average.toFixed(1)
                      : "N/A"}
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Avg. Rating
                  </p>
                </div>

                <div className="p-4 text-center bg-indigo-50 rounded-xl dark:bg-gray-700/50">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user.stats?.responseRate || 0}%
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                    Response Rate
                  </p>
                </div>
              </div>
            </ProfileCard>
          )}

          {/* Skills & Certifications */}
          {user.role === "worker" && user.workerApplication && (
            <>
              {user.workerApplication.skills?.length > 0 && (
                <ProfileCard
                  title="Technical Skills"
                  icon={<Code className="w-5 h-5 text-white" />}
                >
                  <div className="flex flex-wrap gap-2">
                    {user.workerApplication.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        className="px-4 py-2 text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </ProfileCard>
              )}

              {user.workerApplication.certifications?.length > 0 && (
                <ProfileCard
                  title="Certifications"
                  icon={<BookOpen className="w-5 h-5 text-white" />}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {user.workerApplication.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <Award className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {cert}
                        </span>
                      </div>
                    ))}
                  </div>
                </ProfileCard>
              )}
            </>
          )}
        </div>

        {/* Right Column - Professional Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Professional Summary */}
          {user.role === "worker" && user.workerApplication && (
            <ProfileCard
              title="Professional Summary"
              icon={<Briefcase className="w-5 h-5 text-white" />}
            >
              <div className="space-y-5">
                {user.workerApplication.experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Experience Level
                    </p>
                    <Badge className="px-4 py-2 mt-2 text-base font-medium text-white capitalize bg-gradient-to-r from-indigo-500 to-purple-500">
                      {user.workerApplication.experience}
                    </Badge>
                  </div>
                )}

                {user.workerApplication.availability && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Availability
                    </p>
                    <Badge className="px-4 py-2 mt-2 text-base font-medium text-white capitalize bg-gradient-to-r from-green-500 to-emerald-500">
                      {user.workerApplication.availability}
                    </Badge>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Worker Status
                  </p>
                  <Badge
                    variant={
                      user.workerApplication.status === "approved"
                        ? "success"
                        : user.workerApplication.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="px-4 py-2 mt-2 text-base font-medium"
                  >
                    {user.workerApplication.status}
                  </Badge>
                </div>
              </div>
            </ProfileCard>
          )}

          {/* Expertise Card */}
          {user.role === "worker" &&
            user.workerApplication?.skills?.length > 0 && (
              <ProfileCard
                title="Areas of Expertise"
                icon={<Wrench className="w-5 h-5 text-white" />}
              >
                <div className="space-y-3">
                  {user.workerApplication.skills
                    .slice(0, 4)
                    .map((skill, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-indigo-100 rounded-full dark:bg-indigo-900/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {skill}
                        </span>
                      </div>
                    ))}
                </div>
              </ProfileCard>
            )}

          {/* Documents Card */}
          {user.role === "worker" &&
            user.workerApplication?.documents?.length > 0 && (
              <ProfileCard
                title="Certificates & Documents"
                icon={<BookOpen className="w-5 h-5 text-white" />}
              >
                <div className="space-y-3">
                  {user.workerApplication.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-lg dark:bg-indigo-900/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Document {idx + 1}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to view
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </ProfileCard>
            )}
        </div>
      </div>
    </motion.div>
  );
}
