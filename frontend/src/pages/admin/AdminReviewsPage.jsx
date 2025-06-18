import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
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
      {/* Header */}
      <div className="grid items-center grid-cols-1 gap-4 mb-8 md:grid-cols-4">
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
      {isLoading ? (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </motion.div>
      ) : reviews.length === 0 ? (
        <NotFoundStatus
          icon={<Star className="w-12 h-12 text-gray-400" />}
          title="No Reviews Found"
          message="No reviews available at the moment."
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={() => setDeleteReviewId(review._id)}
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
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
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
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const ReviewCard = ({ review, onDelete }) => {
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
              Review #{review._id.slice(-6)}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              {formatDistanceToNow(new Date(review.createdAt))}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({review.rating}/5)
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {review.comment}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              User: {review.user?.username || "Unknown"}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Product: {review.product?.name || "Unknown"}
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

const ReviewSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4" />
    </CardContent>
  </Card>
);
