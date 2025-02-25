import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, Gavel, Hammer, Package, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useCancelRepair, useRepairRequests } from "@/hooks/useRepair";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  auction_open: <Gavel className="w-4 h-4" />,
  in_progress: <Hammer className="w-4 h-4" />,
  completed: <Package className="w-4 h-4" />,
  cancelled: <X className="w-4 h-4" />,
  returning_to_customer: <Package className="w-4 h-4" />,
};

const statusConfig = {
  pending: {
    label: "Pending",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  },
  auction_open: {
    label: "Bidding",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
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
  returning_to_customer: {
    label: "Returning",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  },
};

const statusFilters = [
  { value: "all", label: "All" },
  ...Object.keys(statusConfig).map((status) => ({
    value: status,
    label: statusConfig[status].label,
  })),
];

export default function RepairRequestsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState([]);
  const { data, isLoading } = useRepairRequests(
    selectedStatus.includes("all") ? [] : selectedStatus
  );
  const { mutate: cancelRepair, isPending: isCancelling } = useCancelRepair();

  const handleCancel = (repairId) => {
    cancelRepair(repairId);
  };

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            Repair Requests
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Track and manage your ongoing repair services
          </p>
        </div>
        <Button
          className="gap-2 transition-transform hover:-translate-y-0.5"
          onClick={() => navigate("/requests/new")}
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border",
              selectedStatus.includes(filter.value)
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700"
            )}
            onClick={() =>
              setSelectedStatus(filter.value === "all" ? [] : [filter.value])
            }
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 space-y-4 border rounded-xl dark:border-gray-700"
            >
              <Skeleton className="h-[38px] w-3/4 rounded-lg" />
              <Skeleton className="w-1/2 h-4 rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-[34px] w-1/2 rounded-lg" />
                <Skeleton className="h-[34px] w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.data?.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="p-4 mb-4 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No Active Repairs
          </h3>
          <p className="max-w-md mx-auto text-gray-600 dark:text-gray-400">
            Get started by creating a new repair request to connect with our
            skilled technicians.
          </p>
        </motion.div>
      )}

      {/* Repair Cards */}
      {!isLoading && data?.data?.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {data.data.map((repair) => (
              <motion.div
                key={repair.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full overflow-hidden transition-all border shadow-sm hover:shadow-md dark:border-gray-700 group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Badge
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium",
                          statusConfig[repair.status].color
                        )}
                      >
                        {statusIcons[repair.status]}
                        <span className="ml-1.5">
                          {statusConfig[repair.status].label}
                        </span>
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(repair.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {repair.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {repair.itemType}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <StatItem
                        label="Max Price"
                        value={`$${repair.auction?.startingMaxPrice}`}
                      />
                      <StatItem
                        label="Bids"
                        value={repair.bids.length}
                        icon={<Gavel className="w-4 h-4" />}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 p-5 pt-0">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      onClick={() => navigate(`/repairs/${repair.id}`)}
                    >
                      View Details
                    </Button>
                    {(repair.status === "pending" ||
                      repair.status === "auction_open") && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleCancel(repair.id)}
                      >
                        {isCancelling ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

const StatItem = ({ label, value, icon }) => (
  <div className="p-3 space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50">
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);
