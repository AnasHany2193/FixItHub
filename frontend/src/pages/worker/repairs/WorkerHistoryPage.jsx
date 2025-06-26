import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Clock,
  Box,
  BadgeCheck,
  Undo2,
  DollarSign,
  User,
  Zap,
} from "lucide-react";
import { useWorkerHistory } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "returning_to_customer", label: "Returned" },
];

export default function WorkerHistoryPage() {
  const [offset, setOffset] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const { data, isLoading } = useWorkerHistory({
    status: selectedStatus,
    limit: 20,
    offset,
  });

  const loadMore = () => setOffset((prev) => prev + 20);

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <HeaderPages
          title="Repair History"
          subtitle="Your completed and returned repair jobs"
        />

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            {statusOptions.find((opt) => opt.value === selectedStatus)?.label ||
              "Filter by status"}
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HistoryCardSkeleton />
            </motion.div>
          ))
        ) : data?.data?.length === 0 ? (
          <NotFoundStatus
            icon={<Box />}
            title="No Repair History Found"
            message="Your completed and returned repairs will appear here"
          />
        ) : (
          data?.data?.map((repair) => (
            <HistoryCard key={repair._id} repair={repair} />
          ))
        )}
      </div>

      {/* Load More Button */}
      {data?.count > offset + 20 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
            className="gap-2 border-gray-300 dark:border-gray-600"
          >
            {isLoading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Load More</span>
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

const HistoryCard = ({ repair }) => {
  const statusConfig = {
    completed: {
      label: "Completed",
      border:
        "border-emerald-200 dark:border-emerald-800 hover:shadow-emerald-700/50",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-400",
      icon: (
        <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      ),
    },
    returning_to_customer: {
      label: "Returned",
      border:
        "border-amber-200 dark:border-amber-800 hover:shadow-amber-700/50",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
      icon: <Undo2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
  }[repair.status];

  console.log("repair", repair);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`border-l-4 ${statusConfig.border} shadow-sm  overflow-hidden transition-all hover:shadow-lg`}
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusConfig.color}`}>
                {statusConfig.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {repair.itemType}
              </h3>
            </div>
            <Badge variant="outline" className="capitalize">
              {repair.sourceType}
            </Badge>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {repair.customer?.username || "Anonymous Customer"}
              </span>
            </div>

            <div className="flex items-start text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                Contract Value:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {repair.price?.toFixed(2)}
                </span>
              </span>
              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {repair.completedAt
                  ? `Completed ${format(new Date(repair.completedAt), "MMM dd, yyyy")}`
                  : `Started ${format(new Date(repair.createdAt), "MMM dd, yyyy")}`}
              </span>
            </div>

            <Badge
              variant={
                repair.paymentStatus === "paid" ? "success" : "destructive"
              }
              className="text-center "
            >
              Payment {repair.paymentStatus?.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HistoryCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-4 space-y-4 border rounded-2xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
  >
    <Skeleton className="h-[60px] rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    <div className="space-y-2">
      <Skeleton className="h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    </div>
  </motion.div>
);
