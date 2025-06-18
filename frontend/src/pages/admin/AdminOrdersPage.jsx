import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatDistanceToNow } from "date-fns";
import { useAllOrders, useDeleteOrder } from "@/hooks/useAdmin";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Shipped" },
];

const limitOptions = [
  { value: 9, label: "09 per page" },
  { value: 15, label: "15 per page" },
  { value: 30, label: "30 per page" },
];

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
};

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 9,
  });
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const { data: orders, isLoading } = useAllOrders(filters);
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  console.log("orders", orders);

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
      {/* Header */}
      <HeaderPages
        title="Manage Orders"
        subtitle="View and manage customer orders"
      />

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value, page: 1 })
          }
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
          <SelectTrigger className="w-full md:w-48">
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

      {/* Order Grid */}
      {isLoading ? (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </motion.div>
      ) : orders?.data?.length === 0 ? (
        <NotFoundStatus
          icon={<Package className="w-12 h-12 text-gray-400" />}
          title="No Orders Found"
          message="Try adjusting your filters"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {orders?.data?.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onDelete={() => setDeleteOrderId(order._id)}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handlePrevPage}
            disabled={filters.page === 1}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {filters.page} of {pages} ({total} total)
          </span>
          <Button
            onClick={handleNextPage}
            disabled={filters.page === pages}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteOrderId}
        onOpenChange={() => setDeleteOrderId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrderId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
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
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="group"
    >
      <Card className="overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-gray-700/50 bg-white/80 dark:bg-gray-800/80">
        <CardHeader className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Order #{order._id.slice(-6)}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              {formatDistanceToNow(new Date(order.createdAt))}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Customer: {order.user?.username || "Unknown"}
            </span>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${order.total?.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {order.items?.length || 0} items
            </span>
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const OrderSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4" />
    </CardContent>
  </Card>
);
