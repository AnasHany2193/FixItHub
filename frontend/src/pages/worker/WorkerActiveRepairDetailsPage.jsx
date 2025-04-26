import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Hammer,
  Package,
} from "lucide-react";

import {
  useCompleteRepair,
  useReturnRepair,
  useUpdateTracking,
  useWorkerRepair,
} from "@/hooks/useRepair";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

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

export default function WorkerActiveRepairDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: repair, isLoading } = useWorkerRepair(id);
  const { mutate: updateStatus } = useUpdateTracking();
  const { mutate: returnRepair, isPending: isReturning } = useReturnRepair();
  const { mutate: completeRepair, isPending: isCompleting } =
    useCompleteRepair();

  const statusConfig = STATUS_CONFIG[repair?.status || "in_progress"];

  console.log(repair.trackingUpdates.length > 4);
  console.log(repair.trackingUpdates[4]);

  if (isLoading) return <PageSkeleton />;
  if (!repair) return <NotFoundState navigate={navigate} />;

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
              <span className="text-sm">Back to Repairs</span>
            </Button>
          </motion.div>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {repair.title}
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
                  {repair.shippingRequired
                    ? "Shipping Required"
                    : "Local Service"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(repair.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Updated: {formatDate(repair.updatedAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            <ImageCarousel images={repair.photos} />

            {/* Issue Details */}
            <SectionCard
              icon={
                <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Job Details"
            >
              <div className="space-y-4">
                <InfoItem label="Item Type" value={repair.itemType} />
                <InfoItem label="Category" value={repair.category} />
                <div className="pt-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Customer Issue
                  </h3>
                  <p className="text-muted-foreground">
                    {repair.issueDescription}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={
                <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Repair Journey"
            >
              <StatusTimeline
                trackingUpdates={repair.trackingUpdates}
                onAddStep={() => setSelectedStatus("")}
              />
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SectionCard
              icon={
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Customer Information"
            >
              <div className="flex items-center gap-4 p-3">
                <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
                  <AvatarImage src={repair.customer?.profile?.avatar?.url} />
                  <AvatarFallback className="bg-indigo-100 dark:bg-gray-700">
                    {repair.customer?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {repair.customer?.username || "Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {repair.shippingRequired
                      ? "Remote Service"
                      : "Local Service"}
                  </p>
                </div>
              </div>
            </SectionCard>

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

                {repair.paymentStatus === "paid" &&
                  repair.status === "in_progress" && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={isCompleting}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </Button>
                  )}
              </div>
            </SectionCard>

            {(repair.status === "in_progress" ||
              repair.status === "awaiting_payment") && (
              <SectionCard
                icon={
                  <Hammer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
                title="Repair Actions"
              >
                <div className="space-y-4">
                  {/* Status update controls */}
                  {repair.trackingUpdates.length > 0 && (
                    <>
                      <Select
                        onValueChange={setSelectedStatus}
                        value={selectedStatus}
                        disabled={repair.paymentStatus === "paid"}
                      >
                        <SelectTrigger className="w-full capitalize">
                          {selectedStatus.replace(/_/g, " ") ||
                            "Select next status"}
                        </SelectTrigger>
                        <SelectContent>
                          {trackingStatusOrder
                            .slice(1, 5) // Only allow up to 'awaiting_payment'
                            .filter((status) => {
                              const currentIndex = trackingStatusOrder.indexOf(
                                repair.trackingUpdates.slice(-1)[0].status
                              );
                              return (
                                trackingStatusOrder.indexOf(status) ===
                                currentIndex + 1
                              );
                            })
                            .map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="capitalize"
                              >
                                {status.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="w-full"
                        onClick={() =>
                          updateStatus({ repairId: id, status: selectedStatus })
                        }
                        disabled={
                          !selectedStatus || repair.paymentStatus === "paid"
                        }
                      >
                        Update Status
                      </Button>
                    </>
                  )}

                  {/* Return item button - only show if not paid */}
                  {repair.paymentStatus !== "paid" && (
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => returnRepair({ repairId: id })}
                      disabled={isReturning}
                    >
                      <Package className="w-4 h-4" />
                      Return Item
                    </Button>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="space-y-5">
          <DialogHeader>
            <DialogTitle>Confirm Repair Completion</DialogTitle>
            <DialogDescription>
              This action will mark the repair as completed and notify the
              customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                completeRepair({ repairId: id });
                setShowCompleteDialog(false);
              }}
            >
              Confirm Completion
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
                  {formatDistanceToNow(
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
