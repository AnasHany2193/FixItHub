import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useUpdateTracking, useWorkerRepair } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const trackingStatusOrder = [
  "received", // 1. Item received
  "diagnosing", // 2. Diagnosis complete
  "repairing", // 3. Repair completed
  "quality_check", // 4. Quality verification passed
  "awaiting_payment", // 5. NEW: Payment required before shipping
  "payment_received", // 6. Payment confirmed
  "shipped", // 7. Item dispatched
];

const STATUS_CONFIG = {
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  },
  completed: {
    label: "Completed",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
};

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
};

export default function WorkerRepairDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const { mutate: updateStatus } = useUpdateTracking();
  const { data: repair, isLoading } = useWorkerRepair(id);

  if (isLoading) return <PageSkeleton />;
  if (!repair) return <NotFoundState navigate={navigate} />;

  const statusConfig =
    STATUS_CONFIG[repair.status] || STATUS_CONFIG.in_progress;

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-8 space-y-4">
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className="gap-2 -ml-2 group text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm">Back to Jobs</span>
            </Button>
          </motion.div>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {repair.itemType}
                </h1>
                <Badge variant="outline" className="font-mono">
                  #{id.slice(-6)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
                <Badge
                  variant={repair.shippingRequired ? "default" : "secondary"}
                >
                  {repair.shippingRequired ? "Shipping" : "Local Service"}
                </Badge>
              </div>
              <p className="capitalize text-muted-foreground">
                {repair.category} • {repair.status.replace(/_/g, " ")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p className="text-sm text-muted-foreground">
                Accepted: {formatDate(repair.updatedAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Due: {formatDate(repair.auction?.expiresAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Image Carousel */}
            <ImageCarousel images={repair.photos} />

            {/* Technical Details */}
            <SectionCard
              icon={
                <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Job Details"
            >
              <div className="space-y-4">
                <InfoItem
                  label="Customer Issue"
                  value={repair.issueDescription}
                />
                <InfoItem
                  label="Special Instructions"
                  value={repair.notes || "None"}
                />
                <InfoItem
                  label="Required Materials"
                  value={repair.materials?.join(", ") || "Not specified"}
                />
              </div>
            </SectionCard>

            {/* Status Tracking Section */}
            <SectionCard
              icon={
                <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Repair Progress"
            >
              <div className="space-y-6">
                <StatusTimeline trackingUpdates={repair.trackingUpdates} />

                {repair.trackingUpdates !== "shipped" && (
                  <Button
                    className="w-full"
                    onClick={() => setShowStatusDialog(true)}
                  >
                    Update Status
                  </Button>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Customer Info */}
            <SectionCard
              icon={
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Customer Information"
            >
              <div className="flex items-center gap-4 p-4">
                <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
                  <AvatarImage src={repair.customer?.profile?.avatar?.url} />
                  <AvatarFallback>
                    {repair.customer?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{repair.customer?.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {repair.shippingRequired
                      ? "Remote Service"
                      : "Local Service"}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Payment & Actions */}
            <SectionCard
              icon={
                <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Payment Details"
            >
              <div className="space-y-4">
                <InfoItem
                  label="Agreed Price"
                  value={`$${repair.paymentAmount?.toFixed(2)}`}
                />
                <InfoItem
                  label="Payment Status"
                  value={
                    <Badge
                      variant={
                        repair.paymentStatus === "paid" ? "success" : "warning"
                      }
                    >
                      {repair.paymentStatus?.toUpperCase()}
                    </Badge>
                  }
                />
                {repair.status === "in_progress" && (
                  <Button className="w-full" variant="success">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                {repair.status === "awaiting_payment" && (
                  <Button className="w-full" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Payment Pending
                  </Button>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Update Repair Status</DialogTitle>
            <DialogDescription>
              Select the current progress stage of this repair
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {trackingStatusOrder.map((status) => {
              const currentIndex = trackingStatusOrder.indexOf(
                repair.trackingUpdates?.slice(-1)[0]?.status || "received"
              );
              const statusIndex = trackingStatusOrder.indexOf(status);
              const isAllowed =
                statusIndex === 0 || statusIndex <= currentIndex + 1;

              return (
                <Button
                  key={status}
                  variant={statusIndex <= currentIndex ? "default" : "outline"}
                  className="justify-start w-full gap-2"
                  disabled={!isAllowed}
                  onClick={() => setSelectedStatus(status)}
                >
                  {statusIndex <= currentIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                  {status.replace(/_/g, " ").toUpperCase()}
                </Button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log({ repairId: repair._id, status: selectedStatus });
                updateStatus(
                  { repairId: repair._id, status: selectedStatus },
                  {
                    onSuccess: () => setShowStatusDialog(false),
                  }
                );
              }}
              disabled={!selectedStatus}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const StatusTimeline = ({ trackingUpdates }) => {
  const lastStatus = trackingUpdates?.[trackingUpdates.length - 1]?.status;

  return (
    <div className="relative pl-6 space-y-8">
      {trackingStatusOrder.map((status, index) => {
        const isCompleted =
          trackingStatusOrder.indexOf(status) <=
          trackingStatusOrder.indexOf(lastStatus);
        const isCurrent = status === lastStatus;

        return (
          <div key={status} className="relative flex items-center gap-4">
            <div
              className={`absolute w-0.5 h-full -left-[2px] ${
                isCompleted ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ml-3 ${
                isCompleted
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>

            <div>
              <p
                className={`font-medium ${
                  isCurrent
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {status.replace(/_/g, " ").toUpperCase()}
              </p>
              {trackingUpdates?.find((u) => u.status === status) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(
                    trackingUpdates.find((u) => u.status === status).timestamp
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Reusable Components
const SectionCard = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-white border rounded-xl dark:bg-gray-800 dark:border-gray-700"
  >
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const PageSkeleton = () => (
  <div className="px-4 py-8 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <Skeleton className="w-48 h-10 rounded-lg" />
      <Skeleton className="w-32 h-8 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  </div>
);

const NotFoundState = ({ navigate }) => (
  <div className="p-8 mx-auto mt-8 text-center max-w-7xl">
    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <h3 className="mb-2 text-2xl font-semibold">Job Not Found</h3>
    <p className="mb-4 text-muted-foreground">
      The requested repair job could not be found
    </p>
    <Button onClick={() => navigate(-1)}>Return to Jobs</Button>
  </div>
);
