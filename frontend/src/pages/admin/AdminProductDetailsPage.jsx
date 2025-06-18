import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart,
  Users,
  Star,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageCarousel } from "@/components/common/ImageCarousel";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteProduct, useProductDetails } from "@/hooks/useAdmin";

const StatCard = ({ icon, title, value }) => (
  <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-100 rounded-full dark:bg-indigo-800/30">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-100">
      {value}
    </span>
  </div>
);

const ProductReviews = ({ reviews }) => {
  const [showReviews, setShowReviews] = useState(true);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Customer Reviews
          <span className="ml-2 font-normal text-muted-foreground">
            ({reviews?.length || 0})
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReviews(!showReviews)}
          className="text-gray-600 dark:text-gray-400"
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
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {reviews?.length ? (
              reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border-2 border-indigo-200 dark:border-indigo-800">
                      <AvatarImage
                        src={review.user.profile.avatar.url}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
                        {review.user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 py-1">
                        <h4 className="font-medium text-gray-900 capitalize dark:text-gray-100">
                          {review.user.username.replace(/_/g, " ")}
                        </h4>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {formatDistanceToNow(review.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center rounded-lg bg-muted">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ProductDetailsSkeleton = () => (
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <Skeleton className="w-32 h-8 mb-6" />
    <div className="grid items-start gap-12 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_500px]">
      <Skeleton className="aspect-video rounded-xl md:sticky top-24" />
      <div className="p-8 space-y-8 bg-white border-2 shadow-xl dark:bg-gray-800 rounded-2xl">
        <Skeleton className="w-3/4 h-12 rounded-full" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default function AdminProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetails(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <ProductDetailsSkeleton />;
  if (isError || !product) {
    return (
      <NotFoundStatus
        title="Product Not Found"
        icon={<Package className="w-12 h-12 text-gray-400" />}
        message="The requested product could not be found."
      />
    );
  }

  const handleDelete = () => {
    deleteProduct(id, {
      onSuccess: () => navigate("/admin/products"),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
    >
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/products")}
        className="gap-2 mb-4 -ml-2 text-gray-600 dark:text-gray-400"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Button>

      <div className="grid items-start gap-12 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_500px]">
        {/* Image Gallery */}
        <div className="md:sticky top-24">
          {product.images?.length ? (
            <ImageCarousel
              images={product.images}
              className="bg-white border shadow-lg rounded-xl dark:bg-gray-800"
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-100 aspect-video dark:bg-gray-700 rounded-xl">
              <Package className="w-20 h-20 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-8 bg-white border shadow-lg dark:bg-gray-800 rounded-xl">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                #{product._id.slice(-6)}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
            </div>
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
          <div className="p-6 border rounded-xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-indigo-200 dark:border-indigo-800">
                <AvatarImage
                  src={product.seller?.profile?.avatar?.url}
                  className="object-cover"
                />
                <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
                  {product.seller?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900 capitalize dark:text-gray-100">
                  Sold by {product.seller.username?.replace(/_/g, " ")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Member since {formatDistanceToNow(product.seller?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="p-6 border rounded-xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Product Overview
              </h2>
              <div className="grid gap-4">
                <DetailItem
                  label="Price"
                  value={`$${product.price.toFixed(2)}`}
                />
                <DetailItem
                  label="Stock"
                  value={
                    <span
                      className={`font-semibold ${
                        product.stock > 10
                          ? "text-emerald-600"
                          : product.stock > 0
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  }
                />
                <DetailItem label="Category" value={product.category} />
              </div>
            </div>

            {/* Specifications */}
            <div className="p-6 border rounded-xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Technical Specifications
              </h2>
              <div className="grid gap-3">
                {product.specs?.length ? (
                  product.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-white rounded-lg dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="text-muted-foreground">{spec.name}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {spec.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No specifications provided
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border rounded-xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-800/20">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Product Details
              </h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="sticky bottom-0 z-20 flex gap-4 py-4 bg-white border-t shadow-lg dark:bg-gray-800">
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5" />
              Delete Product
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-12 mt-16 border-t border-gray-200 dark:border-gray-700">
        <ProductReviews reviews={product.reviews || []} />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
                setShowDeleteConfirm(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
