import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Package, BarChart } from "lucide-react";
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

export default function CustomerMarketplaceDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  // Data fetching
  const { data: product, isLoading, refetch } = useProductDetails(productId);
  const { data: favorites } = useFavorites();
  const { data: reviews, refetch: refetchReviews } =
    useProductReviews(productId);

  const { user } = useAuth();

  // Review mutations
  const addReview = useAddProductReview();
  const updateReview = useUpdateProductReview();
  const deleteReview = useDeleteProductReview();

  // Favorite mutations
  const addFavorite = useAddToFavorites();
  const removeFavorite = useRemoveFromFavorites();

  const isFavorite = favorites?.some((fav) => fav._id === productId);
  const userReview = reviews?.find((review) => review.user._id === user._id);

  const handleReviewSubmit = async () => {
    try {
      const payload = { rating, comment: reviewText };
      if (editingReview) {
        await updateReview.mutateAsync({
          reviewId: editingReview._id,
          updateData: payload,
        });
      } else {
        await addReview.mutateAsync({ productId, reviewData: payload });
      }
      setReviewText("");
      setRating(0);
      setEditingReview(null);
    } catch (error) {
      toast({ variant: "error", title: "Error", description: error.message });
    }
  };

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
                    {product.avgRating.toFixed(1)} ({product.reviewsCount}
                    reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-4">
                <img
                  src={
                    product.seller.profile.avatar.url || "/default-avatar.jpg"
                  }
                  className="w-12 h-12 rounded-full"
                  alt={product.seller.username}
                />
                <div>
                  <h3 className="font-medium">
                    Sold by {product.seller.username}
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

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

          {/* Review Form */}
          {!userReview ? (
            <div className="p-6 mb-8 rounded-lg bg-muted">
              <h3 className="mb-4 text-lg font-medium">Write a Review</h3>
              <Rating value={rating} onChange={setRating} />
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="h-24 mt-4"
              />
              <Button className="mt-4" onClick={handleReviewSubmit}>
                Submit Review
              </Button>
            </div>
          ) : (
            <div className="p-6 mb-8 rounded-lg bg-muted">
              <h3 className="mb-4 text-lg font-medium">Your Review</h3>
              <div className="flex items-center gap-4">
                <Rating value={userReview.rating} readOnly />
                <p className="text-muted-foreground">{userReview.comment}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingReview(userReview);
                    setRating(userReview.rating);
                    setReviewText(userReview.comment);
                  }}
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
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews?.map((review) => (
              <div key={review._id} className="p-6 rounded-lg bg-muted">
                <div className="flex items-center gap-4">
                  <img
                    src={review.user.profile.avatar.url}
                    className="w-10 h-10 rounded-full"
                    alt={review.user.username}
                  />
                  <div>
                    <h4 className="font-medium">{review.user.username}</h4>
                    <Rating value={review.rating} readOnly />
                  </div>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
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
