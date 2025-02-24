import { motion } from "framer-motion";
import RepairRequestForm from "@/components/repair/RepairRequestForm";

export default function NewRepairPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="py-8 space-y-2">
          <motion.h1
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            New Repair Request
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to create a new repair auction
          </p>
        </div>

        <div className="pb-12">
          <RepairRequestForm />
        </div>
      </div>
    </motion.div>
  );
}
