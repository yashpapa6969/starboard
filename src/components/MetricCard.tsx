import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  className = "",
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`metric-card hover:bg-blue-50/50 hover:shadow-md hover:border-blue-100 ${className}`}
    >
      {icon && (
        <div className="metric-icon">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <div className="text-sm text-zinc-500">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-base font-medium text-zinc-900">{value}</div>
          {trend && (
            <div
              className={`text-xs flex items-center ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard; 