import React from "react";
import { motion } from "framer-motion";

interface NavigationLinkProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  children,
  active = false,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`nav-link hover:text-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${active ? "nav-link-active" : ""}`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
};

export default NavigationLink; 