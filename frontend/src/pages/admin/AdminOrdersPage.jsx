import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  List,
  BarChart2,
  User,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";
import { formatDistanceToNow, format } from "date-fns";
import { useAllOrders, useDeleteOrder } from "@/hooks/useAdmin";

const statusOptions = [
  { value: "all", label: "All Orders", icon: <List className="w-4 h-4" /> },
  {
    value: "processing",
    label: "Processing",
    icon: <Clock className="w-4 h-4 text-blue-500" />,
  },
  {
    value: "completed",
    label: "Shipped",
    icon: <Truck className="w-4 h-4 text-green-500" />,
  },
];

const limitOptions = [
  { value: 6, label: "06 per page" },
  { value: 15, label: "15 per page" },
  { value: 30, label: "30 per page" },
];

const STATUS_CONFIG = {
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: <Clock className="w-4 h-4" />,
  },
  completed: {
    label: "Shipped",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 6,
    search: "",
  });
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const { data: orders, isLoading } = useAllOrders(filters);
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  const total = orders?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  const handlePrevPage = () => {
    if (filters.page > 1) setFilters({ ...filters, page: filters.page - 1 });
  };

  const handleNextPage = () => {
    if (filters.page < pages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  const handleDelete = () => {
    deleteOrder(deleteOrderId, {
      onSuccess: () => setDeleteOrderId(null),
    });
  };

  return (
    <>
      {/* Filter Controls */}
      <div className="grid items-center grid-cols-1 gap-4 mb-8 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <HeaderPages
            title="Order Management"
            subtitle="Track and manage customer orders"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value, page: 1 })
          }
        >
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.limit.toString()}
          onValueChange={(value) =>
            setFilters({ ...filters, limit: Number(value), page: 1 })
          }
        >
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <SelectValue placeholder="Items per page" />
            </div>
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

      {/* Order Grid */}
      {isLoading ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </motion.div>
      ) : orders?.data?.length === 0 ? (
        <NotFoundStatus
          icon={<Package className="w-12 h-12 text-gray-400" />}
          title="No Orders Found"
          message="Try adjusting your search or filters"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {orders?.data?.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onDelete={() => setDeleteOrderId(order._id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(filters.page - 1) * filters.limit + 1} -{" "}
            {Math.min(filters.page * filters.limit, total)} of {total} orders
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={filters.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum;
                if (pages <= 5) {
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  pageNum = i + 1;
                } else if (filters.page >= pages - 2) {
                  pageNum = pages - 4 + i;
                } else {
                  pageNum = filters.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={filters.page === pageNum ? "default" : "ghost"}
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {pages > 5 && filters.page < pages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={filters.page === pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteOrderId}
        onOpenChange={() => setDeleteOrderId(null)}
      >
        <DialogContent className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              Confirm Order Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 my-4 text-center bg-red-50 rounded-xl dark:bg-red-900/20">
            <p className="font-medium text-red-700 dark:text-red-400">
              All order data and history will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrderId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const OrderCard = ({ order, onDelete }) => {
  const statusConfig = STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    icon: <Package className="w-4 h-4" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="flex flex-col justify-between h-full overflow-hidden transition-all shadow-lg hover:shadow-xl dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
        {/* Header */}
        <CardHeader className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Order #{order._id.slice(-6).toUpperCase()}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full dark:bg-indigo-900/30">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {order.user?.username || "Unknown Customer"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {order.user?.email || "No email"}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </span>
              <Badge
                className={`flex items-center gap-1 ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Items
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {order.items?.length || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total
              </span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${order.total?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Products Preview */}
          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Products
            </h4>
            <div className="flex flex-wrap gap-2">
              {order.items?.slice(0, 3).map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {item.product?.name || `Item ${i + 1}`}
                </Badge>
              ))}
              {order.items?.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{order.items.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0">
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2 group-hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Order
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const OrderSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600" />
    <CardContent className="p-4 space-y-4">
      <Skeleton className="w-3/4 h-4 rounded-lg" />
      <Skeleton className="w-full h-16 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4 rounded-lg" />
        <Skeleton className="w-2/3 h-4 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);
