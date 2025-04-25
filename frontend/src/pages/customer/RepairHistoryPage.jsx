// frontend/src/pages/repairs/RepairHistoryPage.jsx
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  X,
  RotateCw,
  Box,
  HistoryIcon,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCustomerHistory } from "@/hooks/useRepair";
import { useState } from "react";

const statusConfig = {
  completed: {
    label: "Completed",
    icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    color: "bg-emerald-100 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: <X className="w-4 h-4 text-rose-600" />,
    color: "bg-rose-100 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
  },
  returning_to_customer: {
    label: "Returned",
    icon: <RotateCw className="w-4 h-4 text-amber-600" />,
    color: "bg-amber-100 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
};

const statusFilters = [
  {
    value: "all",
    label: "All",
    icon: <HistoryIcon className="w-4 h-4" />,
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: <X className="w-4 h-4 text-rose-600" />,
  },
  {
    value: "returning_to_customer",
    label: "Returned",
    icon: <RotateCw className="w-4 h-4 text-amber-600" />,
  },
];

export default function RepairHistoryPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(["all"]);
  const { data, isLoading, isError, error } = useCustomerHistory();

  const filteredRepairs =
    data?.filter(
      (repair) =>
        selectedStatus.includes("all") || selectedStatus.includes(repair.status)
    ) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text md:text-3xl">
            Repair History
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-300">
            Timeline of your completed and past repair services
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="gap-2 border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800"
            onClick={() => navigate("/repairs/all")}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-sm">Back to Active Repairs</span>
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
            onClick={() => {
              if (filter.value === "all") {
                setSelectedStatus(["all"]);
              } else {
                setSelectedStatus((prev) =>
                  prev.includes(filter.value) ? ["all"] : [filter.value]
                );
              }
            }}
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

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-b from-red-50 to-red-100 dark:from-red-800 dark:to-red-900"
          >
            <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-red-100 to-red-200 dark:from-red-700 dark:to-red-800">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Error Loading History
            </h3>
            <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
              {error.message || "Failed to load repair history"}
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredRepairs.length === 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
              <Box className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No Repair History
            </h3>
            <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
              Your completed repairs and past service history will appear here
            </p>
          </motion.div>
        )}

        {/* History Timeline */}
        {!isLoading && !isError && filteredRepairs.length > 0 && (
          <motion.div
            layout
            className="space-y-6 md:space-y-8 lg:max-w-4xl lg:mx-auto"
          >
            <AnimatePresence>
              {filteredRepairs.map((repair) => {
                const status =
                  statusConfig[repair.status] || statusConfig.completed;

                return (
                  <motion.div
                    key={repair._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className={`border-l-4 ${status.border} shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${status.color}`}>
                              {status.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {repair.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {repair.itemType}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {format(new Date(repair.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          onClick={() => navigate(`/repairs/${repair._id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
