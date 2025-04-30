import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Box,
  Wallet,
  Hammer,
  Zap,
  Wrench,
  HelpCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
} from "lucide-react";
import { useWorkerRepairs } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";

export default function WorkerActiveRepairsPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const { data: repairs, isLoading } = useWorkerRepairs(selectedStatus);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <HeaderPages
          title="Active Repair Jobs"
          subtitle=" Manage your current repair assignments and track progress"
        />

        <StatusFilter
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ))}
        </div>
      ) : repairs?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repairs.map((repair) => (
            <RepairCard key={repair._id} repair={repair} />
          ))}
        </div>
      ) : (
        <NotFoundStatus
          icon={<Box />}
          title="No Active Assignments"
          message="You currently don't have any active repair jobs"
        />
      )}
    </>
  );
}

const StatusFilter = ({ selectedStatus, setSelectedStatus }) => {
  const filters = [
    { value: "", label: "All Active", icon: <Zap className="w-4 h-4" /> },
    {
      value: "in_progress",
      label: "In Progress",
      icon: <Hammer className="w-4 h-4" />,
    },
    {
      value: "awaiting_payment",
      label: "Payment Pending",
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex justify-between p-2 rounded-lg md:gap-3 bg-muted dark:bg-gray-800">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedStatus === filter.value ? "default" : "ghost"}
          size="sm"
          className="gap-2"
          onClick={() => setSelectedStatus(filter.value)}
        >
          {filter.icon}
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

const RepairCard = ({ repair }) => {
  const navigate = useNavigate();

  const statusConfig = {
    in_progress: {
      label: "In Progress",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
      icon: <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    awaiting_payment: {
      label: "Payment Pending",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      icon: <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    },
    completed: {
      label: "Completed",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
      icon: (
        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      ),
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
      icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    },
  }[repair.status] || {
    label: "Unknown Status",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-md">
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
              {repair.category}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {repair.customer?.username || "Anonymous Customer"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Contract Value:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${repair.currentPrice?.toFixed(2)}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Started {formatDistanceToNow(repair.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            onClick={() => navigate(`/repairs/active/${repair._id}`)}
            className="w-full border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 :hover:border-indigo-800 dark:hover:bg-indigo-900/20"
          >
            Manage Repair
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <Card className="p-4 space-y-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-800" />
      <Skeleton className="w-32 h-6 bg-gray-100 dark:bg-gray-800" />
    </div>
    <div className="space-y-3">
      <Skeleton className="w-full h-4 bg-gray-100 dark:bg-gray-800" />
      <Skeleton className="w-3/4 h-4 bg-gray-100 dark:bg-gray-800" />
      <Skeleton className="w-2/3 h-4 bg-gray-100 dark:bg-gray-800" />
    </div>
    <Skeleton className="w-full h-10 bg-gray-100 dark:bg-gray-800" />
  </Card>
);
