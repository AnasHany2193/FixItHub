import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { AlertTriangle, Package } from "lucide-react";

import { useRepairDetails } from "@/hooks/useRepair";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import RepairRequestForm from "@/components/repair/RepairRequestForm";

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-b from-red-50 to-red-100 dark:from-red-800 dark:to-red-900"
          >
            <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-red-100 to-red-200 dark:from-red-700 dark:to-red-800">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Error Loading Repair
            </h3>
            <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
              {error?.message || "Failed to load repair details"}
            </p>
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
              repair={repair}
              isEdit
              key={repair.id} // Force re-render when repair changes
            />
          </motion.div>
        )}

        {/* Not Found State */}
        {!isLoading && !isError && !repair && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="p-4 mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
              <Package className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Repair Not Found
            </h3>
            <p className="max-w-md mx-auto text-gray-600 dark:text-gray-300">
              The requested repair ID does&apos;t exist in our system. Please
              check the ID or create a new repair request if needed.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
