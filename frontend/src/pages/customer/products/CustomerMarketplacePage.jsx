import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  DollarSign,
  Zap,
  Heart,
  Plus,
  ShoppingCart,
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
import {
  useAddToCart,
  useAddToFavorites,
  useFavorites,
  useGetCart,
  useProducts,
  useRemoveFromFavorites,
  useUpdateCartItem,
} from "@/hooks/useMarketplace";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";

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
    <>
      {/* Filter Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <HeaderPages
          title="Marketplace"
          subtitle="Find quality computer parts and accessories"
        />

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
              onClick={() => navigate(`/marketplace/products/${product._id}`)}
            />
          ))}
        </motion.div>
      )}
    </>
  );
}

const ProductCard = ({ product, onClick }) => {
  const { data: favorites } = useFavorites();
  const { data: cart } = useGetCart();
  const { mutateAsync: addFavorite } = useAddToFavorites();
  const { mutateAsync: removeFavorite } = useRemoveFromFavorites();
  const { mutateAsync: addToCart } = useAddToCart();
  const { mutateAsync: updateCartItem } = useUpdateCartItem();

  const isFavorite = favorites?.some((fav) => fav._id === product._id);
  const cartItem = cart?.items?.find(
    (item) => item.product._id === product._id
  );
  const isInCart = Boolean(cartItem);

  const handleCartAction = (e) => {
    e.stopPropagation();
    if (isInCart)
      updateCartItem({ productId: product._id, action: "increment" });
    else addToCart(product._id);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isFavorite) removeFavorite(product._id);
    else addFavorite(product._id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{
        type: "spring",
        stiffness: 300,
        duration: 0.2,
      }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <Card className="overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50">
        {/* Image section */}
        <div className="relative aspect-video">
          <div className="relative h-full overflow-hidden">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}

            {/* Top badges */}
            <div className="absolute flex gap-2 top-2 left-2">
              <Badge variant="secondary" className="shadow-sm">
                {product.category}
              </Badge>
              {product.images?.length > 1 && (
                <Badge variant="secondary" className="shadow-sm">
                  +{product.images.length - 1}
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute flex gap-2 top-2 right-2">
            <button
              onClick={handleFavoriteClick}
              className="p-2 transition-all rounded-full shadow-sm bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:shadow-md"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorite
                    ? "text-red-600 fill-red-600 hover:scale-110"
                    : "text-gray-600 hover:text-red-500 hover:scale-110"
                }`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
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
                className="shadow-sm"
              >
                {product.stock > 0 ? `${product.stock} left` : "Sold out"}
              </Badge>
            </div>

            <button
              onClick={handleCartAction}
              disabled={product.stock <= 0}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all rounded-lg shadow-sm ${
                isInCart
                  ? "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                  : "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300"
              }`}
            >
              {isInCart ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{cartItem.quantity} in Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
