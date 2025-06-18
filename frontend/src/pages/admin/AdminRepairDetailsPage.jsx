import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Wrench,
  Gavel,
  Handshake,
  RefreshCw,
} from "lucide-react";
import {
  useRepairDetails,
  useResetAuction,
  useDeleteRepair,
  useCancelRepair,
  useCloseAuction,
} from "@/hooks/useAdmin";
import { formatDistanceToNow, format } from "date-fns";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import { motion } from "framer-motion";

// Status configuration reused from customer page
const STATUS_CONFIG = {
  awaiting_assignment: {
    label: "Awaiting Assignment",
    color: "bg-blue-100 text-blue-800",
  },
  auction_open: {
    label: "Auction Active",
    color: "bg-indigo-100 text-indigo-800",
  },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "bg-purple-100 text-purple-800",
  },
  returning_to_customer: {
    label: "Returning Item",
    color: "bg-cyan-100 text-cyan-800",
  },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-800" },
};

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
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
  <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
    <span className="text-muted-foreground">{label}</span>
    <div className="font-medium">{value}</div>
  </div>
);

const ProposalCard = ({ proposal, isAuction }) => {
  const price = isAuction ? proposal.bidPrice : proposal.offerPrice;
  const submittedAt = proposal.submittedAt || proposal.createdAt;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={proposal.worker?.profile?.avatar?.url} />
          <AvatarFallback>
            {proposal.worker?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{proposal.worker?.username}</div>
          <div className="text-sm text-muted-foreground">
            {isAuction ? "Bid" : "Offer"}: ${price?.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Submitted: {formatDistanceToNow(new Date(submittedAt))}
          </div>
          {proposal.status && (
            <Badge
              variant={proposal.status === "accepted" ? "success" : "secondary"}
            >
              {proposal.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const RepairDetails = ({ repair }) => (
  <SectionCard
    icon={<Wrench className="w-5 h-5 text-indigo-600" />}
    title="Repair Details"
  >
    <div className="space-y-4">
      <InfoItem label="Item Type" value={repair.itemType} />
      <InfoItem label="Category" value={repair.category} />
      <div>
        <h3 className="font-medium">Issue Description</h3>
        <p className="text-muted-foreground">{repair.issueDescription}</p>
      </div>
      {repair.photos?.length > 0 && <ImageCarousel images={repair.photos} />}
    </div>
  </SectionCard>
);

const ProposalsSection = ({ repair }) => {
  const isAuction = !!repair.auction;
  const proposals = isAuction ? repair.auction.bids : repair.offers;

  return (
    <SectionCard
      icon={
        isAuction ? (
          <Gavel className="w-5 h-5 text-indigo-600" />
        ) : (
          <Handshake className="w-5 h-5 text-green-600" />
        )
      }
      title={isAuction ? "Bids" : "Offers"}
    >
      <div className="space-y-4">
        {proposals?.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={proposal}
              isAuction={isAuction}
            />
          ))
        ) : (
          <div className="p-4 text-center rounded-lg bg-muted">
            <p className="text-muted-foreground">
              No {isAuction ? "bids" : "offers"} yet
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

const CustomerInfo = ({ customer }) => (
  <SectionCard
    icon={<User className="w-5 h-5 text-indigo-600" />}
    title="Customer Information"
  >
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={customer?.profile?.avatar?.url} />
        <AvatarFallback>
          {customer?.username?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{customer?.username}</div>
        <div className="text-sm text-muted-foreground">{customer?.email}</div>
      </div>
    </div>
  </SectionCard>
);

const Actions = ({
  repair,
  onResetAuction,
  onCloseAuction,
  onDeleteRepair,
  onCancelRepair,
}) => {
  const isAuction = !!repair.auction;
  const isOpenAuction = isAuction && repair.status === "auction_open";
  const canCancel = !["completed", "cancelled"].includes(repair.status);

  return (
    <SectionCard
      icon={<RefreshCw className="w-5 h-5 text-indigo-600" />}
      title="Actions"
    >
      <div className="space-y-4">
        {isOpenAuction && (
          <>
            <Button onClick={onResetAuction} className="w-full">
              Reset Auction
            </Button>
            <Button onClick={onCloseAuction} className="w-full">
              Close Auction
            </Button>
          </>
        )}
        {canCancel && (
          <Button onClick={onCancelRepair} className="w-full">
            Cancel Repair
          </Button>
        )}
        <Button
          onClick={onDeleteRepair}
          variant="destructive"
          className="w-full"
        >
          Delete Repair
        </Button>
      </div>
    </SectionCard>
  );
};

const PageSkeleton = () => (
  <div className="px-4 py-8 mx-auto space-y-8 max-w-7xl">
    <Skeleton className="w-48 h-10" />
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  </div>
);

// Main Component
export default function AdminRepairDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: repair, isLoading, isError } = useRepairDetails(id);
  const resetAuction = useResetAuction();
  const deleteRepair = useDeleteRepair();
  const cancelRepair = useCancelRepair();
  const closeAuction = useCloseAuction();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) return <PageSkeleton />;
  if (isError || !repair) return <NotFoundStatus />;

  const statusConfig =
    STATUS_CONFIG[repair.status] || STATUS_CONFIG.awaiting_assignment;
  const isAuction = !!repair.auction;

  const handleResetAuction = () => resetAuction.mutate(id);
  const handleCloseAuction = () => closeAuction.mutate(id);
  const handleDeleteRepair = () => {
    deleteRepair.mutate(id, {
      onSuccess: () => navigate("/admin/repairs"),
    });
  };
  const handleCancelRepair = () => cancelRepair.mutate(id);

  return (
    <div className="min-h-screen px-4 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <header className="mb-8 space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back to Repairs
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{repair.title}</h1>
          <Badge variant="outline">#{id.slice(-6)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{isAuction ? "Auction" : "Direct Assignment"}</Badge>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Created: {formatDate(repair.createdAt)}
        </p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
          <RepairDetails repair={repair} />
          <ProposalsSection repair={repair} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <CustomerInfo customer={repair.customer} />
          <Actions
            repair={repair}
            onResetAuction={handleResetAuction}
            onCloseAuction={handleCloseAuction}
            onDeleteRepair={() => setShowDeleteConfirm(true)}
            onCancelRepair={() => setShowCancelConfirm(true)}
          />
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this repair? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteRepair();
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancel</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this repair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              No
            </Button>
            <Button
              onClick={() => {
                handleCancelRepair();
                setShowCancelConfirm(false);
              }}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
