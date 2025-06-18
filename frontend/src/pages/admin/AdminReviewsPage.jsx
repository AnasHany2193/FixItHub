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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllReviews, useDeleteReview } from "@/hooks/useAdmin";

export default function AdminReviewsPage() {
  const [productFilter, setProductFilter] = useState("all");
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const { data: reviews, isLoading } = useAllReviews();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  // Extract unique products for filter
  const productOptions = [
    { value: "all", label: "All Products" },
    ...Array.from(
      new Set(
        reviews.data?.map((review) =>
          JSON.stringify({ id: review.product._id, name: review.product.name })
        )
      )
    )
      .map((str) => JSON.parse(str))
      .map((product) => ({ value: product.id, label: product.name })),
  ];

  // Filter reviews by product
  const filteredReviews =
    productFilter === "all"
      ? reviews.data
      : reviews.data?.filter((review) => review.product._id === productFilter);

  const handleDelete = () => {
    deleteReview(deleteReviewId, {
      onSuccess: () => setDeleteReviewId(null),
    });
  };

  return (
    <>
      {/* Header */}

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <HeaderPages
          title="Manage Reviews"
          subtitle="View and manage customer reviews"
        />

        <Select
          value={productFilter}
          onValueChange={(value) => setProductFilter(value)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by Product" />
          </SelectTrigger>
          <SelectContent>
            {productOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
      ) : filteredReviews?.length === 0 ? (
        <NotFoundStatus
          icon={<Star className="w-12 h-12 text-gray-400" />}
          title="No Reviews Found"
          message="Try adjusting your product filter"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredReviews?.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={() => setDeleteReviewId(review._id)}
            />
          ))}
        </motion.div>
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
            <h3 className="text-lg font-semibold line-clamp-1">
              {review.product.name}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              #{review._id.slice(-6)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-4">
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
              <div className="font-medium text-gray-900 capitalize dark:text-gray-100">
                {review.user.username.replace(/_/g, " ")}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                />
              ))}
            </div>
            <Badge variant="outline">{review.rating}/5</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {review.comment}
          </p>
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
      <Skeleton className="w-full h-4" />
    </CardContent>
  </Card>
);
