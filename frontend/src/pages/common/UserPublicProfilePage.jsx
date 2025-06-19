import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Globe,
  Briefcase,
  Star,
  Phone,
} from "lucide-react";
import NotFoundStatus from "@/components/common/NotFoundStatus";

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

const DisplayField = ({ label, value, icon }) =>
  value && (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
      </div>
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

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useUserProfile(id);
  const [openSections, setOpenSections] = useState({
    personal: true,
    address: false,
    social: false,
    worker: false,
  });

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
            src={user.profile?.avatar?.url}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
            {user.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 capitalize dark:text-gray-100">
          {user.username?.replace(/_/g, " ") || "User"}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className="text-indigo-800 capitalize bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-100"
          >
            {user.role}
          </Badge>
          {user.rating?.average > 0 && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
            >
              <Star className="w-4 h-4 mr-1" />
              {user.rating.average} ({user.rating.count} reviews)
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="mt-8 space-y-6">
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
            <DisplayField
              label="Bio"
              value={user.profile?.bio}
              icon={<User className="w-4 h-4 text-gray-500" />}
            />
            <DisplayField
              label="Phone"
              value={user.profile?.phone}
              icon={<Phone className="w-4 h-4 text-gray-500" />}
            />
            {user.stats && (
              <>
                {user.stats.completedRepairs > 0 && (
                  <DisplayField
                    label="Completed Repairs"
                    value={user.stats.completedRepairs}
                    icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                  />
                )}
                {user.stats.completedSales > 0 && (
                  <DisplayField
                    label="Completed Sales"
                    value={user.stats.completedSales}
                    icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                  />
                )}
                {user.stats.responseRate > 0 && (
                  <DisplayField
                    label="Response Rate"
                    value={`${user.stats.responseRate}%`}
                    icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                  />
                )}
              </>
            )}
          </CardContent>
        </Section>

        {/* Address */}
        {user.profile?.address && (
          <Section
            title="Address"
            icon={<MapPin className="w-5 h-5 text-indigo-600" />}
            isOpen={openSections.address}
            setIsOpen={(open) =>
              setOpenSections({ ...openSections, address: open })
            }
          >
            <CardContent className="space-y-4">
              <DisplayField
                label="Street"
                value={user.profile.address.street}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
              />
              <DisplayField
                label="City"
                value={user.profile.address.city}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
              />
              <DisplayField
                label="State"
                value={user.profile.address.state}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
              />
              <DisplayField
                label="ZIP Code"
                value={user.profile.address.zip}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
              />
              <DisplayField
                label="Country"
                value={user.profile.address.country}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
              />
            </CardContent>
          </Section>
        )}

        {/* Social Media */}
        {user.profile?.socialMedia && (
          <Section
            title="Social Media"
            icon={<Globe className="w-5 h-5 text-indigo-600" />}
            isOpen={openSections.social}
            setIsOpen={(open) =>
              setOpenSections({ ...openSections, social: open })
            }
          >
            <CardContent className="space-y-4">
              {user.profile.socialMedia.website && (
                <DisplayField
                  label="Website"
                  value={
                    <a
                      href={user.profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {user.profile.socialMedia.website}
                    </a>
                  }
                  icon={<Globe className="w-4 h-4 text-gray-500" />}
                />
              )}
              {user.profile.socialMedia.linkedin && (
                <DisplayField
                  label="LinkedIn"
                  value={
                    <a
                      href={user.profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {user.profile.socialMedia.linkedin}
                    </a>
                  }
                  icon={<Globe className="w-4 h-4 text-gray-500" />}
                />
              )}
              {user.profile.socialMedia.twitter && (
                <DisplayField
                  label="Twitter"
                  value={
                    <a
                      href={user.profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {user.profile.socialMedia.twitter}
                    </a>
                  }
                  icon={<Globe className="w-4 h-4 text-gray-500" />}
                />
              )}
            </CardContent>
          </Section>
        )}

        {/* Worker Details (if worker) */}
        {user.role === "worker" && user.workerApplication && (
          <Section
            title="Worker Details"
            icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
            isOpen={openSections.worker}
            setIsOpen={(open) =>
              setOpenSections({ ...openSections, worker: open })
            }
          >
            <CardContent className="space-y-4">
              {user.workerApplication.status === "approved" && (
                <Badge
                  variant="secondary"
                  className="text-green-800 bg-green-100 dark:bg-green-800 dark:text-green-100"
                >
                  Approved Worker
                </Badge>
              )}
              {user.workerApplication.skills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.workerApplication.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.workerApplication.certifications?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.workerApplication.certifications.map((cert, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <DisplayField
                label="Experience"
                value={user.workerApplication.experience}
                icon={<Briefcase className="w-4 h-4 text-gray-500" />}
              />
              <DisplayField
                label="Availability"
                value={user.workerApplication.availability}
                icon={<Briefcase className="w-4 h-4 text-gray-500" />}
              />
              {user.workerApplication.workHistory?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work History
                  </p>
                  <ul className="pl-5 mt-1 text-sm text-gray-600 list-disc dark:text-gray-400">
                    {user.workerApplication.workHistory.map((job, idx) => (
                      <li key={idx}>
                        {job.position} at {job.company} ({job.startYear} -{" "}
                        {job.endYear || "Present"})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Section>
        )}
      </div>
    </motion.div>
  );
}
