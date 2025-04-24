import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  ShieldAlert,
  User,
  Trash2,
  PencilLine,
  Gavel,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import {
  useAcceptBid,
  useCancelRepair,
  useRepairDetails,
} from "@/hooks/useRepair";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import StartAuctionDialog from "@/components/repair/StartAuctionDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
};

export default function RepairDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);

  const { mutate: cancelRepair } = useCancelRepair();
  const { data: repair, isLoading, isError } = useRepairDetails(id);

  if (isLoading) return <PageSkeleton />;
  if (!repair || isError) return <NotFoundState />;

  const statusConfig =
    STATUS_CONFIG[repair.status] || STATUS_CONFIG.awaiting_assignment;

  // New section for auction status
  const AuctionStatusSection = () => {
    const { refetch, isFetching } = useRepairDetails(id);

    return (
      <SectionCard
        icon={
          <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        }
        title="Active Bids"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Submitted Bids</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {repair.proposals?.length > 0 ? (
            repair.proposals.map((bid) => (
              <BidCard key={bid._id} bid={bid} repairId={repair._id} />
            ))
          ) : (
            <div className="p-4 text-center rounded-lg bg-muted">
              <p className="text-muted-foreground">No active bids yet</p>
            </div>
          )}
        </div>
      </SectionCard>
    );
  };

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
              <p className="capitalize text-muted-foreground">
                {repair.itemType} • {repair.category}
              </p>
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

            {/* Issue Details */}
            <SectionCard
              icon={
                <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Technical Details"
            >
              <div className="space-y-4">
                <InfoItem label="Item Type" value={repair.itemType} />
                <InfoItem label="Category" value={repair.category} />
                <div className="pt-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Issue Description
                  </h3>
                  <p className="text-muted-foreground">
                    {repair.issueDescription}
                  </p>
                </div>
              </div>
            </SectionCard>

            <AuctionStatusSection />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Payment Information */}
            <SectionCard
              icon={
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Payment & Billing"
            >
              <div className="space-y-4">
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
                <InfoItem
                  label="Payment Method"
                  value={repair.paymentDetails?.method || "Not specified"}
                />
                <InfoItem
                  label="Last Updated"
                  value={formatDate(repair.updatedAt)}
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

            {repair.status === "auction_open" && (
              <div className="flex gap-3 mt-4">
                <Button
                  variant="destructive"
                  onClick={() => cancelRepair(repair._id)}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel Repair</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate(`/repairs/${repair._id}/edit`)}
                  className="flex-1 gap-2 border border-indigo-300 shadow-md dark:border-gray-700"
                >
                  <PencilLine className="w-4 h-4" />
                  <span>Edit Repair</span>
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

export const BidCard = ({ bid, repairId }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: acceptBid, isPending } = useAcceptBid();

  return (
    <div className="relative p-4 transition-all border rounded-lg group hover:border-indigo-200 dark:hover:border-gray-600">
      <div className="flex items-center gap-4">
        <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
          <AvatarImage src={bid.worker?.profile?.avatar?.url} />
          <AvatarFallback className="bg-indigo-100 dark:bg-gray-700">
            {bid.worker?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {bid.worker?.username || "Anonymous Technician"}
            </span>
            <Badge variant={bid.status}>{bid.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{bid.worker?.rating?.average?.toFixed(1) || "New"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{bid.bidPrice?.toFixed(2)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(bid.createdAt)}</span>
            </div>
          </div>
        </div>

        {bid.status === "pending" && (
          <>
            <Button
              variant="success"
              size="sm"
              className="transition-opacity opacity-0 group-hover:opacity-100 hover:bg-indigo-200 dark:hover:bg-gray-600"
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Bid
            </Button>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Bid Acceptance</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to accept this bid from{" "}
                    {bid.worker?.username}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => {
                        acceptBid({ repairId, bidId: bid._id });
                        setShowConfirm(false);
                      }}
                    >
                      Confirm Acceptance
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

// Sub-components
const SectionCard = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-white border rounded-xl dark:bg-gray-800 dark:border-gray-700"
  >
    <div className="flex gap-3 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border">
    <span className="text-muted-foreground">{label}</span>
    <div className="font-medium text-foreground">{value}</div>
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
