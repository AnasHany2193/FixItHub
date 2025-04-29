import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit, Trash, Package, PlusCircle, RefreshCw, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDeleteProduct, useMyProducts } from "@/hooks/useMarketplace";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "all",
    stockStatus: "all",
    sort: "newest",
  });

  const { data: products, isLoading } = useMyProducts(filters);
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }}>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text md:text-3xl">
            My Products
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-300">
            Manage your active Products
          </p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="gap-2 shadow-lg bg-gradient-to-r dark:text-gray-200 from-indigo-600 to-purple-600 hover:shadow-indigo-500/30"
            onClick={() => navigate("/marketplace/new-product")}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm">Add Product</span>
          </Button>
        </motion.div>
      </div>

      {/* Filter Controls */}
      <div className="grid gap-4 mb-8 md:grid-cols-3">
        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="appliances">Appliances</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between gap-2">
          {["all", "in-stock", "low-stock", "out-of-stock"].map((status) => (
            <Button
              key={status}
              variant={filters.stockStatus === status ? "default" : "outline"}
              size="sm"
              className="w-full capitalize"
              onClick={() =>
                setFilters((prev) => ({ ...prev, stockStatus: status }))
              }
            >
              {status.replaceAll("-", " ")}
            </Button>
          ))}
        </div>

        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sort: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </motion.div>
      ) : products?.length === 0 ? (
        <NotFoundStatus
          icon={<Package />}
          title="No Products Listed"
          message="Start by adding your first product"
          action={
            <Button onClick={() => navigate("/marketplace/new-product")}>
              Add Product
            </Button>
          }
        />
      ) : (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(e) => {
                e.stopPropagation();
                navigate(`/marketplace/edit-product/${product._id}`);
              }}
              onClick={() => navigate(`/marketplace/products/${product._id}`)}
              onDelete={(e) => {
                e.stopPropagation();
                deleteProduct(product._id);
              }}
              deleting={deleting}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onEdit, onClick, onDelete, deleting }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="cursor-pointer group"
    onClick={onClick}
  >
    <Card className="overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-700/50 dark:hover:shadow-gray-700/50">
      <div className="relative aspect-video">
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
        <Badge variant="secondary" className="absolute capitalize top-2 left-2">
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash className="w-4 h-4" />
              )}
            </Button>
          </div>
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
