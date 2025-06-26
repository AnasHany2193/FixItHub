import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";
import { useAllProducts } from "@/hooks/useAdmin";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
];

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    page: 1,
    limit: 4,
  });

  const { data: products, isLoading } = useAllProducts(filters);
  const total = products?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <HeaderPages
          title="Manage Products"
          subtitle="View and manage marketplace products"
        />

        <div className="flex items-center gap-2">
          <div>
            <label className="block mb-2 text-sm font-medium">Search</label>
            <Input
              placeholder="Product name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              startIcon={<Search className="w-4 h-4 text-gray-500" />}
            />
          </div>

          <div className="w-1/2">
            <label className="block mb-2 text-sm font-medium">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {!isLoading && total > 0 && (
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg md:grid-cols-4 bg-muted dark:bg-gray-800">
          <StatItem
            icon={
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
            label="Total Products"
            value={total}
          />
          <StatItem
            icon={
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
            label="Total Sold"
            value={
              products?.data?.reduce(
                (sum, p) => sum + (p.purchasesCount || 0),
                0
              ) || 0
            }
          />
          <StatItem
            icon={
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            }
            label="Avg. Rating"
            value={(
              products?.data?.reduce((sum, p) => sum + (p.avgRating || 0), 0) /
                products?.data?.length || 0
            ).toFixed(1)}
          />
          <StatItem
            icon={
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            }
            label="Total Favorites"
            value={
              products?.data?.reduce(
                (sum, p) => sum + (p.favoritesCount || 0),
                0
              ) || 0
            }
          />
        </div>
      )}

      {/* Product Count */}
      {!isLoading && total > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {products?.data?.length} of {total} products
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <LoadingState limit={filters.limit} />
      ) : products?.data?.length ? (
        <>
          <ProductsGrid products={products.data} navigate={navigate} />
          <Pagination
            pagination={{ page: filters.page, pages, total }}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      ) : (
        <NotFoundStatus
          icon={<Package className="w-16 h-16 text-gray-400" />}
          title="No Products Found"
          message="Try adjusting your filters or search terms"
        />
      )}
    </div>
  );
}

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg dark:bg-gray-700">
    <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">{icon}</div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const LoadingState = ({ limit }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: limit }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

const ProductsGrid = ({ products, navigate }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    <AnimatePresence>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} navigate={navigate} />
      ))}
    </AnimatePresence>
  </div>
);

const ProductCard = ({ product, navigate }) => {
  const stockStatus =
    product.stock > 10
      ? { label: "In Stock", variant: "success" }
      : product.stock > 0
        ? { label: "Low Stock", variant: "warning" }
        : { label: "Out of Stock", variant: "destructive" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/admin/products/${product._id}`)}
    >
      <Card className="h-full overflow-hidden transition-all border shadow-sm dark:border-gray-700 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:shadow-lg">
        {/* Product Header */}
        <div className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">{product.name}</h3>
            <Badge variant="secondary" className="font-mono text-xs">
              #{product._id.slice(-6)}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <Badge variant="secondary" className="capitalize">
              {product.category}
            </Badge>
            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Product Image */}
          <div className="relative aspect-square">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="object-cover w-full h-full border rounded-md dark:border-gray-700"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {product.images?.length > 1 && (
              <Badge className="absolute top-2 left-2">
                +{product.images.length - 1}
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">
                  {product.avgRating?.toFixed(1) || 0.0}
                </span>
                <span className="text-xs text-gray-500">
                  ({product.reviewsCount || 0})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm">{product.favoritesCount || 0}</span>
              </div>

              <div className="flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-green-500" />
                <span className="text-sm">{product.purchasesCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-sm font-medium">
                Stock: {product.stock}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Seller Info */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src={
                  product.seller?.profile?.avatar?.url ||
                  "http://localhost:5000/uploads/defaults/avatar.png"
                }
                alt={product.seller?.username}
                className="object-cover w-8 h-8 border rounded-full dark:border-gray-700"
              />
              <div>
                <p className="text-sm font-medium truncate">
                  {product.seller?.username || "Unknown Seller"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {product.seller?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <Card className="overflow-hidden border dark:border-gray-700">
    <Skeleton className="w-full h-16 bg-gradient-to-r from-indigo-500 to-purple-500" />
    <CardContent className="p-4 space-y-4">
      <Skeleton className="w-full rounded-md aspect-square" />
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4 rounded-md" />
        <Skeleton className="w-1/2 h-4 rounded-md" />
        <Skeleton className="w-full h-3 rounded-md" />
        <Skeleton className="w-2/3 h-3 rounded-md" />
      </div>
      <Skeleton className="w-16 h-4 rounded-md" />
    </CardContent>
  </Card>
);

const Pagination = ({ pagination, onPageChange }) => {
  const { page, pages, total } = pagination;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        {total} products • Page {page} of {pages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
          const pageNum =
            pages <= 5
              ? i + 1
              : page <= 3
                ? i + 1
                : page >= pages - 2
                  ? pages - 4 + i
                  : page - 2 + i;

          return (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNum)}
              disabled={page === pageNum}
            >
              {pageNum}
            </Button>
          );
        })}

        {pages > 5 && page < pages - 2 && <span className="px-2">...</span>}

        {pages > 5 && page < pages - 2 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pages)}
          >
            {pages}
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
