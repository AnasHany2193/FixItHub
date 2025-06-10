import { useState } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, Ban, CheckCircle, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <HeaderPages
          title="User Management"
          subtitle="Manage users, change their statuses, or approve workers"
        />

        <RoleFilter
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ))}
        </div>
      ) : users?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onManage={() => {
                setSelectedUserId(user._id);
                setShowDialog(true);
              }}
            />
          ))}
        </div>
      ) : (
        <NotFoundStatus
          icon={<User />}
          title="No Users Found"
          message="No users match the selected role."
        />
      )}

      {/* User Details & Control Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="space-y-5">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and control user account.
            </DialogDescription>
          </DialogHeader>

          {userDetails ? (
            <div className="space-y-3">
              {/* Avatar + Username */}
              <div className="flex items-center gap-4">
                <img
                  src={userDetails.profile?.avatar?.url}
                  alt="avatar"
                  className="object-cover w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {userDetails.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.email}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Role:</strong> {userDetails.role}
                </p>
                <p>
                  <strong>Status:</strong> {userDetails.status}
                </p>
                <p>
                  <strong>Verified:</strong>{" "}
                  {userDetails.isVerified ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(userDetails.createdAt).toLocaleDateString()}
                </p>
                {userDetails.role === "worker" && (
                  <p>
                    <strong>Approval:</strong>{" "}
                    {userDetails.workerApplication?.status}
                  </p>
                )}
              </div>

              {/* Address */}
              {userDetails.profile?.fullAddress && (
                <p className="text-sm">
                  <strong>Address:</strong> {userDetails.profile.fullAddress}
                </p>
              )}

              {/* Worker Application */}
              {userDetails.role === "worker" && (
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Experience:</strong>{" "}
                    {userDetails.workerApplication?.experience}
                  </p>

                  {userDetails.workerApplication?.skills?.length > 0 && (
                    <div>
                      <strong>Skills:</strong>{" "}
                      {userDetails.workerApplication.skills.map((s, i) => (
                        <Badge key={i} className="mr-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {userDetails.workerApplication?.documents?.length > 0 && (
                    <div>
                      <strong>Documents:</strong>
                      <ul className="list-disc list-inside">
                        {userDetails.workerApplication.documents.map(
                          (doc, i) => (
                            <li key={i}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Document {i + 1}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Completed Repairs:</strong>{" "}
                  {userDetails.stats?.completedRepairs}
                </p>
                <p>
                  <strong>Completed Sales:</strong>{" "}
                  {userDetails.stats?.completedSales}
                </p>
                <p>
                  <strong>Response Rate:</strong>{" "}
                  {userDetails.stats?.responseRate}%
                </p>
                <p>
                  <strong>Rating:</strong> {userDetails.rating?.average} (
                  {userDetails.rating?.count} ratings)
                </p>
              </div>
            </div>
          ) : (
            <Skeleton className="w-full h-32" />
          )}

          <DialogFooter className="flex gap-2">
            {userDetails && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateUserStatus({
                      userId: userDetails._id,
                      status:
                        userDetails.status === "active" ? "banned" : "active",
                    });
                    setShowDialog(false);
                  }}
                >
                  {userDetails.status === "active"
                    ? "Ban User"
                    : "Activate User"}
                </Button>

                {userDetails.role === "worker" && (
                  <Button
                    onClick={() => {
                      updateWorkerApproval({
                        userId: userDetails._id,
                        status:
                          userDetails.workerApplication.status === "approved"
                            ? "rejected"
                            : "approved",
                      });
                      setShowDialog(false);
                    }}
                  >
                    {userDetails.workerApplication.status === "approved"
                      ? "Reject Worker"
                      : "Approve Worker"}
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
    <div className="flex justify-between p-2 rounded-lg md:gap-3 bg-muted dark:bg-gray-800">
      {roles.map((role) => (
        <Button
          key={role.value}
          variant={selectedRole === role.value ? "default" : "ghost"}
          size="sm"
          className="gap-2"
          onClick={() => setSelectedRole(role.value)}
        >
          {role.icon}
          {role.label}
        </Button>
      ))}
    </div>
  );
};

const UserCard = ({ user, onManage }) => {
  const statusStyle =
    user.status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusStyle}`}>
                {user.status === "active" ? <CheckCircle /> : <Ban />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.username}
              </h3>
            </div>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            onClick={onManage}
            className="w-full border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:hover:bg-indigo-900/20"
          >
            Manage User
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <Card className="p-4 space-y-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-800" />
      <Skeleton className="w-32 h-6 bg-gray-100 dark:bg-gray-800" />
    </div>
    <Skeleton className="w-full h-4 bg-gray-100 dark:bg-gray-800" />
    <Skeleton className="w-full h-10 bg-gray-100 dark:bg-gray-800" />
  </Card>
);
