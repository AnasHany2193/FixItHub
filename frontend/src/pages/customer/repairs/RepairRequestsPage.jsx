import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Clock,
  Gavel,
  Package,
  X,
  Wrench,
  Pencil,
  DollarSign,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { useCancelRepair, useRepairRequests } from "@/hooks/useRepair";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";

export const statusStages = {
  awaiting_assignment: {
    step: 1,
    label: "Awaiting Assignment",
    color: "bg-amber-500",
  },
  auction_open: { step: 2, label: "Bidding Active", color: "bg-indigo-500" },
  in_progress: { step: 3, label: "Repair Ongoing", color: "bg-blue-500" },
  awaiting_payment: {
    step: 3.5,
    label: "Awaiting Payment",
    color: "bg-purple-500",
  },
};

const statusFilters = [
  { value: "all", label: "All", icon: <Package className="w-4 h-4" /> },
  ...Object.entries(statusStages).map(([key, { label }]) => ({
    value: key,
    label,
    icon: {
      awaiting_assignment: <Clock className="w-4 h-4" />,
      auction_open: <Gavel className="w-4 h-4" />,
      in_progress: <Wrench className="w-4 h-4" />,
      awaiting_payment: <DollarSign className="w-4 h-4" />,
    }[key],
  })),
];

export default function RepairRequestsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(["all"]);
  const { data, isLoading } = useRepairRequests(
    selectedStatus.includes("all") ? [] : selectedStatus
  );
  const { mutate: cancelRepair } = useCancelRepair();

  return (
    <>
      {/* Header Section */}
      <Header navigate={navigate} />

      {/* Filter Chips */}
      <FilterChips
        statusFilters={statusFilters}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Content Section */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Empty State */}
        {!isLoading && data?.length === 0 && (
          <NotFoundStatus
            icon={<Package />}
            title="No Active Services"
            message="Start by creating a new repair request to connect with our certified technicians."
          />
        )}

        {/* Repair Grid */}
        {!isLoading && data?.length > 0 && (
          <RepairGrid data={data} cancelRepair={cancelRepair} />
        )}
      </div>
    </>
  );
}

const Header = ({ navigate }) => (
  <div className="flex flex-col gap-4 mb-8 md:mb-1 md:flex-row md:items-center md:justify-between">
    <HeaderPages
      title="Repair Hub"
      subtitle="Manage your active repair services"
    />

    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        className="gap-2 shadow-lg bg-gradient-to-r dark:text-gray-200 from-indigo-600 to-purple-600 hover:shadow-indigo-500/30"
        onClick={() => navigate("/repairs/new")}
      >
        <PlusCircle className="w-5 h-5" />
        <span className="text-sm">New Request</span>
      </Button>
    </motion.div>
  </div>
);

const FilterChips = ({ statusFilters, selectedStatus, setSelectedStatus }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {statusFilters.map((filter) => (
      <motion.button
        key={filter.value}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
          selectedStatus.includes(filter.value)
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
        }`}
        onClick={() =>
          setSelectedStatus(filter.value === "all" ? ["all"] : [filter.value])
        }
      >
        {filter.icon}
        {filter.label}
      </motion.button>
    ))}
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 space-y-4 border rounded-2xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
      >
        <Skeleton className="h-[120px] rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
          <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
        </div>
      </motion.div>
    ))}
  </div>
);

const RepairGrid = ({ data, cancelRepair }) => (
  <motion.div
    layout
    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <AnimatePresence>
      {data.map((repair) => (
        <RepairCard
          key={repair._id}
          repair={repair}
          cancelRepair={cancelRepair}
        />
      ))}
    </AnimatePresence>
  </motion.div>
);

const RepairCard = ({ repair, cancelRepair }) => {
  const navigate = useNavigate();
  const currentStatus = statusStages[repair.status];
  const isAuction = repair.status === "auction_open";

  const auctionDetails = repair.auction || {};
  const offerCount = repair.offers?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="cursor-pointer group"
    >
      <Card className="flex flex-col justify-between h-full overflow-hidden transition-all border shadow-lg hover:shadow-lg dark:border-gray-700 group backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50">
        {/* Status Header */}
        <div className="relative p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="premium" className="gap-1.5">
                {currentStatus.label}
              </Badge>
              {isAuction && (
                <Badge
                  variant="indicator"
                  className="before:bg-amber-400 dark:before:bg-amber-300"
                >
                  Auction
                </Badge>
              )}
            </div>
            <span className="text-sm">
              {formatDistanceToNow(new Date(repair.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <Progress
            value={(currentStatus.step / 4) * 100}
            className="mt-3 h-1.5 bg-white/20 dark:bg-gray-700"
          />
        </div>

        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="w-2/3 text-lg font-semibold">{repair.title}</h3>
              {!isAuction && <Badge variant="success">Direct Offers</Badge>}
            </div>
            <p className="text-sm capitalize text-muted-foreground">
              {repair.itemType} • {repair.category}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isAuction ? (
              <>
                <StatItem
                  label="Current Bid"
                  value={
                    auctionDetails.currentLowestBid?.bidPrice
                      ? `$${auctionDetails.currentLowestBid.bidPrice}`
                      : `No bids (${auctionDetails.bids?.length || 0})`
                  }
                  icon={
                    <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  }
                />
                <StatItem
                  label="Time Left"
                  value={
                    auctionDetails.expiresAt
                      ? formatDistanceToNow(
                          new Date(auctionDetails.expiresAt),
                          {
                            addSuffix: true,
                          }
                        )
                      : "N/A"
                  }
                  icon={
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  }
                />
              </>
            ) : (
              <>
                <StatItem
                  label="Offers Received"
                  value={offerCount}
                  icon={
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  }
                />
                <StatItem
                  label="Avg. Offer"
                  value={
                    repair.offers?.length > 0
                      ? `$${Math.round(
                          repair.offers.reduce(
                            (sum, o) => sum + o.offerPrice,
                            0
                          ) / repair.offers.length
                        )}`
                      : "No offers"
                  }
                  icon={
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  }
                />
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 p-4 pt-0">
          <div className="flex flex-1 gap-2">
            <Button
              variant="outline"
              className="flex-1 hover:bg-indigo-50 dark:hover:bg-gray-700"
              onClick={() => navigate(`/repairs/${repair._id}`)}
            >
              {isAuction ? "View Bids" : "View Offers"}
            </Button>

            {["awaiting_assignment", "auction_open"].includes(
              repair.status
            ) && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  onClick={() => navigate(`/repairs/${repair._id}/edit`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {repair.status === "auction_open" && (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                onClick={() => cancelRepair(repair._id)}
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const StatItem = ({ icon, label, value }) => (
  <div className="flex p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-300">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);
