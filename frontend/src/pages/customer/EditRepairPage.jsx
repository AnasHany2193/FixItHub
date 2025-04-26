import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { AlertTriangle, Package } from "lucide-react";

import { useRepairDetails } from "@/hooks/useRepair";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import RepairRequestForm from "@/components/repair/RepairRequestForm";
import NotFoundStatus from "@/components/common/NotFoundStatus";

export default function EditRepairPage() {
  const { id } = useParams();
  const { data: repair, isLoading, isError } = useRepairDetails(id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="py-8 space-y-2">
          <motion.h1
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Update Repair Request
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modify your repair details and manage associated auction
          </p>
        </div>

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-12"
          >
            <RepairRequestForm
              repair={repair}
              isEdit
              key={repair.id} // Force re-render when repair changes
            />
          </motion.div>
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
      </div>
    </motion.div>
  );
}
