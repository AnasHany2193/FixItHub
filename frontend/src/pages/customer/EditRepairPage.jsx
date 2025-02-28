import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRepairDetails } from "@/hooks/useRepair";
import RepairRequestForm from "@/components/repair/RepairRequestForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function EditRepairPage() {
  const { id } = useParams();
  const { data: repair, isLoading, isError, error } = useRepairDetails(id);

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
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="py-8"
          >
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error Loading Repair</AlertTitle>
              <AlertDescription>
                {error.message || "Failed to load repair details"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Success State */}
        {!isLoading && !isError && repair && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-12"
          >
            <RepairRequestForm
              repair={repair.data}
              isEdit
              key={repair.id} // Force re-render when repair changes
            />
          </motion.div>
        )}

        {/* Not Found State */}
        {!isLoading && !isError && !repair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Repair Not Found</AlertTitle>
              <AlertDescription>
                The requested repair could not be found in our system
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
