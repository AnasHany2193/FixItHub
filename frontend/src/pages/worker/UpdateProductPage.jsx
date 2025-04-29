import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductForm from "@/components/marketplace/ProductForm";
import { useWorkerProductDetails } from "@/hooks/useMarketplace";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function UpdateProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading,
    isError,
  } = useWorkerProductDetails(productId);

  useEffect(() => {
    if (isError) {
      navigate("/marketplace/my-products", { replace: true });
    }
  }, [isError, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <Button
          variant="link"
          onClick={() => navigate("/marketplace/my-products")}
          className="mb-4 -ml-2"
        >
          ← Back to Marketplace
        </Button>

        <div className="py-8 space-y-2">
          <motion.h1
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Update Product
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modify your existing product listing
          </p>
        </div>

        <div className="pb-12">
          <ProductForm product={product} isEdit={true} />
        </div>
      </div>
    </motion.div>
  );
}
