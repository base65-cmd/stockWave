// components/vendor/SmallVendorCard.jsx
import { UserRound, Mail, Phone, Star, MapPin } from "lucide-react";
import clsx from "clsx";

const SmallVendorCard = ({
  vendor,
  onClick, // e.g. open profile
  className, // allow outer overrides
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full bg-white p-3 rounded-xl border border-gray-200 shadow hover:shadow-md transition",
        className
      )}
    >
      {/* Avatar */}
      <div className="p-2 bg-blue-50 rounded-full">
        <UserRound className="w-6 h-6 text-blue-600" />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1 text-left">
        {/* Name & Rating */}
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold text-gray-800 truncate">
            {vendor.name}
          </h4>
          <span
            className={clsx(
              "flex items-center text-xs font-medium",
              vendor.supply_rating >= 4
                ? "text-green-600"
                : vendor.supply_rating >= 3
                ? "text-yellow-500"
                : "text-red-500"
            )}
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            {vendor.supply_rating.toFixed(1)}
          </span>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {vendor.contact_persons[0]?.email && (
            <>
              <Mail className="w-4 h-4" />
              <span className="truncate">
                {vendor.contact_persons[0].email}
              </span>
            </>
          )}
          {vendor.contact_persons[0]?.phone && (
            <>
              <Phone className="w-4 h-4" />
              <span>{vendor.contact_persons[0].phone}</span>
            </>
          )}
        </div>

        {/* Address + Status */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{vendor.address}</span>
          </div>
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-white text-[10px] font-semibold",
              vendor.is_active ? "bg-green-600" : "bg-red-500"
            )}
          >
            {vendor.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </button>
  );
};

export default SmallVendorCard;
