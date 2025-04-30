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
  Minus,
  Plus,
  Loader2,
  Trash,
  Edit,
  Zap,
  Users,
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
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
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
  const navigate = useNavigate();
  const { productId } = useParams();

  // Data fetching
  const { user } = useAuth();
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

  const userReview = reviews?.find((review) => review.user._id === user._id);

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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Button
          variant="link"
          onClick={() => navigate("/marketplace/products")}
          className="mb-4 -ml-2"
        >
          ← Back to Marketplace
        </Button>

        <div className="grid items-start gap-12 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_500px]">
          {/* Image Gallery */}
          <div className="md:sticky top-24">
            {product.images?.length ? (
              <ImageCarousel
                images={product.images}
                className="border shadow-lg rounded-xl bg-background"
              />
            ) : (
              <div className="flex items-center justify-center aspect-video bg-muted rounded-xl">
                <Zap className="w-20 h-20 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <ProductDetails product={product} refetchProduct={refetch} />
        </div>

        <div className="pt-12 mt-16 border-t">
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
      </div>
    </motion.div>
  );
}

// -------------------------- Details --------------------------

const ProductDetails = ({ product, refetchProduct }) => {
  const { toast } = useToast();
  const { data: cart } = useGetCart();
  const addToCart = useAddToCart();

  // Favorite mutations
  const addFavorite = useAddToFavorites();
  const { data: favorites } = useFavorites();
  const removeFavorite = useRemoveFromFavorites();

  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const isFavorite = favorites?.some((fav) => fav._id === product._id);
  const cartItem = cart?.items?.find(
    (item) => item.product._id === product._id
  );
  const isInCart = Boolean(cartItem);
  const currentQuantity = cartItem?.quantity || 0;

  const handleCartAction = async (action) => {
    try {
      if (action === "add") {
        await addToCart.mutateAsync(product._id);
      } else if (action === "increment") {
        await updateCartItem.mutateAsync({
          productId: product._id,
          action: "increment",
        });
      } else if (action === "decrement") {
        if (currentQuantity <= 1) {
          await removeCartItem.mutateAsync(product._id);
        } else {
          await updateCartItem.mutateAsync({
            productId: product._id,
            action: "decrement",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Cart Error",
        description: error.message,
      });
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync(product._id);
      } else {
        await addFavorite.mutateAsync(product._id);
      }
      refetchProduct();
    } catch (error) {
      toast({ variant: "error", title: "Error", description: error.message });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 border shadow-lg bg-background rounded-xl"
    >
      {/* Product Header  */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
          {product.name}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<BarChart className="w-6 h-6 text-emerald-600" />}
            title="Purchases"
            value={product.purchasesCount || 0}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-pink-600" />}
            title="Favorites"
            value={product.favoritesCount || 0}
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-amber-500" />}
            title="Avg Rating"
            value={product.avgRating.toFixed(1)}
          />
        </div>
      </div>

      {/* Seller Info */}
      <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage
              src={product.seller.profile.avatar.url}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {product.seller.username?.[0]?.toUpperCase() || (
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

      {/*  Product Info */}
      <div className="space-y-6">
        <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
          <h2 className="mb-4 text-2xl font-semibold">Product Overview</h2>
          <div className="grid gap-4">
            <DetailItem label="Price" value={`$${product.price}`} />
            <DetailItem
              label="Stock"
              value={
                <span
                  className={`font-semibold ${
                    product.stock > 10
                      ? "text-emerald-600"
                      : product.stock > 0
                        ? "text-amber-600"
                        : "text-destructive"
                  }`}
                >
                  {product.stock} units
                </span>
              }
            />
            <DetailItem
              label="Category"
              value={<Badge variant="outline">{product.category}</Badge>}
            />
          </div>
        </div>

        {/* Specifications */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50"
        >
          <h2 className="mb-4 text-2xl font-semibold">
            Technical Specifications
          </h2>
          <div className="grid gap-3">
            {product.specs?.map((spec, index) => (
              <div
                key={index}
                className="flex justify-between p-3 transition-colors rounded-lg bg-background hover:bg-muted/50"
              >
                <span className="text-muted-foreground">{spec.name}</span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Description */}
        <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
          <h2 className="mb-4 text-2xl font-semibold">Product Details</h2>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
      </div>

      {/*  Cart Actions */}
      <div className="sticky bottom-0 z-20 flex flex-col gap-4 py-4 border-t shadow-lg sm:flex-row sm:items-center bg-background">
        <div className="flex flex-1 gap-2">
          {isInCart ? (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center flex-1 gap-2 rounded-lg">
                <Button
                  variant="outline"
                  className="px-5 rounded-r-none"
                  disabled={currentQuantity < 1 || updateCartItem.isPending}
                  onClick={() => handleCartAction("decrement")}
                >
                  {currentQuantity === 1 ? (
                    <Trash className="w-5 h-5 text-destructive" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                </Button>

                <div className="flex items-center justify-center flex-1">
                  <span className="font-medium text-primary">
                    {currentQuantity} in Cart
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="px-5 rounded-l-none"
                  disabled={
                    currentQuantity >= product.stock || updateCartItem.isPending
                  }
                  onClick={() => handleCartAction("increment")}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="destructive"
                className="px-5"
                onClick={() => removeCartItem.mutateAsync(product._id)}
                disabled={removeCartItem.isPending}
              >
                {removeCartItem.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash className="w-5 h-5" />
                )}
              </Button>
            </div>
          ) : (
            <Button
              className="flex-1 gap-2"
              disabled={product.stock <= 0 || addToCart.isPending}
              onClick={() => handleCartAction("add")}
            >
              {addToCart.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          variant={isFavorite ? "destructive" : "default"}
          className="gap-2"
          onClick={handleFavoriteToggle}
          disabled={addFavorite.isPending || removeFavorite.isPending}
        >
          {addFavorite.isPending || removeFavorite.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              />
              {isFavorite ? "Favored" : "Favorite"}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const ProductDetailsSkeleton = () => (
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="w-32 h-8" />
    </div>

    <div className="grid items-start gap-12 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_500px]">
      {/* Image Gallery Skeleton */}
      <div className="md:sticky top-24">
        <Skeleton className="aspect-video rounded-xl" />
      </div>

      {/* Product Stats Skeleton */}
      <div className="p-8 space-y-8 border-2 shadow-xl bg-background rounded-2xl">
        {/* Title Skeleton */}
        <div className="space-y-6">
          <Skeleton className="w-3/4 h-12 rounded-full" />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Info */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-muted/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-48 h-4" />
            </div>
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Overview Skeleton */}
          <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
            <Skeleton className="w-48 h-6 mb-4" />
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Specifications Skeleton */}
          <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
            <Skeleton className="w-64 h-6 mb-4" />
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between p-3 rounded-lg bg-background"
                >
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-48 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
            <Skeleton className="w-56 h-6 mb-4" />
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-4/5 h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const StatCard = ({ icon, title, value }) => (
  <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-muted/50">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-primary/10">{icon}</div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);
// -------------------------- Review ---------------------------

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
  const [editingReviewId, setEditingReviewId] = useState(null);

  const handleReviewUpdate = async (reviewId, updateData) => {
    await updateReview.mutateAsync({
      reviewId,
      updateData,
    });
    setEditingReviewId(null);
    refetchReviews();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="sticky top-0 z-10 pb-6 text-2xl font-bold backdrop-blur">
          Customer Reviews
          <span className="ml-2 font-normal text-muted-foreground">
            ({reviews.length || 0})
          </span>
        </h2>
        <div className="flex gap-2">
          <Button
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
            variant="outline"
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
          >
            {/* User Review Section with Inline Editing */}
            {!userReview && (
              <div className="p-6 mb-8 rounded-lg bg-muted/50">
                <h3 className="mb-4 text-lg font-medium">Write a Review</h3>
                <ReviewForm
                  onSubmit={async ({ rating, comment }) =>
                    await addReview.mutateAsync({
                      productId,
                      reviewData: { rating, comment },
                    })
                  }
                  isSubmitting={addReview.isPending}
                />
              </div>
            )}

            {/* Reviews List with Inline Editing */}
            <div className="space-y-4">
              {reviews?.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg shadow-sm bg-background"
                >
                  {editingReviewId === review._id ? (
                    <ReviewForm
                      initialRating={review.rating}
                      initialComment={review.comment}
                      onSubmit={(data) => handleReviewUpdate(review._id, data)}
                      onCancel={() => setEditingReviewId(null)}
                      isSubmitting={updateReview.isPending}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg shadow-sm bg-background"
                    >
                      <div className="flex items-center gap-4">
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
                          <div className="flex items-center gap-2 py-1">
                            <h4 className="font-medium capitalize">
                              {review.user.username.replace(/_/g, " ")}
                            </h4>
                            {review.user._id === user?._id && (
                              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-5">
                            <Rating
                              size="sm"
                              value={review.rating}
                              readOnly
                              className="my-1"
                            />
                            <p className="text-muted-foreground">
                              {review.comment}
                            </p>
                          </div>
                        </div>

                        <span className="ml-auto text-sm text-muted-foreground">
                          {formatDistanceToNow(review.createdAt)}
                        </span>
                        {review.user._id === user?._id && (
                          <div className="flex gap-2 ml-auto">
                            <Button
                              size="sm"
                              onClick={() => setEditingReviewId(review._id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="sr-only">Edit review</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteReview.mutate(review._id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                              <span className="sr-only">Delete review</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
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
        variant: "error",
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
