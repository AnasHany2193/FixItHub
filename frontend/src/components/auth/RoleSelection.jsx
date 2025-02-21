import { motion } from "framer-motion";
import { User, Briefcase } from "lucide-react";

const RoleSelection = ({ onSelect }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid gap-4 md:grid-cols-2"
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-3 py-6 transition-all border cursor-pointer rounded-xl backdrop-blur-sm bg-white/80 dark:bg-indigo-900/30 border-blue-200/50 dark:border-indigo-800/30 hover:border-blue-300 dark:hover:border-indigo-500"
      onClick={() => onSelect("customer")}
    >
      <div className="flex flex-col items-center gap-3">
        <User className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
          I&apos;m a Customer
        </h3>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Find reliable professionals for your repairs
        </p>
      </div>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-3 py-6 transition-all border cursor-pointer rounded-xl backdrop-blur-sm bg-white/80 dark:bg-indigo-900/30 border-blue-200/50 dark:border-indigo-800/30 hover:border-blue-300 dark:hover:border-indigo-500"
      onClick={() => onSelect("worker")}
    >
      <div className="flex flex-col items-center gap-3">
        <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
          I&apos;m a Professional
        </h3>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Offer your repair services to customers
        </p>
      </div>
    </motion.div>
  </motion.div>
);

export default RoleSelection;
