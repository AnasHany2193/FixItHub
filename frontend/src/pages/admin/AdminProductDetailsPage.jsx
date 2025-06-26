import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  BarChart,
  Users,
  Star,
  Trash2,
  ArrowLeft,
  DollarSign,
  Box,
  Layers,
  FileText,
  Settings,
  Info,
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
import { Helmet } from "react-helmet-async";

const StatCard = ({ icon, title, value, color }) => (
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
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const DetailItem = ({ icon, label, value, highlight }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <span
      className={`font-medium ${highlight ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-gray-100"}`}
    >
      {value}
    </span>
  </div>
);

const ProductDetailsSkeleton = () => (
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <Skeleton className="w-32 h-8 mb-6" />
    <div className="grid items-start gap-12 md:grid-cols-2">
      <Skeleton className="aspect-video rounded-2xl md:sticky top-24" />
      <div className="space-y-8">
        <Skeleton className="w-3/4 h-12 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Helmet>
        <title>{product.name || "Product Details"} | FixItHub</title>
      </Helmet>
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/products")}
        className="gap-2 mb-6 -ml-2 text-gray-600 dark:text-gray-400"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Button>

      <div className="grid items-start gap-8 md:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:sticky top-24"
        >
          {product.images?.length ? (
            <ImageCarousel
              images={product.images}
              className="bg-white border shadow-xl rounded-2xl dark:bg-gray-800"
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-100 aspect-video dark:bg-gray-700 rounded-2xl">
              <Package className="w-20 h-20 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <Badge variant="premium" className="text-sm">
                ${product.price.toFixed(2)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
              <Badge variant="outline" className="font-mono">
                #{product._id.slice(-6)}
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={
                <BarChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              }
              title="Purchases"
              value={product.purchasesCount || 0}
              color="from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
            />
            <StatCard
              icon={
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              }
              title="Favorites"
              value={product.favoritesCount || 0}
              color="from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20"
            />
            <StatCard
              icon={
                <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              }
              title="Avg Rating"
              value={product.avgRating.toFixed(1)}
              color="from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
            />
            <StatCard
              icon={
                <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              }
              title="In Stock"
              value={product.stock}
              color="from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20"
            />
          </div>

          {/* Seller Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="flex items-center gap-4">
              <Link to={`/profile/${product.seller?._id}`}>
                <Avatar className="w-12 h-12 border-2 border-indigo-200 cursor-pointer dark:border-indigo-800">
                  <AvatarImage
                    src={product.seller?.profile?.avatar?.url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-400">
                    {product.seller?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h3 className="font-medium text-gray-900 capitalize dark:text-gray-100">
                  Sold by {product.seller.username?.replace(/_/g, " ")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Member since {formatDistanceToNow(product.seller?.createdAt)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-5 border rounded-2xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Product Overview
              </h2>
              <div className="space-y-3">
                <DetailItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Price"
                  value={`$${product.price.toFixed(2)}`}
                  highlight
                />
                <DetailItem
                  icon={<Layers className="w-4 h-4" />}
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
                <DetailItem
                  icon={<Package className="w-4 h-4" />}
                  label="Category"
                  value={product.category}
                />
              </div>
            </motion.div>

            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-5 border rounded-2xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Technical Specifications
              </h2>
              <div className="space-y-3">
                {product.specs?.length ? (
                  product.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-white rounded-lg dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {spec.name}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {spec.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-center rounded-lg bg-muted text-muted-foreground">
                    No specifications provided
                  </p>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-5 border rounded-2xl bg-gradient-to-r from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Product Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {product.description}
              </p>
            </motion.div>
          </div>

          {/* Admin Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="sticky bottom-0 z-20 flex gap-3 py-4 mt-8 bg-inherit "
          >
            <Button
              variant="destructive"
              className="flex-1 gap-2 shadow-lg"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5" />
              Delete Product
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete &quot;{product.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 my-4 text-center bg-red-50 rounded-xl dark:bg-red-900/20">
            <p className="font-medium text-red-700 dark:text-red-400">
              All product data, images, and reviews will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
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
    </motion.div>
  );
}
