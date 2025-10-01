import clsx from "clsx";
import {
  Minus,
  Plus,
  Settings,
  Package,
  Droplets,
  Filter,
  Zap,
  Cable,
  CircleDot,
  Landmark,
  Shield,
  Brush,
  FileText,
  Pen,
  Laptop,
  MoreHorizontal,
  Plug,
  HardDrive,
  BatteryCharging,
  Keyboard,
  Monitor,
  Wifi,
  MousePointerClick,
  FileCode2,
} from "lucide-react";
import React from "react";

const categoryIcons = {
  Spares: Settings,
  Consumables: Package,
  Lubricants: Droplets,
  Filters: Filter,
  Pumps: Zap,
  Hoses: Cable,
  Valves: CircleDot,
  Seals: Landmark,
  "Other Spares": Shield,
  "Cleaning Supplies": Brush,
  Stationery: FileText,
  "ICT Supplies": Laptop,
  "Other Consumables": MoreHorizontal,
  Inks: Pen,
  "Cables & Connectors": Plug,
  "Storage Devices": HardDrive,
  "Power Supplies": BatteryCharging,
  "Input Devices": Keyboard,
  "Output Devices": Monitor,
  "Networking Equipment": Wifi,
  "Computer Accessories": MousePointerClick,
  "Software & Licenses": FileCode2,
  "Other ICT Supplies": MoreHorizontal,
};

const ProductCard = React.memo(
  ({
    name,
    part_number,
    on_click,
    icon,
    selected,
    quantity,
    on_remove,
    purchaseOrder = false,
    inventoryGridLayout = false,
  }) => {
    const IconComponent = categoryIcons[icon] || Package;

    return (
      <div
        onClick={!selected ? on_click : undefined}
        className={`flex flex-col border rounded-lg overflow-hidden cursor-pointer relative transition-shadow duration-300 hover:shadow-md ${
          selected ? "border-orange-500" : "border-gray-200"
        }`}
      >
        <div
          className={clsx("bg-gray-100 h-32 flex items-center justify-center", {
            "bg-white": inventoryGridLayout,
          })}
        >
          <IconComponent
            strokeWidth={0.6}
            className="text-gray-500 w-16 h-16"
          />
        </div>
        <div className={clsx("p-2 ", { "bg-gray-300": inventoryGridLayout })}>
          <p className="text-sm text-center truncate">{name}</p>
          <p className="text-sm text-center text-gray-500 truncate">
            {part_number}
          </p>
        </div>
        {purchaseOrder ? (
          ""
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (selected && on_remove) {
                on_remove();
              } else if (on_click) {
                on_click();
              }
            }}
            className={`absolute top-2 right-2 p-0.5 h-5 w-5 rounded-full text-white flex items-center text-lg ${
              selected ? "bg-red-500" : "bg-green-600"
            }`}
          >
            {selected ? <Minus /> : <Plus />}
          </div>
        )}
        {!purchaseOrder && (
          <div
            className={`absolute top-2 left-2 text-[12px] flex justify-center items-center rounded-full h-5 w-5 transition-all duration-200 transform origin-center hover:scale-135 ${
              quantity < 10
                ? "bg-red-500 text-white"
                : quantity < 30
                ? "bg-amber-400 text-black"
                : "bg-green-600 text-white"
            }`}
          >
            <p className="tracking-tighter">{`${quantity}`}</p>
          </div>
        )}
      </div>
    );
  }
);

export default ProductCard;
