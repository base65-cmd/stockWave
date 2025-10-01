import { ConfigProvider, Input } from "antd";
import { useState, useEffect } from "react";

const AutocompleteInput = ({
  inventoryItems = [],
  onSelect,
  value,
  setValue,
  label,
  className,
  className2,
  disabled = false,
  suppressSuggestions = false,
  placeholder = "Search item...",
}) => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    const inputText = typeof value === "string" ? value.trim() : "";
    if (inputText === "" || !hasTyped || suppressSuggestions) {
      setFilteredItems([]);
      setShowSuggestions(false); // <-- this ensures it closes
      return;
    }

    const filtered = inventoryItems
      .filter((item) =>
        `${item.name} ${item.part_number}`
          .toLowerCase()
          .includes(value.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 results

    setFilteredItems(filtered);

    setShowSuggestions(true);
  }, [value, inventoryItems, hasTyped]);

  const handleSelect = (selectedItem) => {
    // setValue(`${selectedItem.name} ${selectedItem.part_number}`);
    setValue(selectedItem);
    setShowSuggestions(false);
    if (onSelect) onSelect(selectedItem.item_id); // pass item_id back
  };

  return (
    <div className={`relative ${className2}`}>
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <ConfigProvider
        theme={{
          token: {
            // colorPrimary: "#E5E7EB", // Tailwind gray-200
            controlOutline: "transparent", // removes glow effect
            controlPaddingHorizontal: 6,
            colorBgContainerHover: "transparent",
            // controlHeight: 37.33,
            colorBorder: "transparent",
          },
        }}
      >
        <Input
          disabled={disabled}
          type="text"
          className={`${className} ${
            disabled && "bg-gray-100!"
          } rounded px-3! py-2! text-sm`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setHasTyped(true); // user has now interacted
          }}
          onFocus={() => {
            if (value && hasTyped) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder={placeholder}
        />
      </ConfigProvider>
      {showSuggestions && filteredItems.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow text-sm max-h-48 overflow-y-auto menu categories">
          {filteredItems.map((item) => (
            <li
              key={item.stock_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleSelect(item)}
            >
              {item.name} {item.part_number}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default AutocompleteInput;
