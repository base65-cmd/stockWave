import { useEffect } from "react";
import { useInventoryStore } from "../../stores/useInventoryStore";

const LocationToggle = ({ locations, value, onChange }) => {
  const isZyra = value === "Zyra";

  return (
    <div className="flex items-center space-x-3">
      <span
        className={`text-sm text-nowrap font-medium ${
          isZyra ? "text-blue-500" : "text-gray-400"
        }`}
      >
        {locations[0]?.location_name}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!isZyra}
          onChange={(e) =>
            onChange(
              e.target.checked
                ? locations[1].location_name
                : locations[0].location_name
            )
          }
        />
        <div
          className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-300 after:content-[''] 
        after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"
        />
      </label>
      <span
        className={`text-sm font-medium ${
          !isZyra ? "text-blue-500" : "text-gray-400"
        }`}
      >
        {locations[1]?.location_name}
      </span>
    </div>
  );
};
export default LocationToggle;
