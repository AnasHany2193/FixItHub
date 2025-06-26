import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Package,
  Users,
  DollarSign,
  Star,
  Trash,
  Zap,
  Edit,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  useWorkerProductDetails,
  useWorkerProductReviews,
  useDeleteProduct,
} from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { Rating } from "@/components/common/Rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet-async";

export default function WorkerProductDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();

  // Data fetching
  const { data: product, isLoading } = useWorkerProductDetails(productId);
  const {
    data: reviews,
    isLoading: loadingReviews,
    refetch: refetchReviews,
    isRefetching: refetchingReviews,
  } = useWorkerProductReviews(productId);
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      toast({
        variant: "success",
        title: "Product Deleted",
        description: "Your product has been removed successfully",
      });
      navigate("/marketplace/worker/products");
    } catch (error) {
      toast({
        variant: "error",
        title: "Deletion Failed",
        description: error.message,
      });
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
      <Helmet>
        <title>{product.name || "Product Details"} | FixItHub</title>
      </Helmet>

      <div className="">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="link"
            onClick={() => navigate("/marketplace/my-products")}
            className="-ml-2"
          >
            ← Back to Products
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/marketplace/edit-product/${product._id}`)
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </div>

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

          {/* Product Stats */}
          <div className="p-8 space-y-8 border-2 shadow-xl bg-background rounded-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
                {product.name}
              </h1>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<BarChart className="w-6 h-6 text-emerald-600" />}
                  title="Total Sales"
                  value={product.totalSales}
                />
                <StatCard
                  icon={<DollarSign className="w-6 h-6 text-purple-600" />}
                  title="Total Revenue"
                  value={`$${product.totalRevenue}`}
                />
                <StatCard
                  icon={<Star className="w-6 h-6 text-amber-500" />}
                  title="Avg Rating"
                  value={product.avgRating.toFixed(1)}
                />
                <StatCard
                  icon={<Users className="w-6 h-6 text-pink-600" />}
                  title="Favorites"
                  value={product.favoritesCount}
                />
              </div>
            </motion.div>

            {/*  Product Info */}
            <div className="space-y-6">
              <div className="p-6 border rounded-xl bg-gradient-to-r from-primary/5 to-muted/50">
                <h2 className="mb-4 text-2xl font-semibold">
                  Product Overview
                </h2>
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
          </div>
        </div>

        <Separator className="my-12" />

        {/* Reviews Component */}
        <WorkerProductReviews
          reviews={reviews?.data}
          loading={loadingReviews}
          refresh={refetchReviews}
          refreshing={refetchingReviews}
        />
      </div>
    </motion.div>
  );
}

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

const DetailItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const ProductDetailsSkeleton = () => (
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="w-32 h-8" />
      <div className="flex gap-2">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-32 h-8" />
      </div>
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
            {[...Array(4)].map((_, i) => (
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

// -------------------- Reviews --------------------
export const WorkerProductReviews = ({
  reviews,
  loading,
  refresh,
  refreshing,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">
          Customer Feedback
          <span className="ml-3 text-muted-foreground">
            ({loading ? "..." : reviews?.length})
          </span>
        </h2>

        <Button variant="outline" onClick={refresh} disabled={refreshing}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Reviews
        </Button>
      </div>

      {loading ? (
        <WorkerReviewsSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reviews?.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 transition-colors border-2 rounded-xl hover:border-primary/20 bg-gradient-to-r from-primary/5 to-muted/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <Link to={`/profile/${review.user?._id}`}>
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={review.user.profile.avatar.url} />
                    <AvatarFallback className="bg-primary/10">
                      {review.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <h4 className="font-medium capitalize">
                    {review.user.username.replace(/_/g, " ")}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Rating value={review.rating} readOnly />
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-muted-foreground">{review.comment}</span>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export const WorkerReviewsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-6 border-2 rounded-xl bg-background">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <Skeleton className="w-full h-16" />
      </div>
    ))}
  </div>
);
