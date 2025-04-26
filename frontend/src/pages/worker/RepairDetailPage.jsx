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
  Handshake,
  Package,
} from "lucide-react";

import {
  useAuctionDetails,
  useSubmitBid,
  useDirectOffersRepairDetails,
  useSubmitOffer,
} from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import UpdateProposalDialog from "@/components/common/UpdateProposalDialog";

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
};

export default function RepairDetailPage({ type = "auction" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [price, setPrice] = useState("");
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Hook selection based on type
  const hooks = {
    auction: {
      useDetails: useAuctionDetails,
      useSubmit: useSubmitBid,
    },
    offer: {
      useDetails: useDirectOffersRepairDetails,
      useSubmit: useSubmitOffer,
    },
  };

  const {
    data: repairData,
    isFetching,
    refetch,
    isLoading,
  } = hooks[type].useDetails(id);
  const { mutate: submitProposal } = hooks[type].useSubmit();

  const handleProposalSubmit = () => {
    const submissionData =
      type === "auction"
        ? { auctionId: id, bidPrice: price }
        : { repairId: id, offerPrice: price };

    submitProposal(submissionData);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) return <PageSkeleton type={type} />;
  if (!repairData) return <NotFoundState type={type} />;

  const repair = type === "auction" ? repairData.repairRequest : repairData;

  const proposals = type === "auction" ? repairData.bids : repairData.offers;
  const currentPrice =
    type === "auction" ? repairData.currentLowest : repairData.averageOffer;

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
              <span className="text-sm">
                Back to {type === "auction" ? "Auctions" : "Offers"}
              </span>
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
                <Badge variant="default">Auction Active</Badge>
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
            {/* Image Carousel */}
            <ImageCarousel images={repair.photos} />

            {/* Customer Info Section */}
            <CustomerInfo repair={repair} />

            {/* Details Section */}
            <SectionCard
              icon={
                <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="Repair Details"
            >
              <Tabs defaultValue="description">
                <TabsList className="flex w-full bg-gray-100 justify-evenly dark:bg-gray-600">
                  <TabsTrigger value="description" className="w-1/2">
                    Item Details
                  </TabsTrigger>
                  <TabsTrigger value="proposals" className="w-1/2">
                    {type === "auction" ? "Bids" : "Offers"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4">
                  <div className="space-y-4">
                    <InfoItem label="Item Type" value={repair.itemType} />
                    <InfoItem label="Category" value={repair.category} />
                    <div className="pt-4">
                      <h3 className="mb-2 font-medium text-foreground">
                        About This Repair
                      </h3>
                      <p className="text-muted-foreground">
                        {repair.issueDescription}
                      </p>
                      {repair.shippingRequired && (
                        <div className="p-4 mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <h4 className="flex items-center gap-2 font-medium">
                            <Package className="w-5 h-5" />
                            Shipping Instructions
                          </h4>
                          <p className="mt-2 text-sm">
                            This item requires special shipping handling.
                            Contact the customer for shipping details.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="proposals">
                  <div className="flex items-center justify-between my-4">
                    <h3 className="text-lg font-semibold">
                      {type === "auction" ? "Bid" : "Offer"} Activity
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isFetching}
                    >
                      <RefreshCw
                        className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {proposals?.length > 0 ? (
                      proposals.map((proposal) => (
                        <ProposalItem
                          key={proposal._id}
                          proposal={proposal}
                          type={type}
                          isLeading={
                            type === "auction"
                              ? repairData.currentLowestBid?._id ===
                                proposal._id
                              : false
                          }
                        />
                      ))
                    ) : (
                      <div className="p-4 text-center rounded-lg bg-muted">
                        <p className="text-muted-foreground">
                          No {type === "auction" ? "bids" : "offers"} yet - be
                          the first!
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
                type === "auction" ? (
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Handshake className="w-5 h-5 text-green-600 dark:text-green-400" />
                )
              }
              title={type === "auction" ? "Auction Timeline" : "Offer Details"}
            >
              <div className="space-y-4">
                {type === "auction" && (
                  <InfoItem
                    label="Time Remaining"
                    value={formatDistanceToNow(new Date(repairData.expiresAt))}
                  />
                )}
                <InfoItem
                  label={
                    type === "auction" ? "Starting Price" : "Average Offer"
                  }
                  value={`$${
                    type === "auction"
                      ? repairData.startingMaxPrice
                      : currentPrice?.toFixed(2) || "N/A"
                  }`}
                />
                {type === "auction" && (
                  <InfoItem
                    label="Current Lowest"
                    value={
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>${currentPrice}</span>
                      </div>
                    }
                  />
                )}
                <InfoItem
                  label={`Total ${type === "auction" ? "Bids" : "Offers"}`}
                  value={proposals?.length || 0}
                />
              </div>
            </SectionCard>

            {/* Proposal Form */}
            <SectionCard
              icon={
                type === "auction" ? (
                  <Hammer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Handshake className="w-5 h-5 text-green-600 dark:text-green-400" />
                )
              }
              title={
                repairData.hasBid || repairData.hasOffer
                  ? "Your Proposal"
                  : `Place ${type === "auction" ? "Bid" : "Offer"}`
              }
            >
              {repairData.hasBid || repairData.hasOffer ? (
                <div className="space-y-4">
                  <InfoItem
                    label={`Your ${type === "auction" ? "Bid" : "Offer"}`}
                    value={`$${repairData.myBid?.bidPrice?.toFixed(2) || repairData.myOffer?.offerPrice?.toFixed(2)}`}
                  />
                  <InfoItem
                    label="Status"
                    value={
                      <Badge variant="default">
                        {repairData.myBid?.status || repairData.myOffer?.status}
                      </Badge>
                    }
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowUpdateDialog(true)}
                  >
                    Modify {type === "auction" ? "Bid" : "Offer"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      label={`Enter ${type === "auction" ? "Bid" : "Offer"} Amount`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={
                        type === "auction"
                          ? `Max $${currentPrice - 0.01}`
                          : "Minimum $1"
                      }
                      min={type === "auction" ? 0.01 : 1}
                      step="0.01"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleProposalSubmit}
                    disabled={!price}
                  >
                    Submit {type === "auction" ? "Competitive Bid" : "Offer"}
                  </Button>
                </div>
              )}
            </SectionCard>

            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              {showUpdateDialog && (
                <UpdateProposalDialog
                  proposal={repairData.myBid || repairData.myOffer}
                  type={type}
                  currentPrice={currentPrice}
                  onOpenChange={setShowUpdateDialog}
                />
              )}
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated ProposalItem component
const ProposalItem = ({ proposal, type, isLeading }) => {
  const price = type === "auction" ? proposal.bidPrice : proposal.offerPrice;
  const date = type === "auction" ? proposal.submittedAt : proposal.createdAt;

  return (
    <div className="flex items-center gap-5 p-4 rounded-lg bg-muted">
      <Avatar className="border-2 border-indigo-100 dark:border-gray-600">
        <AvatarImage src={proposal.worker?.profile?.avatar?.url} />
        <AvatarFallback>
          {proposal.worker?.username?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {proposal.worker?.username || "Anonymous Technician"}
          </span>
          <Badge
            variant={proposal.status === "pending" ? "default" : "secondary"}
          >
            {proposal.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-start">
            <DollarSign className="w-4 h-4" />
            <span>{price?.toFixed(2)}</span>
          </div>
          <span className="ml-2 text-xs">
            {formatDistanceToNow(new Date(date))} ago
          </span>
        </div>
      </div>
      {isLeading && type === "auction" && (
        <Badge variant="premium" className="gap-1">
          <Trophy className="w-4 h-4" />
          Leading
        </Badge>
      )}
    </div>
  );
};

const NotFoundState = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 mx-auto mt-8 text-center max-w-7xl">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="mb-2 text-2xl font-semibold">
        {type === "auction" ? "Auction" : "Repair"} Not Found
      </h3>
      <p className="mb-4 text-muted-foreground">
        {type === "auction"
          ? "The requested auction could not be found or has expired"
          : "The requested repair offer could not be found"}
      </p>
      <Button className="mt-4" onClick={() => navigate(-1)}>
        Return to {type === "auction" ? "Auctions" : "Offers"}
      </Button>
    </div>
  );
};

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

const CustomerInfo = ({ repair }) => (
  <div className="p-4 rounded-lg bg-indigo-50 dark:bg-gray-800">
    <div className="flex items-center gap-4">
      <Avatar className="w-12 h-12 border-2 border-indigo-100 dark:border-gray-600">
        <AvatarImage src={repair.customer?.profile?.avatar?.url} />
        <AvatarFallback className="bg-indigo-100 dark:bg-gray-700">
          {repair.customer?.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
          Repair Requester
        </h3>
        <p className="text-lg font-semibold dark:text-white">
          {repair.customer?.username || "Anonymous User"}
        </p>
        <p className="text-sm text-muted-foreground">
          Member since {formatDate(repair.customer?.createdAt)}
        </p>
      </div>
    </div>
  </div>
);
