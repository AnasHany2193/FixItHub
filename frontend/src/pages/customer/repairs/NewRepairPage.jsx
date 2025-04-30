import { motion } from "framer-motion";
import RepairRequestForm from "@/components/repair/RepairRequestForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import HeaderPages from "@/components/common/HeaderPages";

export default function NewRepairPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <Button
        variant="link"
        onClick={() => navigate("/repairs/all")}
        className="-ml-2"
      >
        ← Back to Repairs
      </Button>

      <HeaderPages
        title="New Repair Request"
        subtitle="Fill in the details below to create a new repair auction"
      />

      <RepairRequestForm />
    </motion.div>
  );
}
