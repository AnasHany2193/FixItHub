import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Gavel, Clock, Hammer, AlertCircle } from "lucide-react";

import { useAuctionDetails, useSubmitBid } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const { data: auction, isLoading } = useAuctionDetails(id);
  const { mutate: submitBid } = useSubmitBid();

  const handleBidSubmit = () => {
    submitBid({ auctionId: id, bidPrice });
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

            {/* Auction Details */}
            <SectionCard
              icon={
                <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Auction Details"
            >
              <Tabs defaultValue="description">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="description">Item Details</TabsTrigger>
                  <TabsTrigger value="bids">Bid History</TabsTrigger>
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
                  <div className="space-y-4">
                    {auction.bids?.length > 0 ? (
                      auction.bids.map((bid) => (
                        <div
                          key={bid._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        >
                          <div>
                            <p className="font-medium">${bid.bidPrice}</p>
                          </div>
                          <Badge variant={bid.status}>
                            {bid.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No bids placed yet
                      </p>
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
                  label="Current Lowest Bid"
                  value={`$${auction.currentLowest}`}
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
                    value={`$${auction.myBid.bidPrice}`}
                  />
                  <InfoItem
                    label="Status"
                    value={<Badge>{auction.myBid.status}</Badge>}
                  />
                  <Button className="w-full" variant="outline">
                    Update Bid
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    type="number"
                    label="Bid Amount"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder={`Must be below $${auction.currentLowest}`}
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
