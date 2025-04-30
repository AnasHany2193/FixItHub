import { motion } from "framer-motion";

const HeaderPages = ({ title, subtitle }) => {
  return (
    <motion.div
      initial={{ y: -10 }}
      animate={{ y: 0 }}
      className="py-8 space-y-2"
    >
      <h1 className="text-2xl font-bold text-transparent md:text-3xl bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-gray-600 dark:text-gray-300">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default HeaderPages;
