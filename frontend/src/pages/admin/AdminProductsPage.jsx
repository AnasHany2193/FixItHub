import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const limitOptions = [
  { value: 6, label: "06 per page" },
  { value: 15, label: "15 per page" },
  { value: 60, label: "60 per page" },
];

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    page: 1,
    limit: 6,
  });

  const { data: products, isLoading } = useAllProducts(filters);
  const total = products?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  const handlePrevPage = () => {
    if (filters.page > 1) setFilters({ ...filters, page: filters.page - 1 });
  };

  const handleNextPage = () => {
    if (filters.page < pages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  return (
    <>
      {/* Filter Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <HeaderPages
          title="Manage Products"
          subtitle="View and manage marketplace products"
        />
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
          startIcon={<Search className="w-4 h-4 text-gray-500" />}
          className="w-full md:w-64"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters({ ...filters, category: value, page: 1 })
          }
        >
          <SelectTrigger className="w-full md:w-48">
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
        <Select
          value={filters.limit.toString()}
          onValueChange={(value) =>
            setFilters({ ...filters, limit: Number(value), page: 1 })
          }
        >
          <SelectTrigger className="w-full md:w-48">
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

      {/* Product Grid */}
      {isLoading ? (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </motion.div>
      ) : products?.data?.length === 0 ? (
        <NotFoundStatus
          icon={<Package className="w-12 h-12 text-gray-400" />}
          title="No Products Found"
          message="Try adjusting your filters or search terms"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {products?.data?.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              navigate={navigate}
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
          <span className="text-sm text-gray-700">
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
    </>
  );
}

const ProductCard = ({ product, navigate }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/admin/products/${product._id}`)}
    >
      <Card className="overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-gray-700/50 bg-white/80 dark:bg-gray-800/80">
        <CardHeader className="p-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold line-clamp-1">
              {product.name}
            </h3>
            <Badge variant="secondary" className="text-white bg-white/20">
              #{product._id.slice(-6)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="relative aspect-video">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="object-cover w-full h-full rounded-md"
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
              <Badge
                variant={product.stock > 0 ? "success" : "destructive"}
                className="shadow-sm"
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {product.purchasesCount} sold
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Seller: {product.seller?.username || "Unknown"}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-12 bg-gradient-to-r" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="w-full aspect-video" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4" />
    </CardContent>
  </Card>
);
