import { Ship } from "lucide-react";

const statusColors = {
  Sailing: "bg-blue-100 text-blue-700",
  Docked: "bg-green-100 text-green-700",
  Delayed: "bg-yellow-100 text-yellow-700",
  Maintenance: "bg-gray-200 text-gray-800",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const VesselCard = ({ vessel, onClick }) => (
  <div
    className="bg-white shadow-md rounded-xl p-4 w-full hover:shadow-lg transition cursor-pointer"
    onClick={() => onClick(vessel)}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-2">
      <Ship className="text-blue-600 w-5 h-5" />
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          statusColors[vessel.status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {vessel.status || "Unknown"}
      </span>
    </div>

    {/* Vessel Name */}
    <h3 className="text-base font-semibold text-gray-800 truncate">
      MV {vessel.vessel_name}
    </h3>

    {/* Grid Info */}
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
      <div>
        <span className="font-medium">IMO:</span> {vessel.imo || "-"}
      </div>
      <div>
        <span className="font-medium">Last Port:</span>{" "}
        {vessel.last_port || "-"}
      </div>
      <div>
        <span className="font-medium">ETD:</span> {formatDate(vessel.etd)}
      </div>
      <div>
        <span className="font-medium">ETA:</span> {formatDate(vessel.eta)}
      </div>
    </div>

    <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">
      View Details
    </button>
  </div>
);

export default VesselCard;
