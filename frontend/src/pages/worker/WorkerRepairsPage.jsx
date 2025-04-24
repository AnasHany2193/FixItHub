import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Box, Wallet, Hammer, Zap } from "lucide-react";
import { useWorkerRepairs } from "@/hooks/useRepair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function WorkerRepairsPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const { data: repairs, isLoading } = useWorkerRepairs(selectedStatus);

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <Header />
        <StatusFilter
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="wait">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingSkeleton />
              </motion.div>
            ))
          ) : repairs?.length > 0 ? (
            repairs.map((repair) => (
              <RepairCard key={repair._id} repair={repair} />
            ))
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Header = () => (
  <div className="mb-8 space-y-2">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      Active Repair Jobs
    </h1>
    <p className="text-gray-600 dark:text-gray-400">
      Manage your current repair assignments and track progress
    </p>
  </div>
);

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
      label: "Awaiting Payment",
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex gap-2 p-2 mb-6 rounded-lg bg-muted dark:bg-gray-800">
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

// const RepairCard = ({ repair }) => {
//   const statusConfig = {
//     in_progress: {
//       label: "In Progress",
//       color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
//     },
//     awaiting_payment: {
//       label: "Awaiting Payment",
//       color:
//         "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
//     },
//   }[repair.status];

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ duration: 0.2 }}
//     >
//       <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
//         <CardContent className="p-4 space-y-4">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
//                 {repair.itemType}
//               </h3>
//               <p className="text-sm text-gray-500 capitalize dark:text-gray-400">
//                 {repair.customer?.username || "Customer"}
//               </p>
//             </div>
//             <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex items-center gap-2">
//               <Hammer className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
//                 <p className="font-medium dark:text-gray-200">
//                   {repair.sourceType === "auction"
//                     ? "Auction Bid"
//                     : "Direct Assignment"}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Value
//                 </p>
//                 <p className="font-medium dark:text-gray-200">
//                   ${repair.currentPrice}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
//             <Clock className="w-4 h-4" />
//             <span>
//               Started {new Date(repair.createdAt).toLocaleDateString()}
//             </span>
//           </div>
//         </CardContent>

//         <CardFooter className="p-4 pt-0">
//           <Button
//             variant="outline"
//             className="w-full border-gray-300 dark:border-gray-600"
//           >
//             View Job Details
//           </Button>
//         </CardFooter>
//       </Card>
//     </motion.div>
//   );
// };

const RepairCard = ({ repair }) => {
  const statusConfig = {
    in_progress: {
      label: "In Progress",
      color:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    awaiting_payment: {
      label: "Awaiting Payment",
      color:
        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    completed: {
      label: "Completed",
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  }[repair.status] || {
    label: "Unknown Status",
    color: "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    iconColor: "text-gray-600 dark:text-gray-300",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden transition-colors border border-gray-200 dark:border-gray-700 group hover:border-indigo-200 dark:hover:border-indigo-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {repair.itemType}
            </h3>
            <p className="text-sm text-gray-600 capitalize dark:text-gray-300">
              {repair.customer?.username || "Customer"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Hammer className={`w-5 h-5 ${statusConfig.iconColor}`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {repair.sourceType === "auction"
                    ? "Auction Bid"
                    : "Direct Assignment"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wallet className={`w-5 h-5 ${statusConfig.iconColor}`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Value
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  ${repair.currentPrice}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                Started {new Date(repair.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Badge
              className={`text-sm text-center ${statusConfig.color} hover:${statusConfig.color} dark:hover:${statusConfig.color}`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
          >
            View Job Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <Card className="p-4 space-y-4 border border-gray-200 dark:border-gray-700">
    <Skeleton className="w-3/4 h-6 bg-gray-100 dark:bg-gray-800" />
    <Skeleton className="w-1/2 h-4 bg-gray-100 dark:bg-gray-800" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-16 bg-gray-100 dark:bg-gray-800" />
      <Skeleton className="h-16 bg-gray-100 dark:bg-gray-800" />
    </div>
    <Skeleton className="w-full h-10 bg-gray-100 dark:bg-gray-800" />
  </Card>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center col-span-3 py-12 text-center"
  >
    <Box className="w-12 h-12 mb-4 text-gray-400" />
    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
      No Active Jobs
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      You currently don&apos;t have any active repair assignments
    </p>
  </motion.div>
);
