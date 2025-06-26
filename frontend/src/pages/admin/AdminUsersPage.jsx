import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  Ban,
  CheckCircle,
  Hammer,
  BadgeCheck,
  FileText,
  Star,
  Calendar,
  XCircle,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import HeaderPages from "@/components/common/HeaderPages";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import {
  useUsersByRole,
  useUserDetails,
  useUpdateUserStatus,
  useUpdateWorkerApproval,
} from "@/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";

export default function AdminUsersPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: users, isLoading } = useUsersByRole(selectedRole);
  const { data: userDetails } = useUserDetails(selectedUserId, {
    enabled: !!selectedUserId && showDialog,
  });

  const { mutate: updateUserStatus } = useUpdateUserStatus();
  const { mutate: updateWorkerApproval } = useUpdateWorkerApproval();

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <HeaderPages
          title="User Management"
          subtitle="Manage users, change their statuses, or approve workers"
        />

        <RoleFilter
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />
      </div>

      {/* Content Section */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Empty State */}
        {!isLoading && users?.length === 0 && (
          <NotFoundStatus
            icon={<User className="w-12 h-12 text-gray-400" />}
            title="No Users Found"
            message="No users match the selected role."
          />
        )}

        {/* Users Grid */}
        {!isLoading && users?.length > 0 && (
          <UsersGrid
            users={users}
            onManage={(userId) => {
              setSelectedUserId(userId);
              setShowDialog(true);
            }}
          />
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md md:max-w-2xl max-h-[95%] overflow-auto space-y-5 bg-white dark:bg-gray-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              User Details
            </DialogTitle>
            <DialogDescription>
              View and manage user account details
            </DialogDescription>
          </DialogHeader>

          {userDetails ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center gap-4">
                  <Link to={`/profile/${userDetails?._id}`}>
                    <Avatar className="w-16 h-16 border-2 border-indigo-100 cursor-pointer dark:border-gray-600">
                      <AvatarImage
                        src={userDetails.profile?.avatar?.url}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-gray-800 bg-indigo-100 dark:bg-gray-700 dark:text-white">
                        {userDetails?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize dark:text-white">
                      {userDetails.username.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {userDetails.email}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant={
                          userDetails.status === "active"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {userDetails.status === "active" ? "Active" : "Banned"}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {userDetails.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Account Info */}
                <InfoCard
                  title="Account Information"
                  icon={
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  }
                >
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Joined"
                  >
                    {formatDistanceToNow(new Date(userDetails.createdAt), {
                      addSuffix: true,
                    })}
                  </InfoItem>
                  <InfoItem
                    icon={<CheckCircle className="w-4 h-4" />}
                    label="Verified"
                  >
                    {userDetails.isVerified ? "Yes" : "No"}
                  </InfoItem>
                </InfoCard>

                {/* Stats */}
                <InfoCard
                  title="Performance Stats"
                  icon={
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  }
                >
                  <InfoItem
                    icon={<Hammer className="w-4 h-4" />}
                    label="Repairs"
                  >
                    {userDetails.stats?.completedRepairs || 0}
                  </InfoItem>
                  <InfoItem
                    icon={<Package className="w-4 h-4" />}
                    label="Sales"
                  >
                    {userDetails.stats?.completedSales || 0}
                  </InfoItem>
                  <InfoItem
                    icon={<BadgeCheck className="w-4 h-4" />}
                    label="Rating"
                  >
                    {userDetails.rating?.average || 0}/5 (
                    {userDetails.rating?.count || 0} reviews)
                  </InfoItem>
                </InfoCard>

                {/* Worker Application */}
                {userDetails.role === "worker" && (
                  <InfoCard
                    title="Worker Application"
                    icon={
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    }
                  >
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            userDetails.workerApplication?.status === "approved"
                              ? "success"
                              : userDetails.workerApplication?.status ===
                                  "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {userDetails.workerApplication?.status || "pending"}
                        </Badge>
                        <Progress
                          value={
                            userDetails.workerApplication?.status === "approved"
                              ? 100
                              : userDetails.workerApplication?.status ===
                                  "rejected"
                                ? 0
                                : 50
                          }
                          className="flex-1 h-2"
                        />
                      </div>
                    </div>

                    <InfoItem
                      icon={<User className="w-4 h-4" />}
                      label="Experience"
                    >
                      {userDetails.workerApplication?.experience || "N/A"}
                    </InfoItem>

                    {userDetails.workerApplication?.skills?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userDetails.workerApplication.skills.map(
                            (skill, i) => (
                              <Badge key={i} variant="outline">
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {userDetails.workerApplication?.documents?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Documents
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {userDetails.workerApplication.documents.map(
                            (doc, i) => (
                              <a
                                key={i}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                              >
                                <FileText className="w-4 h-4" />
                                Document {i + 1}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </InfoCard>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="w-full h-32 rounded-xl" />
              <Skeleton className="w-full h-32 rounded-xl" />
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>

            {userDetails && (
              <>
                <Button
                  variant={
                    userDetails.status === "active" ? "destructive" : "success"
                  }
                  onClick={() => {
                    updateUserStatus({
                      userId: userDetails._id,
                      status:
                        userDetails.status === "active" ? "banned" : "active",
                    });
                    setShowDialog(false);
                  }}
                >
                  {userDetails.status === "active" ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" /> Ban User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Activate User
                    </>
                  )}
                </Button>

                {userDetails.role === "worker" && (
                  <Button
                    variant={
                      userDetails.workerApplication?.status === "approved"
                        ? "destructive"
                        : "success"
                    }
                    onClick={() => {
                      updateWorkerApproval({
                        userId: userDetails._id,
                        status:
                          userDetails.workerApplication?.status === "approved"
                            ? "rejected"
                            : "approved",
                      });
                      setShowDialog(false);
                    }}
                  >
                    {userDetails.workerApplication?.status === "approved" ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" /> Reject Worker
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="w-4 h-4 mr-2" /> Approve Worker
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== COMPONENTS =====
const RoleFilter = ({ selectedRole, setSelectedRole }) => {
  const roles = [
    { value: "", label: "All", icon: <User className="w-4 h-4" /> },
    {
      value: "customer",
      label: "Customers",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    { value: "worker", label: "Workers", icon: <Hammer className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      {roles.map((role) => (
        <motion.button
          key={role.value}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRole === role.value
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
          }`}
          onClick={() => setSelectedRole(role.value)}
        >
          {role.icon}
          {role.label}
        </motion.button>
      ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="p-4 space-y-4 border rounded-xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
          <Skeleton className="h-[120px] rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
          <div className="space-y-2">
            <Skeleton className="h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
            <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const UsersGrid = ({ users, onManage }) => (
  <motion.div
    layout
    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <AnimatePresence>
      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          onManage={() => onManage(user._id)}
        />
      ))}
    </AnimatePresence>
  </motion.div>
);

const UserCard = ({ user, onManage }) => {
  const statusGradient =
    user.status === "active"
      ? "from-green-600 to-emerald-600"
      : "from-red-600 to-rose-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="group"
    >
      <Card className="flex flex-col justify-between h-full overflow-hidden transition-all border shadow-lg hover:shadow-xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
        {/* Status Header */}
        <div className={`p-4 text-white bg-gradient-to-r ${statusGradient}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user?._id}`}>
                <Avatar className="border-2 border-indigo-100 cursor-pointer dark:border-gray-600">
                  <AvatarImage
                    src={user.profile?.avatar?.url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-gray-800 bg-indigo-100 dark:bg-gray-700 dark:text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <h3 className="font-semibold capitalize">
                {user.username.replace(/_/g, " ")}
              </h3>
            </div>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300">{user.email}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Joined{" "}
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {user.role === "worker" && user.workerApplication?.status && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-700 capitalize dark:text-gray-300">
                  {user.workerApplication.status}
                </p>
                <Progress
                  value={
                    user.workerApplication.status === "approved"
                      ? 100
                      : user.workerApplication.status === "rejected"
                        ? 0
                        : 50
                  }
                  className="h-1 mt-1 bg-white/20 dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            onClick={onManage}
            className="w-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
          >
            <span>Manage User</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <div className="p-4 border border-gray-200 rounded-xl dark:border-gray-700">
    <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
      {icon}
      <h4 className="font-semibold">{title}</h4>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, children }) => (
  <div>
    <p className="text-xs text-gray-600 dark:text-gray-300">{label}</p>
    <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white">
      {icon}
      <span>{children}</span>
    </div>
  </div>
);
