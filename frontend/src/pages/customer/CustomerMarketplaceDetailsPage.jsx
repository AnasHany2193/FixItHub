import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Truck, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductDetails } from "@/hooks/useMarketplace";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ImageCarousel } from "@/components/common/ImageCarousel";

export default function CustomerMarketplaceDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data: product, isLoading } = useProductDetails(productId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-gray-600 dark:text-gray-300"
        >
          ← Back to Marketplace
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
          </div>
        ) : !product ? (
          <NotFoundStatus
            title="Product Not Found"
            icon={<Package className="w-12 h-12" />}
            message="Try adjusting your filters or search terms"
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-video">
                {product.images ? (
                  <ImageCarousel images={product.images} />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <Badge variant="secondary" className="absolute top-2 left-2">
                  {product.category}
                </Badge>
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <Badge
                    variant={product.stock > 0 ? "success" : "destructive"}
                    className="text-sm"
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>

              {/* Specifications */}
              <div className="p-4 rounded-lg bg-muted">
                <h2 className="mb-2 text-lg font-semibold">Specifications</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.specs?.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="font-medium">{spec.name}:</span>
                      <span className="text-muted-foreground">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              {/* Product Policies */}
              <div className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-6 h-6 text-primary" />
                  <span className="text-sm">
                    Free shipping on orders over $100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
