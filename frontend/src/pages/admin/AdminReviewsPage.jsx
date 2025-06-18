import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllReviews, useDeleteReview } from "@/hooks/useAdmin";

const limitOptions = [
  { value: 9, label: "09 per page" },
  { value: 15, label: "15 per page" },
  { value: 30, label: "30 per page" },
];

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState({
    product: "all",
    category: "all",
    page: 1,
    limit: 9,
  });
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const { data: reviews, isLoading } = useAllReviews(filters);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  // Extract unique products and categories for filters
  const productOptions = [
    {
      value: "all",
      label: "All Products",
    },
    ...Array.from(
      new Set(
        reviews?.data?.map((review) =>
          JSON.stringify({ id: review.product._id, name: review.product.name })
        )
      )
    )
      .map((str) => JSON.parse(str))
      .map((product) => ({
        value: product.id,
        label: product.name,
      })),
  ];

  const categoryOptions = [
    {
      value: "all",
      label: "All Categories",
    },
    ...Array.from(
      new Set(reviews?.data?.map((review) => review.product.category))
    )
      .filter(Boolean)
      .map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
  ];

  const total = reviews?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  const handlePrevPage = () => {
    if (filters.page > 1) setFilters({ ...filters, page: filters.page - 1 });
  };

  const handleNextPage = () => {
    if (filters.page < pages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  const handleDelete = () => {
    deleteReview(deleteReviewId, {
      onSuccess: () => setDeleteReviewId(null),
    });
  };

  return (
    <>
      {/* Header */}
      <HeaderPages
        title="Review Management"
        subtitle="View and manage customer feedback"
      />

      {/* Filter Controls */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <Select
          value={filters.product}
          onValueChange={(value) =>
            setFilters({ ...filters, product: value, page: 1 })
          }
        >
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <SelectValue placeholder="Filter by Product" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {productOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters({ ...filters, category: value, page: 1 })
          }
        >
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <SelectValue placeholder="Filter by Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
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
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">#</span>
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

      {/* Stats Summary */}
      {!isLoading && reviews?.data?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
          <StatCard
            title="Total Reviews"
            value={reviews.total}
            icon={
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            }
            color="from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20"
          />
          <StatCard
            title="Average Rating"
            value={reviews.avgRating?.toFixed(1) || "0.0"}
            icon={
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            }
            color="from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
          />
          <StatCard
            title="Positive Reviews"
            value={`${reviews.positivePercentage || 0}%`}
            icon={
              <span className="text-lg text-green-600 dark:text-green-400">
                👍
              </span>
            }
            color="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
          />
          <StatCard
            title="Critical Reviews"
            value={`${reviews.criticalPercentage || 0}%`}
            icon={
              <span className="text-lg text-red-600 dark:text-red-400">👎</span>
            }
            color="from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
          />
        </div>
      )}

      {/* Review Grid */}
      {isLoading ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </motion.div>
      ) : reviews?.data?.length === 0 ? (
        <NotFoundStatus
          icon={<Star className="w-12 h-12 text-gray-400" />}
          title="No Reviews Found"
          message="Try adjusting your filters"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {reviews?.data?.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onDelete={() => setDeleteReviewId(review._id)}
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
            {Math.min(filters.page * filters.limit, total)} of {total} reviews
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
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <DialogContent className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              Confirm Review Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 my-4 text-center bg-red-50 rounded-xl dark:bg-red-900/20">
            <p className="font-medium text-red-700 dark:text-red-400">
              This review will be permanently removed from the product.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteReviewId(null)}>
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

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br ${color}`}
  >
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-white/30 dark:bg-black/20 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const ReviewCard = ({ review, onDelete }) => {
  const ratingColor =
    review.rating >= 4
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : review.rating >= 3
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full overflow-hidden transition-all shadow-lg hover:shadow-xl dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
        {/* Header */}
        <CardHeader className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold line-clamp-1">
              {review.product.name}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              #{review._id.slice(-6).toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-indigo-200 dark:border-indigo-800">
              <AvatarImage
                src={review.user.profile?.avatar?.url}
                className="object-cover"
              />
              <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
                {review.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 capitalize dark:text-gray-100">
                {review.user.username.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatDistanceToNow(new Date(review.createdAt))} ago
              </p>
            </div>
          </div>

          {/* Rating & Comment */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={`flex items-center gap-1 ${ratingColor}`}>
                <Star className="w-4 h-4" />
                {review.rating}/5
              </Badge>
              <Badge variant="outline" className="capitalize">
                {review.product.category}
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.comment || "No comment provided"}
              </p>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="p-4 pt-0">
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
            Delete Review
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const ReviewSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600" />
    <CardContent className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded-lg" />
          <Skeleton className="w-24 h-3 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="w-20 h-6 rounded-lg" />
        </div>
        <Skeleton className="w-full h-16 rounded-lg" />
      </div>
      <Skeleton className="w-full h-8 rounded-lg" />
    </CardContent>
  </Card>
);
