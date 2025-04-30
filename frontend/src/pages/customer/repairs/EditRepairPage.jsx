import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Package } from "lucide-react";

import { useRepairDetails } from "@/hooks/useRepair";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import RepairRequestForm from "@/components/repair/RepairRequestForm";
import NotFoundStatus from "@/components/common/NotFoundStatus";
import HeaderPages from "@/components/common/HeaderPages";
import { Button } from "@/components/ui/button";

export default function EditRepairPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: repair, isLoading, isError } = useRepairDetails(id);

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

      {/* Header Section */}
      <HeaderPages
        title="Update Repair Request"
        subtitle="Modify your repair details and manage associated auction"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <NotFoundStatus
          icon={<AlertTriangle />}
          title="Error Loading Repair"
          message="Failed to load repair details"
          buttonText="Return to Repairs"
        />
      )}

      {/* Success State */}
      {!isLoading && !isError && repair && (
        <RepairRequestForm repair={repair} isEdit key={repair.id} />
      )}

      {/* Not Found State */}
      {!isLoading && !isError && !repair && (
        <NotFoundStatus
          icon={<Package />}
          title="Repair Not Found"
          message="The requested repair ID doesn't exist in our system. Please check the ID or create a new repair request if needed."
          buttonText="Return to Repairs"
        />
      )}
    </motion.div>
  );
}
