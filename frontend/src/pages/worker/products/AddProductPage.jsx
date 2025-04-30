import { motion } from "framer-motion";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import ProductForm from "@/components/marketplace/ProductForm";
import HeaderPages from "@/components/common/HeaderPages";

export default function AddProductPage() {
  const navigate = useNavigate();

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
        title="New Product Listing"
        subtitle="Fill in the details below to create a new product listing"
      />

      <ProductForm />
    </motion.div>
  );
}
