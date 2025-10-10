import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

const DashboardCard = ({
  title,
  icon: Icon,
  value,
  trendPercent,
  trendUp = true,
  className = "",
  icon_bg = "bg-blue-500",
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative flex flex-col justify-between p-4 rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {/* Top Row */}
      <div className="flex items-center gap-3">
        <div
          className={`${icon_bg} flex items-center justify-center rounded-xl w-10 h-10 shadow-sm`}
        >
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-600 tracking-tight">
            {title}
          </h4>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-slate-100 my-3" />

      {/* Trend Section */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trendUp ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trendPercent)}%</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">vs last week</span>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
