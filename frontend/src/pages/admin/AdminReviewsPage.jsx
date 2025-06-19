import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAllReviews, useDeleteReview } from "@/hooks/useAdmin";

const limitOptions = [
  { value: 9, label: "09 per page" },
  { value: 15, label: "15 per page" },
  { value: 30, label: "30 per page" },
];

const sortOptions = [
  { value: "desc", label: "Rating: High to Low" },
  { value: "asc", label: "Rating: Low to High" },
];

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    sortByRating: "desc",
    search: "",
  });
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const { data: reviewsResponse, isLoading } = useAllReviews(filters);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const reviews = reviewsResponse?.data || [];
  const total = reviewsResponse?.total || 0;
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
      <div className="grid items-center grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <HeaderPages
            title="Manage Reviews"
            subtitle="View and manage customer reviews"
          />
        </div>

        <Select
          value={filters.sortByRating}
          onValueChange={(value) =>
            setFilters({ ...filters, sortByRating: value, page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by Rating" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
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
          <SelectTrigger>
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

      {/* Review Grid */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <NotFoundStatus
            icon={<Star className="w-12 h-12 text-gray-400" />}
            title="No Reviews Found"
            message="No reviews available at the moment."
          />
        )}

        {/* Reviews Grid */}
        {!isLoading && reviews.length > 0 && (
          <ReviewsGrid reviews={reviews} onDelete={setDeleteReviewId} />
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(filters.page - 1) * filters.limit + 1} to{" "}
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
              {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                const pageNum =
                  pages <= 5
                    ? i + 1
                    : filters.page <= 3
                      ? i + 1
                      : filters.page >= pages - 2
                        ? pages - 4 + i
                        : filters.page - 2 + i;

                return (
                  <Button
                    key={i}
                    variant={filters.page === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    disabled={pageNum > pages}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {pages > 5 && filters.page < pages - 2 && (
                <span className="px-2">...</span>
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
        <DialogContent className="bg-white dark:bg-gray-800 rounded-xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              Confirm Review Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone and will remove the review permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteReviewId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== COMPONENTS =====
const LoadingState = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <ReviewSkeleton key={i} />
    ))}
  </div>
);

const ReviewsGrid = ({ reviews, onDelete }) => (
  <motion.div
    layout
    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
  >
    <AnimatePresence>
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} onDelete={onDelete} />
      ))}
    </AnimatePresence>
  </motion.div>
);

const ReviewCard = ({ review, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="group"
    >
      <Card className="h-full overflow-hidden transition-shadow border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-lg">
        {/* Rating Header */}
        <div className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <h3 className="text-lg font-semibold">
                Review #{review._id.slice(-6).toUpperCase()}
              </h3>
            </div>
            <Badge variant="secondary" className="text-white bg-white/20">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Rating Stars */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {review.rating}/5
            </span>
          </div>

          {/* Comment */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
          </div>

          {/* User & Product Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {review.user?.username || "Unknown"}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product
              </p>
              <p className="font-medium text-gray-900 truncate dark:text-white">
                {review.product?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="destructive"
              size="sm"
              className="gap-2 group-hover:bg-red-600 dark:group-hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(review._id);
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

const ReviewSkeleton = () => (
  <Card className="overflow-hidden border dark:border-gray-700">
    <Skeleton className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600" />
    <CardContent className="p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
        <Skeleton className="w-1/2 h-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      </div>
      <Skeleton className="w-full h-16 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="w-full h-10 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
        <Skeleton className="w-full h-10 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
      </div>
      <Skeleton className="w-20 h-8 ml-auto rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
    </CardContent>
  </Card>
);
