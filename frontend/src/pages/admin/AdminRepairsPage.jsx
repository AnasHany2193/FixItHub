import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminRepairs } from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import HeaderPages from "@/components/common/HeaderPages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "awaiting_assignment", label: "Awaiting Assignment" },
  { value: "auction_open", label: "Bidding Active" },
  { value: "in_progress", label: "Repair Ongoing" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const auctionOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "With Auction" },
  { value: "false", label: "Without Auction" },
];

const limitOptions = [
  { value: 9, label: "09 per page" },
  { value: 30, label: "30 per page" },
  { value: 60, label: "60 per page" },
];

const statusStyles = {
  awaiting_assignment:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  auction_open:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  awaiting_payment:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function AdminRepairsPage() {
  const navigate = useNavigate();
  const [auctionFilter, setAuctionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const { data, isLoading } = useAdminRepairs({
    auction: auctionFilter,
    status: statusFilter,
    page,
    limit,
  });

  const repairs = data?.repairs || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.pages) setPage(page + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-6 h-6 text-indigo-600 animate-spin dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <HeaderPages
          title="Repair Requests"
          subtitle="Manage and Review Repair Requests"
        />
        <div className="flex flex-wrap gap-3">
          <Select value={auctionFilter} onValueChange={setAuctionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Auction Filter" />
            </SelectTrigger>
            <SelectContent>
              {auctionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {repairs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No Repairs Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting the filters to view available repair requests.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {repairs.map((repair) => (
                <motion.div
                  key={repair._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/admin/repairs/${repair._id}`)}
                >
                  <Card className="flex flex-col h-full overflow-hidden transition-all border shadow-lg hover:shadow-xl dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/20">
                    <CardHeader className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={statusStyles[repair.status]}>
                            {statusOptions.find(
                              (opt) => opt.value === repair.status
                            )?.label || repair.status}
                          </Badge>
                          {repair.auction && (
                            <Badge
                              variant="indicator"
                              className="before:bg-amber-400 dark:before:bg-amber-300"
                            >
                              Auction
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(repair.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {repair.title}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                          {repair.itemType} • {repair.category}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Customer:
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {repair.customer?.username || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shipping:
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {repair.shippingRequired
                              ? "Required"
                              : "Not Required"}
                          </span>
                        </div>
                        {repair.paymentAmount && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Payment:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              ${repair.paymentAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
              total)
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === pagination.pages}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
