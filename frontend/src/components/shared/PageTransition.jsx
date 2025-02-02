import { motion } from "framer-motion";

export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ rotateX: 15, opacity: 0 }}
    animate={{ rotateX: 0, opacity: 1 }}
    exit={{ rotateX: -15, opacity: 0 }}
    transition={{
      type: "spring",
      stiffness: 100,
      mass: 0.7, // Lower mass for quicker movement
    }}
    style={{
      transformOrigin: "top center",
      position: "absolute",
      width: "100%",
    }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
