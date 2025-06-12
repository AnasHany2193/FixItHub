import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  FileText,
  Hammer,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  X,
  Gavel,
} from "lucide-react";
import { format } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdminLogs } from "@/hooks/useAdmin";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const actionTypes = [
  "Update Status",
  "Worker Approval",
  "Reset Auction",
  "Deleted Repair",
  "Cancelled Repair",
  "Closed Auction",
];

const AdminLogsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    action: "",
    startDate: null,
    endDate: null,
  });

  const { data, isLoading } = useAdminLogs(filters);

  const actionIcons = {
    "Update Status": <User className="w-4 h-4" />,
    "Worker Approval": <Hammer className="w-4 h-4" />,
    "Reset Auction": <Clock className="w-4 h-4" />,
    "Deleted Repair": <X className="w-4 h-4" />,
    "Cancelled Repair": <XCircle className="w-4 h-4" />,
    "Closed Auction": <Gavel className="w-4 h-4" />,
    default: <FileText className="w-4 h-4" />,
  };

  const actionColors = {
    "Update Status":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    "Worker Approval":
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
    "Reset Auction":
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    "Deleted Repair":
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    "Cancelled Repair":
      "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
    "Closed Auction":
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <HeaderPages
          title="Admin Activity Logs"
          subtitle="Track all administrative actions and changes"
        />

        <div className="flex items-center w-1/3 gap-3">
          <Select onValueChange={(v) => handleFilterChange("action", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log Count */}
      {!isLoading && data?.data?.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total} logs
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingState limit={filters.limit} />
      ) : data?.data?.length ? (
        <>
          <LogsList
            logs={data.data}
            actionIcons={actionIcons}
            actionColors={actionColors}
          />
          <Pagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <NotFoundState />
      )}
    </div>
  );
};

const LoadingState = ({ limit }) => (
  <div className="grid grid-cols-1 gap-4">
    {Array.from({ length: limit }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <Card className="p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-800" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 bg-gray-100 dark:bg-gray-800" />
              <Skeleton className="w-48 h-3 bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="w-full h-3 bg-gray-100 dark:bg-gray-800" />
            <Skeleton className="w-4/5 h-3 bg-gray-100 dark:bg-gray-800" />
          </div>
          <Skeleton className="w-32 h-4 mt-3 bg-gray-100 dark:bg-gray-800" />
        </Card>
      </motion.div>
    ))}
  </div>
);

const NotFoundState = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
    <AlertCircle className="w-16 h-16 mx-auto text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      No Activity Logs Found
    </h3>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Administrative actions will appear here once performed.
    </p>
  </div>
);

const LogsList = ({ logs, actionIcons, actionColors }) => (
  <div className="gap-5 space-y-4">
    <AnimatePresence>
      {logs.map((log, index) => (
        <LogCard
          key={`${log._id}-${index}`}
          log={log}
          actionIcons={actionIcons}
          actionColors={actionColors}
        />
      ))}
    </AnimatePresence>
  </div>
);

const LogCard = ({ log, actionIcons, actionColors }) => {
  const icon = actionIcons[log.action] || actionIcons.default;
  const colorClass = actionColors[log.action] || actionColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-md">
        <div
          className={`flex items-center justify-between px-4 py-3 ${colorClass}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 dark:bg-black/20">
              {icon}
            </div>
            <h3 className="font-medium">{log.action}</h3>
          </div>
          <Badge variant="secondary" className="capitalize">
            {format(new Date(log.timestamp), "MMM dd, yyyy")}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="text-sm">
              <p className="font-medium text-gray-600 dark:text-gray-300">
                Admin User
              </p>
              <p className="font-medium text-gray-900 capitalize dark:text-white">
                {log.adminUser?.username.replace(/_/g, " ") || "System"}
              </p>
            </div>

            <div className="text-sm">
              <p className="font-medium text-gray-600 dark:text-gray-300">
                Target User
              </p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {log.targetUser || "N/A"}
              </p>
            </div>
          </div>

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="text-sm">
              <p className="font-medium text-gray-600 dark:text-gray-300">
                Details
              </p>
              <div className="p-3 mt-1 text-sm rounded-lg bg-gray-50 dark:bg-gray-800">
                {Object.entries(log.details).map(([key, value]) => (
                  <div key={key} className="flex py-1">
                    <span className="w-32 font-medium text-gray-700 capitalize dark:text-gray-300">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="font-medium text-gray-900 capitalize dark:text-white">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 mt-2 text-xs border-t border-gray-200 dark:border-gray-700 text-muted-foreground">
            {format(new Date(log.timestamp), "hh:mm:ss a")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Pagination = ({ pagination, onPageChange }) => {
  const { page, pages } = pagination;

  return (
    <div className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </div>

      <Button
        variant="outline"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default AdminLogsPage;
