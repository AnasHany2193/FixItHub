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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { useCancelRepair, useRepairRequests } from "@/hooks/useRepair";

export const statusStages = {
  awaiting_assignment: {
    step: 1,
    label: "Awaiting Assignment",
    color: "bg-amber-500",
  },
  auction_open: { step: 2, label: "Bidding Active", color: "bg-indigo-500" },
  in_progress: { step: 3, label: "Repair Ongoing", color: "bg-blue-500" },
  completed: { step: 4, label: "Completed", color: "bg-emerald-500" },
  cancelled: { step: 0, label: "Cancelled", color: "bg-rose-500" },
};

const statusFilters = [
  { value: "all", label: "All", icon: <Package className="w-4 h-4" /> },
  ...Object.entries(statusStages).map(([key, { label }]) => ({
    value: key,
    label,
    icon: {
      pending: <Clock className="w-4 h-4" />,
      auction_open: <Gavel className="w-4 h-4" />,
      in_progress: <Wrench className="w-4 h-4" />,
      completed: <Package className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />,
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
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl">
            Repair Hub
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-300">
            Manage your active repair services
          </p>
        </motion.div>

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

      {/* Filter Chips */}
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
              setSelectedStatus(
                filter.value === "all" ? ["all"] : [filter.value]
              )
            }
          >
            {filter.icon}
            {filter.label}
          </motion.button>
        ))}
      </div>

      {/* Content Section */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
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
        )}

        {/* Empty State */}
        {!isLoading && data?.data?.length === 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
              <Package className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No Active Services
            </h3>
            <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
              Start by creating a new repair request to connect with our
              certified technicians.
            </p>
          </motion.div>
        )}

        {/* Repair Grid */}
        {!isLoading && data?.data?.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {data.data.map((repair) => {
                const currentStatus =
                  statusStages[repair.status] ||
                  statusStages["awaiting_assignment"];

                return (
                  <motion.div
                    key={repair.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="flex flex-col justify-between h-full overflow-hidden transition-all border shadow-lg hover:shadow-xl dark:border-gray-700 group backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
                      {/* Status Header */}
                      <div className="relative p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                          <Badge variant="premium" className="gap-1.5">
                            {currentStatus.label}
                          </Badge>
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(repair.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        <Progress
                          value={(currentStatus.step / 4) * 100}
                          className="mt-3 h-1.5 bg-white/20 dark:bg-gray-700"
                          // indicatorClassName={currentStatus.color}
                        />
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {repair.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {repair.itemType}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <StatItem
                            label="Current Bid"
                            value={
                              repair.bids.length > 0
                                ? `$${Math.min(...repair.bids.map((b) => b.bidPrice))}`
                                : "No bids"
                            }
                            icon={
                              <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            }
                          />
                          <StatItem
                            label="Time Left"
                            value={
                              repair.auction?.expiresAt
                                ? formatDistanceToNow(
                                    new Date(repair.auction.expiresAt),
                                    { addSuffix: true }
                                  )
                                : "N/A"
                            }
                            icon={
                              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            }
                          />
                        </div>
                      </CardContent>

                      <CardFooter className="flex gap-2 p-4 pt-0">
                        <div className="flex flex-1 gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 hover:bg-indigo-50 dark:hover:bg-gray-700"
                            onClick={() => navigate(`/repairs/${repair.id}`)}
                          >
                            Service Details
                          </Button>

                          {/* Add Edit Button */}
                          {(repair.status === "awaiting_assignment" ||
                            repair.status === "auction_open" ||
                            repair.status === "cancelled") && (
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                onClick={() =>
                                  navigate(`/repairs/${repair.id}/edit`)
                                }
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
                              onClick={() => cancelRepair(repair.id)}
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const StatItem = ({ label, value, icon, className }) => (
  <div
    className={`flex items-center gap-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-gray-700/50 ${className}`}
  >
    <div className="p-1.5 rounded-md bg-white dark:bg-gray-800">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);
