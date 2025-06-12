import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Shield,
  User,
  Ban,
  CheckCircle,
  FileText,
  Hammer,
  XCircle,
  AlertCircle,
  History,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdminLogs } from "@/hooks/useAdmin";

const AdminLogsPage = () => {
  const { data: logs, isLoading, refetch, isRefetching } = useAdminLogs();

  const actionIcons = {
    "Update Status": <User className="w-4 h-4" />,
    "Worker Approval": <Hammer className="w-4 h-4" />,
    "Viewed User Details": <Shield className="w-4 h-4" />,
    "Banned User": <Ban className="w-4 h-4" />,
    "Activated User": <CheckCircle className="w-4 h-4" />,
    "Rejected Worker": <XCircle className="w-4 h-4" />,
    "Approved Worker": <CheckCircle className="w-4 h-4" />,
    default: <FileText className="w-4 h-4" />,
  };

  const actionColors = {
    "Update Status":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    "Worker Approval":
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
    "Viewed User Details":
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    "Banned User":
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    "Activated User":
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    "Rejected Worker":
      "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
    "Approved Worker":
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HeaderPages
          title="Admin Activity Logs"
          subtitle="Track all administrative actions and changes"
          icon={
            <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          }
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={isRefetching}
            className="border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:hover:bg-indigo-900/20"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh Logs
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : logs?.length ? (
        <LogsList
          logs={logs}
          actionIcons={actionIcons}
          actionColors={actionColors}
        />
      ) : (
        <NotFoundState />
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
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
  <div className="space-y-4">
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
            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="text-sm">
            <p className="font-medium text-gray-600 dark:text-gray-300">
              Target User
            </p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {log.targetUser}
            </p>
          </div>

          {log.details && (
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
                    <span className="font-medium text-gray-900 dark:text-white">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLogsPage;
