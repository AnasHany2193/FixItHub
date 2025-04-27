import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, DollarSign, Zap } from "lucide-react";

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
import { useProducts } from "@/hooks/useMarketplace";
import NotFoundStatus from "@/components/common/NotFoundStatus";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function CustomerMarketplacePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  const { data: products, isLoading } = useProducts(filters);

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Filter Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl">
            Marketplace
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-300">
            Find quality computer parts and accessories
          </p>
        </motion.div>

        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          startIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Filter Controls */}
      <div className="grid items-center justify-between w-full gap-4 mb-8 md:grid-cols-3">
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
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

        <div className="flex gap-2">
          <Input
            placeholder="Min price"
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            startIcon={<DollarSign className="w-4 h-4" />}
          />
          <Input
            placeholder="Max price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            startIcon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters({ ...filters, sort: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
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
      ) : products?.length === 0 ? (
        <NotFoundStatus
          icon={<Search className="w-12 h-12" />}
          title="No Products Found"
          message="Try adjusting your filters or search terms"
        />
      ) : (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={() => navigate(`/marketplace/${product._id}`)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        {product.images?.[0]?.url ? (
          <div className="relative h-full">
            <img
              src={product.images[0].url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            {product.images.length > 1 && (
              <Badge
                variant="secondary"
                className="absolute px-2 py-1 text-xs bottom-2 left-2"
              >
                +{product.images.length - 1}
              </Badge>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">${product.price}</span>
          <Badge
            variant={
              product.stock > 10
                ? "success"
                : product.stock > 0
                  ? "warning"
                  : "destructive"
            }
          >
            {product.stock > 0 ? `${product.stock} In Stock` : " Sold Out"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full aspect-video" />
    <CardContent className="p-4 space-y-2">
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
      <div className="flex gap-2">
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-1/2 h-6" />
      </div>
    </CardContent>
  </Card>
);
