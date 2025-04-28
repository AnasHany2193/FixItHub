import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  Package,
  BarChart,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  useProductDetails,
  useAddToFavorites,
  useRemoveFromFavorites,
  useFavorites,
  useAddProductReview,
  useUpdateProductReview,
  useDeleteProductReview,
  useProductReviews,
} from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Rating } from "@/components/common/Rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CustomerMarketplaceDetailsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId } = useParams();

  // Data fetching
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const { data: product, isLoading, refetch } = useProductDetails(productId);
  const {
    data: reviews,
    refetch: refetchReviews,
    isRefetching: refetchingReviews,
    isLoading: loadingReviews,
  } = useProductReviews(productId);

  // Review mutations
  const addReview = useAddProductReview();
  const updateReview = useUpdateProductReview();
  const deleteReview = useDeleteProductReview();

  // Favorite mutations
  const addFavorite = useAddToFavorites();
  const removeFavorite = useRemoveFromFavorites();

  const isFavorite = favorites?.some((fav) => fav._id === productId);
  const userReview = reviews?.find((review) => review.user._id === user._id);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync(productId);
      } else {
        await addFavorite.mutateAsync(productId);
      }
      refetch();
    } catch (error) {
      toast({ variant: "error", title: "Error", description: error.message });
    }
  };

  if (isLoading) return <ProductDetailsSkeleton />;
  if (!product)
    return (
      <NotFoundStatus
        title="Product Not Found"
        icon={<Package className="w-12 h-12" />}
        message="Try adjusting your filters or search terms"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          ← Back to Marketplace
        </Button>

        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {product.images?.length ? (
              <ImageCarousel images={product.images} />
            ) : (
              <div className="flex items-center justify-center aspect-video bg-muted">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">
                  ${product.price}
                </span>
                <Badge
                  variant={
                    product.stock > 10
                      ? "success"
                      : product.stock > 0
                        ? "warning"
                        : "destructive"
                  }
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart className="w-4 h-4" />
                  <span>{product.purchasesCount || 0} purchases</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{product.favoritesCount || 0} favorites</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>
                    {product.avgRating.toFixed(1)} ({product.reviewsCount}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-indigo-100 dark:border-gray-600">
                  <AvatarImage
                    src={product.seller.profile.avatar.url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-indigo-600 capitalize bg-indigo-100 dark:bg-gray-700 dark:text-indigo-300">
                    {product.seller.username?.[0] || (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium capitalize">
                    Sold by {product.seller.username.replace(/_/g, " ")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDistanceToNow(product.seller.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Specs & Description */}
            <div className="p-4 rounded-lg bg-muted">
              <h2 className="mb-2 text-lg font-semibold">Specifications</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {product.specs?.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-medium">{spec.name}:</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 gap-2"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button
                variant={isFavorite ? "destructive" : "outline"}
                size="lg"
                onClick={handleFavoriteToggle}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {loadingReviews ? (
          <ProductReviewsSkeleton />
        ) : (
          <ProductReviews
            productId={productId}
            user={user}
            reviews={reviews}
            userReview={userReview}
            loadingReviews={loadingReviews || refetchingReviews}
            refetchReviews={refetchReviews}
            addReview={addReview}
            updateReview={updateReview}
            deleteReview={deleteReview}
          />
        )}
      </div>
    </motion.div>
  );
}

const ProductDetailsSkeleton = () => (
  <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
    <Skeleton className="w-24 h-8 mb-4" />
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="aspect-video" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/4 h-6" />
          <div className="flex gap-4">
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
          </div>
        </div>
        <Skeleton className="h-32" />
        <div className="flex gap-4">
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-10 h-10" />
        </div>
      </div>
    </div>
    <Skeleton className="h-32 mt-12" />
  </div>
);

const ProductReviews = ({
  productId,
  user,
  reviews,
  userReview,
  loadingReviews,
  refetchReviews,
  addReview,
  updateReview,
  deleteReview,
}) => {
  const [showReviews, setShowReviews] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchReviews()}
            disabled={loadingReviews}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loadingReviews ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Reviews
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show Reviews
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Review Form Section */}
            <div className="mb-8 space-y-6">
              {!userReview ? (
                <div className="p-6 rounded-lg bg-muted/50">
                  <h3 className="mb-4 text-lg font-medium">Write a Review</h3>
                  <ReviewForm
                    onSubmit={async ({ rating, comment }) => {
                      try {
                        await addReview.mutateAsync({
                          productId,
                          reviewData: { rating, comment },
                        });
                      } catch (error) {
                        console.error("Review submission failed:", error);
                      }
                    }}
                    isSubmitting={addReview.isPending}
                  />
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-muted/50">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Your Review</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReview(userReview)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReview.mutate(userReview._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Rating value={userReview.rating} readOnly />
                      <p className="text-muted-foreground">
                        {userReview.comment}
                      </p>
                    </div>

                    {editingReview && (
                      <div className="pt-4 mt-4 border-t border-muted-foreground/20">
                        <ReviewForm
                          initialRating={editingReview.rating}
                          initialComment={editingReview.comment}
                          onSubmit={async ({ rating, comment }) => {
                            try {
                              await updateReview.mutateAsync({
                                reviewId: editingReview._id,
                                updateData: { rating, comment },
                              });
                              setEditingReview(null);
                            } catch (error) {
                              console.error("Review update failed:", error);
                            }
                          }}
                          onCancel={() => setEditingReview(null)}
                          isSubmitting={updateReview.isPending}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews?.map((review) => (
                <ReviewItem
                  key={review._id}
                  review={review}
                  isCurrentUser={review.user._id === user?._id}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ReviewForm = ({
  initialRating = 0,
  initialComment = "",
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const { toast } = useToast();

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating",
      });
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Rating value={rating} onChange={setRating} />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="h-32"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

const ReviewItem = ({ review, isCurrentUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 border rounded-lg shadow-sm bg-background"
  >
    <div className="flex items-start gap-4">
      <Avatar className="w-10 h-10 border-2 border-primary/20">
        <AvatarImage
          src={review.user.profile.avatar.url}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          {review.user.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium capitalize">
            {review.user.username.replace(/_/g, " ")}
          </h4>
          {isCurrentUser && (
            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
              You
            </span>
          )}
          <span className="ml-auto text-sm text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <Rating value={review.rating} readOnly className="my-1" />
        <p className="text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  </motion.div>
);

const ProductReviewsSkeleton = () => (
  <div className="mt-12 space-y-4">
    <Skeleton className="h-8 w-[200px]" />
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-[100px] w-full" />
    </div>
  </div>
);
