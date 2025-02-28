import { useParams } from "react-router-dom";
import { useRepairDetails } from "@/hooks/useRepair";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wrench, MapPin, ShieldAlert } from "lucide-react";
import StartAuctionDialog from "@/components/repair/StartAuctionDialog";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

const STATUS_CONFIG = {
  auction_open: {
    label: "Auction Active",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  awaiting_assignment: {
    label: "Awaiting Assignment",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
  },
};

export default function RepairDetailsPage() {
  const { id } = useParams();
  const { data: repair, isLoading, isError, error } = useRepairDetails(id);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);

  const safeFormatDate = (dateString) => {
    try {
      return dateString ? formatDistanceToNow(new Date(dateString)) : "N/A";
    } catch {
      return "N/A";
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState error={error} />;
  if (!repair) return <NotFoundState />;

  const statusConfig =
    STATUS_CONFIG[repair.status] || STATUS_CONFIG.awaiting_assignment;

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-8 space-y-4">
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className="gap-2 -ml-2 group text-muted-foreground hover:text-foreground"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm">Back to Repairs</span>
            </Button>
          </motion.div>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {repair.title}
                <Badge variant="outline" className="ml-3 font-mono">
                  #{id.slice(-6)}
                </Badge>
              </h1>
              <p className="mt-2 text-muted-foreground">
                {repair.itemType} • {repair.category}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              <p className="text-sm text-muted-foreground">
                Created {safeFormatDate(repair.createdAt)} ago
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
                          alt="Repair evidence"
                          className="object-contain w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Carousel Controls */}
                <div className="absolute w-full px-4 top-1/2">
                  <div className="flex justify-between -translate-y-1/2">
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {repair.photos?.length > 1 && (
                  <div className="absolute -translate-x-1/2 bottom-4 left-1/2">
                    <div className="flex gap-2 px-4 py-2 border rounded-full bg-background/90 backdrop-blur-sm">
                      {repair.photos.map((photo, idx) => (
                        <button
                          key={photo.public_id}
                          className="w-10 h-10 transition-opacity hover:opacity-100"
                          style={{ opacity: idx === 0 ? 1 : 0.6 }}
                        >
                          <img
                            src={photo.url}
                            className="object-cover w-full h-full rounded-sm"
                            alt={`Thumbnail ${idx + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Carousel>
            </motion.div>

            {/* Details Section */}
            <div className="space-y-8">
              <SectionCard
                icon={
                  <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
                title="Issue Breakdown"
              >
                <p className="leading-relaxed text-foreground/90">
                  {repair.issueDescription}
                </p>
              </SectionCard>

              <SectionCard
                icon={
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
                title="Service Timeline"
              >
                <div className="pl-4 space-y-6 border-l-2 border-border">
                  {repair.trackingUpdates?.map((update, index) => (
                    <TimelineItem key={index} update={update} />
                  ))}
                  {!repair.trackingUpdates?.length && (
                    <p className="text-muted-foreground">
                      No tracking updates available yet
                    </p>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SectionCard title="Auction Details">
              <div className="space-y-4">
                <InfoItem
                  label="Current Bid"
                  value={repair.auction?.currentLowestBid?.bidPrice || "-"}
                />
                <InfoItem
                  label="Time Remaining"
                  value={
                    repair.auction?.status === "open"
                      ? safeFormatDate(repair.auction.expiresAt)
                      : "Auction closed"
                  }
                />
                <InfoItem label="Total Bids" value={repair.bids?.length || 0} />
              </div>
            </SectionCard>

            <SectionCard title="Payment Information">
              <div className="space-y-4">
                <InfoItem
                  label="Status"
                  value={
                    <Badge
                      variant={
                        repair.paymentStatus === "paid" ? "success" : "warning"
                      }
                    >
                      {repair.paymentStatus}
                    </Badge>
                  }
                />
                <InfoItem
                  label="Amount"
                  value={`$${repair.paymentAmount?.toFixed(2)}`}
                />
                <InfoItem
                  label="Method"
                  value={repair.paymentDetails?.method || "Not specified"}
                />
              </div>
            </SectionCard>

            {(repair.status === "awaiting_assignment" ||
              repair.status === "cancelled") && (
              <div className="p-6 space-y-4 border border-indigo-100 rounded-xl bg-indigo-50 dark:border-gray-700 dark:bg-gray-800">
                <div className="space-y-2">
                  <h3 className="font-medium text-indigo-900 dark:text-indigo-200">
                    Start Auction
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400">
                    Get competitive bids from certified technicians
                  </p>
                </div>
                <Button
                  className="w-full bg-indigo-600 dark:text-indigo-200 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  onClick={() => setShowAuctionDialog(true)}
                >
                  Start Auction
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAuctionDialog} onOpenChange={setShowAuctionDialog}>
        {showAuctionDialog && (
          <StartAuctionDialog
            repair={repair}
            onOpenChange={setShowAuctionDialog}
          />
        )}
      </Dialog>
    </div>
  );
}

// Sub-components
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

const TimelineItem = ({ update }) => (
  <div className="relative pl-6">
    <div className="absolute left-0 top-4 w-2.5 h-2.5 bg-primary rounded-full -translate-x-[calc(0.75rem+1px)]" />
    <div className="flex flex-col gap-1">
      <p className="font-medium capitalize text-foreground">
        {update.status.replace(/_/g, " ")}
      </p>
      <p className="text-sm text-muted-foreground">
        {new Date(update.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      {update.location && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground ">
            {update.location}
          </span>
        </div>
      )}
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

// Loading State
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
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  </div>
);

// Error State
const ErrorState = ({ error }) => (
  <div className="p-6 mx-auto mt-8 max-w-7xl bg-red-50 dark:bg-red-900/20 rounded-xl">
    <Alert variant="destructive">
      <Alert.Title>Error Loading Repair</Alert.Title>
      <Alert.Description>{error.message}</Alert.Description>
    </Alert>
  </div>
);

// Not Found State
const NotFoundState = () => (
  <div className="p-8 mx-auto mt-8 text-center max-w-7xl">
    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <h3 className="mb-2 text-2xl font-semibold">Repair Not Found</h3>
    <p className="mb-4 text-muted-foreground">
      The requested repair could not be found.
    </p>
    <Button className="mt-4" onClick={() => window.history.back()}>
      Return to Repairs
    </Button>
  </div>
);
