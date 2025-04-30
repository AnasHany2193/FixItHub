import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductForm from "@/components/marketplace/ProductForm";
import { useWorkerProductDetails } from "@/hooks/useMarketplace";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import HeaderPages from "@/components/common/HeaderPages";

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
    >
      <Button
        variant="link"
        onClick={() => navigate("/marketplace/my-products")}
        className="-ml-2"
      >
        ← Back to Marketplace
      </Button>

      <HeaderPages
        title="Update Product"
        subtitle="Modify your existing product listing"
      />

      <ProductForm product={product} isEdit={true} />
    </motion.div>
  );
}
