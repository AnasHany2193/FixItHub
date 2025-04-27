import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit, Trash, Package, PlusCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMyProducts } from "@/hooks/useMarketplace";
import NotFoundStatus from "@/components/common/NotFoundStatus";

export default function ProductListPage() {
  const navigate = useNavigate();
  const { data: products, isLoading, deleteProduct } = useMyProducts();

  return (
    <div className="px-4 py-6 mx-auto md:px-6 lg:px-8 max-w-7xl">
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
              onEdit={() =>
                navigate(`/marketplace/edit-product/${product._id}`)
              }
              onDelete={() => deleteProduct.mutate(product._id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onEdit, onDelete }) => (
  <motion.div whileHover={{ scale: 1.02 }}>
    <Card className="overflow-hidden">
      <CardHeader className="relative p-0 aspect-video">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {product.category}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">${product.price}</span>
          <Badge
            variant={
              product.stock > 10
                ? "success"
                : product.stock > 0
                  ? "warning"
                  : "destructive"
            }
          >
            {product.stock} in stock
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button variant="outline" className="w-full" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
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
