import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Gavel,
  Clock,
  Hammer,
  AlertCircle,
  Trophy,
  DollarSign,
  RefreshCw,
} from "lucide-react";

import { useAuctionDetails, useSubmitBid } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdateBidDialog from "@/components/repair/UpdateBidDialog";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCarousel } from "@/components/common/ImageCarousel";

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
};

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bidPrice, setBidPrice] = useState("");
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const {
    data: auction,
    isFetching,
    refetch,
    isLoading,
  } = useAuctionDetails(id);
  const { mutate: submitBid } = useSubmitBid();

  const handleBidSubmit = () => {
    submitBid({ auctionId: id, bidPrice });
  };

  const handleRefreshBids = async () => {
    await refetch();
  };

  if (isLoading) return <PageSkeleton />;
  if (!auction) return <NotFoundState />;

  const repair = auction.repairRequest;

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
              <span className="text-sm">Back to Auctions</span>
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
                <Badge className="text-indigo-800 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400">
                  Auction Active
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

          {/* Add Customer Info */}
          <div className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-indigo-50 dark:bg-gray-800">
            <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
              <AvatarImage src={repair.customer?.profile?.avatar?.url} />
              <AvatarFallback>
                {repair.customer?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                Repair Requested By
              </p>
              <p className="font-medium dark:text-white">
                {repair.customer?.username}
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

            {/* Auction Details */}
            <SectionCard
              icon={
                <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Auction Details"
            >
              <Tabs defaultValue="description" className="">
                <TabsList className="flex w-full bg-gray-100 justify-evenly dark:bg-gray-600">
                  <TabsTrigger value="description" className="w-1/2">
                    Item Details
                  </TabsTrigger>
                  <TabsTrigger value="bids" className="w-1/2">
                    Bids
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4">
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
                </TabsContent>

                <TabsContent value="bids" className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Bid History</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshBids}
                      disabled={isFetching}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                      />
                      {isFetching ? "Refreshing..." : "Refresh Bids"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {auction.bids?.length > 0 ? (
                      auction.bids.map((bid) => (
                        <div
                          key={bid._id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted"
                        >
                          <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
                            <AvatarImage
                              src={bid.worker?.profile?.avatar?.url}
                            />
                            <AvatarFallback>
                              {bid.worker?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {bid.worker?.username || "Anonymous Technician"}
                              </span>
                              <Badge variant={bid.status}>
                                {bid.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span>${bid.bidPrice?.toFixed(2)}</span>
                            </div>
                          </div>

                          {auction.currentLowestBid?._id === bid._id && (
                            <Badge variant="indigo" className="ml-auto">
                              <Trophy className="w-4 h-4 mr-1" />
                              Lowest Bid
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center rounded-lg bg-muted">
                        <p className="text-muted-foreground">
                          No bids placed yet
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SectionCard
              icon={
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Auction Status"
            >
              <div className="space-y-4">
                <InfoItem
                  label="Current Lowest"
                  value={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={
                            auction.currentLowestBid?.worker?.profile?.avatar
                              ?.url
                          }
                        />
                        <AvatarFallback>
                          {auction.currentLowestBid?.worker?.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>${auction.currentLowest}</span>
                    </div>
                  }
                />
                <InfoItem
                  label="Starting Price"
                  value={`$${auction.startingMaxPrice}`}
                />
                <InfoItem
                  label="Time Remaining"
                  value={formatDistanceToNow(new Date(auction.expiresAt))}
                />
                <InfoItem
                  label="Total Bids"
                  value={auction.bids?.length || 0}
                />
              </div>
            </SectionCard>

            {/* Bid Form */}
            <SectionCard
              icon={
                <Hammer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title={auction.hasBid ? "Your Bid" : "Place Bid"}
            >
              {auction.hasBid ? (
                <div className="space-y-4">
                  <InfoItem
                    label="Your Bid"
                    value={`$${auction.myBid.bidPrice.toFixed(2)}`}
                  />
                  <InfoItem
                    label="Status"
                    value={<Badge>{auction.myBid.status}</Badge>}
                  />
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowUpdateDialog(true)}
                  >
                    Update Bid
                  </Button>

                  <Dialog
                    open={showUpdateDialog}
                    onOpenChange={setShowUpdateDialog}
                  >
                    {showUpdateDialog && (
                      <UpdateBidDialog
                        bid={auction.myBid}
                        lowestBid={auction.currentLowestBid.bidPrice}
                        onOpenChange={setShowUpdateDialog}
                      />
                    )}
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    type="number"
                    label="Bid Amount"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder={`Must be below $${auction.currentLowest}`}
                    min={0.01}
                    step="0.01"
                  />
                  <Button className="w-full" onClick={handleBidSubmit}>
                    Submit Bid
                  </Button>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reused components from repair detail page
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

const NotFoundState = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 mx-auto mt-8 text-center max-w-7xl">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="mb-2 text-2xl font-semibold">Auction Not Found</h3>
      <p className="mb-4 text-muted-foreground">
        The requested auction could not be found or has expired
      </p>
      <Button className="mt-4" onClick={() => navigate(-1)}>
        Return to Auctions
      </Button>
    </div>
  );
};
