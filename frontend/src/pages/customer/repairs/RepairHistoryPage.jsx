import { useState } from "react";
import { format } from "date-fns";
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
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import HeaderPages from "@/components/common/HeaderPages";
import NotFoundStatus from "@/components/common/NotFoundStatus";

import { useToast } from "@/hooks/useToast";
import { useCustomerHistory, useSubmitRepairRating } from "@/hooks/useRepair";

const statusConfig = {
  completed: {
    label: "Completed",
    icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    color: "bg-emerald-100 dark:bg-emerald-900/20",
    border:
      "border-emerald-200 dark:border-emerald-800 hover:shadow-emerald-700/50",
  },
  cancelled: {
    label: "Cancelled",
    icon: <X className="w-4 h-4 text-rose-600" />,
    color: "bg-rose-100 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800 hover:shadow-rose-700/50",
  },
  returning_to_customer: {
    label: "Returned",
    icon: <RotateCw className="w-4 h-4 text-amber-600" />,
    color: "bg-amber-100 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800 hover:shadow-amber-700/50",
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [openDialog, setOpenDialog] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(["all"]);

  const { data, isLoading, isError, error } = useCustomerHistory();
  const { mutate, isLoading: isSubmitting } = useSubmitRepairRating();

  const filteredRepairs =
    data?.filter(
      (repair) =>
        selectedStatus.includes("all") || selectedStatus.includes(repair.status)
    ) || [];

  const handleRatingSubmit = (repairId) => {
    if (!rating || rating < 1 || rating > 5) {
      toast({
        title: "Invalid Rating",
        description: "Please select a rating between 1 and 5 stars",
        variant: "destructive",
      });
      return;
    }
    mutate(
      { repairId, rating },
      {
        onSuccess: () => {
          setOpenDialog(null);
          setRating(0);
          setHoverRating(0);
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <HeaderPages
          title="Repair History"
          subtitle="Timeline of your completed and past repair services"
        />
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
          <div className="grid grid-cols-1 gap-5">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 mx-8 space-y-4 border rounded-2xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
              >
                <Skeleton className="h-[60px] rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
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
          <NotFoundStatus
            icon={<Box />}
            title="No Repair History"
            message="Your completed repairs and past service history will appear here"
          />
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
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      duration: 0.2,
                    }}
                    className="group"
                  >
                    <Card
                      className={`border-l-4 ${status.border} shadow-sm overflow-hidden transition-all hover:shadow-lg`}
                    >
                      <CardContent className="p-4 space-y-4 ">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate(`/repairs/${repair._id}`)}
                          >
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
                        <Dialog
                          open={openDialog === repair._id}
                          onOpenChange={(open) => {
                            setOpenDialog(open ? repair._id : null);
                            if (!open) {
                              setRating(0);
                              setHoverRating(0);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              disabled={repair.isRated}
                              className="gap-2 border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Star className="w-4 h-4 text-indigo-600" />
                              {repair.isRated ? "Rated" : "Rate Worker"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="border-indigo-200 sm:max-w-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 rounded-xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                Rate Worker for {repair.title}
                              </DialogTitle>
                            </DialogHeader>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col gap-6 p-4"
                            >
                              <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(rating)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-8 h-8 ${
                                        star <= (hoverRating || rating)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300 dark:text-gray-500"
                                      }`}
                                    />
                                  </motion.button>
                                ))}
                              </div>
                              <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    className="border-indigo-200 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  onClick={() => handleRatingSubmit(repair._id)}
                                  disabled={isSubmitting || !rating}
                                  className="text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Rating"}
                                </Button>
                              </div>
                            </motion.div>
                          </DialogContent>
                        </Dialog>
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
