import { TrendingDown, TrendingUp } from "lucide-react";

const DashboardCard = ({
  title,
  icon: Icon,
  value,
  trendPercent,
  trendUp = true,
  className,
  icon_bg,
}) => {
  return (
    <div
      className={`flex flex-col w-full p-3 h-full
        ${className}`}
    >
      <div className="h-[60%]">
        <div className="flex items-center">
          <div className={`${icon_bg} p-3 mr-4 rounded shadow`}>
            {Icon && <Icon className="w-5 h-5 text-white" />}
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <div className="font-bold text-gray-900">{value}</div>
          </div>
        </div>
      </div>
      <hr className="text-gray-200 p-1" />
      <div className="flex items-center h-[40%] justify-between text-xs text-gray-500">
        <span className={trendUp ? "text-green-500" : "text-red-500"}>
          {trendUp ? "▲" : "▼"} {trendPercent}% last week
        </span>

        {/* Mini visual trend */}
        <div className="flex gap-1 h-4 ">
          {trendUp ? (
            <TrendingUp className="text-green-500" strokeWidth={1} />
          ) : (
            <TrendingDown className="text-red-500" strokeWidth={1} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
