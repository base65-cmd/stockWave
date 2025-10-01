import {
  UserRound,
  Ellipsis,
  MapPin,
  Box,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import useWindowWidth from "../useWindowWidth";

const VendorCard = ({ vendor, view = "list", displayVendorDetails }) => {
  // const windowWidth = useWindowWidth();
  const isGrid = view === "grid";
  // const [isTruncated, setIsTruncated] = useState(false);
  // const spanRef = useRef(null);

  // useEffect(() => {
  //   const element = spanRef.current;

  //   if (element) {
  //     setIsTruncated(element.scrollWidth > element.clientWidth);
  //     console.log(element.scrollWidth, element.clientWidth);
  //   }
  // }, [vendor, windowWidth]);

  return (
    <div
      key={vendor.vendor_id}
      className={clsx(
        "bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col",
        isGrid
          ? "w-full sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] "
          : "w-full gap-4"
      )}
    >
      {/* Top Section */}
      <div
        className={clsx("relative", {
          "grid grid-cols-[3fr_3fr_2fr_1fr] items-center gap-4": !isGrid,
          "flex flex-col items-start gap-4": isGrid,
        })}
      >
        {/* Name & Contact */}
        <div
          className={clsx(
            "flex items-start md:items-center gap-4 flex-1 w-full",
            { "border-r border-gray-300": !isGrid }
          )}
        >
          <div className="border border-gray-200 rounded-lg p-2">
            <UserRound className="w-6 h-6" />
          </div>
          <div className="flex flex-col w-full min-h-[68px] h-full">
            <Tooltip title={vendor.name}>
              <h2
                className={clsx({
                  "text-lg font-semibold text-gray-800 text-nowrap max-w-[190px] truncate":
                    !isGrid,
                  "text-gray-800 truncate text-wrap line-clamp-2 max-w-[calc(100%-43px)]":
                    isGrid,
                })}
              >
                {vendor.name}
              </h2>
            </Tooltip>
            <span className="text-sm text-gray-500 w-full text-nowrap truncate">
              {vendor.contact_persons[0]?.name ?? "—"}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className={clsx("flex flex-col gap-1 w-full", { " ml-5": !isGrid })}
        >
          {!isGrid && (
            <h3 className="text-xs font-semibold text-gray-500">CONTACTS</h3>
          )}
          <div
            className={clsx({
              "flex flex-col gap-1": isGrid,
              "flex items-center": !isGrid,
            })}
          >
            <div className="relative">
              {/* Email */}
              <span
                className={clsx(
                  !isGrid && "border-r border-gray-400 pr-3",
                  "text-sm text-gray-700 underline flex items-center"
                )}
              >
                {isGrid && <Mail className="mr-2 w-4 h-4 shrink-0" />}
                <span
                  className={clsx({
                    truncate: isGrid,
                    "w-full": isGrid,
                  })}
                >
                  {vendor.email}
                </span>
              </span>
            </div>

            {/* Phone */}
            <span
              className={clsx(
                !isGrid && "ml-3",
                "text-sm underline text-gray-700 flex items-center"
              )}
            >
              {isGrid && <Phone className="mr-2 w-4 h-4 shrink-0" />}
              {vendor.phone}
            </span>
          </div>
        </div>

        <div className="flex w-full gap-4 items-center justify-between">
          {/* Receivables */}
          <div
            className={clsx("flex flex-col gap-1", {
              "items-end": !isGrid,
            })}
          >
            <h3 className="text-xs font-semibold text-gray-500">RECEIVABLES</h3>

            <span className="text-sm font-medium">$1,000.00</span>
          </div>

          {/* Rating */}
          <div
            className={clsx("flex flex-col gap-1", {
              "items-end": !isGrid,
              "items-start": isGrid,
            })}
          >
            {!isGrid && (
              <h3 className="text-xs font-semibold text-gray-500">RATING</h3>
            )}
            <span
              className={clsx("text-sm font-medium flex items-center", {
                "text-green-600": vendor.supply_rating >= 4,
                "text-yellow-500":
                  vendor.supply_rating < 4 && vendor.supply_rating >= 3,
                "text-red-500": vendor.supply_rating < 3,
              })}
            >
              <Star className="mr-1 w-4 h-4 fill-current" />
              {vendor.supply_rating}
            </span>
          </div>
        </div>

        {/* Ellipsis menu */}
        <div
          onClick={displayVendorDetails}
          className="flex w-fit absolute justify-end right-0 z-5 items-end p-2 border border-gray-200 rounded-lg"
        >
          <Ellipsis />
        </div>
      </div>

      {/* Address Section */}
      <div
        className={clsx(
          "bg-gray-100 rounded-lg p-3 mt-2 w-full",
          isGrid ? "flex flex-col gap-2" : "flex items-center justify-between"
        )}
      >
        <div
          className={clsx(
            isGrid ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-4"
          )}
        >
          <div className="flex items-center w-full">
            <MapPin className="w-5 h-5 text-gray-500 mr-1" />
            <Tooltip title={vendor.address}>
              <span className="text-sm text-gray-600 text-nowrap truncate">
                {vendor.address}
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Box className="w-5 h-5 text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">
              {vendor.item_ids.length} product(s)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="text-xs font-semibold text-gray-600">STATUS:</span>
          <span
            className={clsx(
              "rounded-lg px-2 py-1 text-xs font-medium text-white",
              vendor.is_active ? "bg-green-600" : "bg-red-500"
            )}
          >
            {vendor.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
