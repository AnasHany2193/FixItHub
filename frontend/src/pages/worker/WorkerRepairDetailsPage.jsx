import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  User,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useWorkerRepair } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden border shadow-sm rounded-xl border-border"
            >
              <Carousel>
                <CarouselContent>
                  {repair.photos?.map((photo) => (
                    <CarouselItem key={photo.public_id}>
                      <div className="relative aspect-video">
                        <img
                          src={photo.url}
                          alt="Repair item"
                          className="object-contain w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>

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

            {/* Shipping Info */}
            {repair.shippingRequired && (
              <SectionCard
                icon={
                  <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
                title="Shipping Information"
              >
                <div className="space-y-4">
                  <InfoItem
                    label="Shipping Address"
                    value={repair.shippingAddress}
                  />
                  <InfoItem
                    label="Tracking Number"
                    value={repair.trackingNumber || "Not available"}
                  />
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
