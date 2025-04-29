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
  Sparkle,
  ShieldCheck,
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
                <Package className="w-20 h-20 text-muted-foreground/40" />
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
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-sm font-medium">
            <Sparkle className="w-4 h-4 mr-2 text-amber-500" />
            {product.category}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              1-Year Warranty
            </Badge>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ${product.price}
            </span>
            <span className="line-through text-muted-foreground">
              ${product.price * 1.2}
            </span>
          </div>
          <Badge variant="premium" className="px-5">
            20% OFF
          </Badge>
          <Badge
            className="px-5"
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
              {product.avgRating.toFixed(1)} ({product.reviewsCount} reviews)
            </span>
          </div>
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

      {/*  Specs Grid */}
      <div className="space-y-6">
        <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
          <h2 className="mb-4 text-2xl font-semibold">
            Product Specifications
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.specs?.map((spec, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 border rounded-lg bg-background"
              >
                <span className="font-medium text-muted-foreground">
                  {spec.name}
                </span>
                <span className="font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

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
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-8" />
      <div className="flex gap-4">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-1/4 h-6" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
        <Skeleton className="w-1/4 h-4" />
      </div>
    </div>
    <Skeleton className="h-32" />
    <div className="space-y-4">
      <Skeleton className="w-1/3 h-4" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>
    <Skeleton className="h-24" />
    <Skeleton className="h-12" />
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
  const [editingReview, setEditingReview] = useState(null);

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="sticky top-0 z-10 pb-6 text-2xl font-bold backdrop-blur">
          Customer Reviews
          <span className="ml-2 font-normal text-muted-foreground">
            ({reviews.length || 0})
          </span>
        </h2>{" "}
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
