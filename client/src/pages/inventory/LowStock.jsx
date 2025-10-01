import { useEffect, useState } from "react";
import PageHeader from "../../common/components/PageHeader";
import TableContainer from "../../common/TableContainer";
import { useMemo } from "react";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";

function LowStock() {
  const [activeStock, setActiveStock] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [render, setRender] = useState(0);
  const [fullInventory, setFullInventory] = useState([]);
  const [inventoryById, setInventoryById] = useState({});
  const [formData, setFormData] = useState({
    user_id: 3,
    min_inventory_level: "",
  });
  const [selectedLocation, setSelectedLocation] = useState("Port Harcourt");
  const { fetchAllInventory, updateInventoryMinimumLevel, fetchInventoryById } =
    useInventoryStore();
  const location = useLocation();
  const outOfStock = location.pathname === "/out-of-stock";

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchAllInventory();
      setFullInventory(result);
      handleLowStock(result);
    };
    fetchData();
    if (outOfStock) {
      setActiveStock(2);
    }
  }, [render]);

  const columns = useMemo(
    () => [
      {
        header: <input type="checkbox" />,
        accessorKey: "select",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          return <input type="checkbox" className="" />;
        },
      },
      {
        header: "Warehouse",
        accessorKey: "location",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Store",
        accessorKey: "shelf",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Item Description",
        accessorKey: "name",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Part Number",
        accessorKey: "part_number",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Category",
        accessorKey: "category",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Qty",
        accessorKey: "quantity",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Qty Alert",
        accessorKey: "min_inventory_level",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const stockId = row.original?.stock_id;
          return (
            <button
              onClick={() => {
                const fetchData = async () => {
                  const result = await fetchInventoryById(stockId);
                  setInventoryById(result);
                  setFormData((prev) => ({
                    ...prev,
                    min_inventory_level: result.min_inventory_level,
                  }));
                };
                fetchData();
              }}
              className="group/action flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-400 transition-all duration-500 cursor-pointer"
            >
              <svg
                className="fill-black group-hover/action:fill-gray-900 transition-colors duration-300"
                xmlns="http://www.w3.org/2000/svg"
                height="18px"
                viewBox="0 -960 960 960"
                width="18px"
                fill="#000"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
              </svg>
            </button>
          );
        },
      },
    ],
    [inventory]
  );

  useEffect(() => {
    handleLowStock();
  }, [activeStock, selectedLocation, fullInventory]);

  function handleLowStock(rawInventory = fullInventory) {
    let result = [];

    if (activeStock === 1) {
      // Low Stock
      result = rawInventory.filter(
        (inv) => inv.quantity <= inv.min_inventory_level && inv.quantity > 0
      );
    } else if (activeStock === 2) {
      // No Stock
      result = rawInventory.filter((inv) => inv.quantity === 0);
    } else {
      // All Stock
      result = [...rawInventory]; // Make a shallow copy
    }

    // Apply location filter
    if (selectedLocation !== "combined") {
      result = result.filter((inv) => inv.location === selectedLocation);
    }

    // Final sort by quantity ascending
    result.sort((a, b) => a.quantity - b.quantity);

    // Set the final filtered and sorted inventory
    setInventory(result);
  }

  return (
    <div>
      <PageHeader title="Low Stock" />
      {Object.keys(inventoryById).length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[0.5px] flex justify-center items-center overflow-y-auto">
          <div className="relative w-[700px] mx-auto p-6 bg-white rounded-3xl shadow-2xl space-y-8 border border-blue-100">
            {/* Close Button */}
            <X
              onClick={() => {
                setInventoryById({});
                setFormData((prev) => ({
                  ...prev,
                  min_inventory_level: "",
                }));
              }}
              className="absolute right-4 top-4 w-6 h-6 text-gray-500 hover:text-red-600 cursor-pointer transition-all duration-150"
            />

            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-blue-700">
                Item Snapshot
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Quick view and adjust alert levels for inventory control.
              </p>
            </div>

            {/* Grid Details Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              {/* Item Description with Tooltip */}
              <div className="relative group bg-gray-50 rounded-xl shadow-inner p-3 border border-gray-200">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Item Description
                </p>
                <p
                  className="font-semibold truncate"
                  title={inventoryById.name || "N/A"}
                >
                  {inventoryById.name || "N/A"}
                </p>
                {/* Optional Custom Tooltip */}
                <div className="absolute top-full mt-2 left-0 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-10 pointer-events-none">
                  {inventoryById.name}
                </div>
              </div>

              {/* Part Number */}
              <div className="bg-gray-50 rounded-xl shadow-inner p-3 border border-gray-200">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Part Number
                </p>
                <p className="font-semibold">
                  {inventoryById.part_number || "N/A"}
                </p>
              </div>

              {/* Quantity */}
              <div className="bg-gray-50 rounded-xl shadow-inner p-3 border border-gray-200">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Quantity in Stock
                </p>
                <p className="font-semibold">
                  {inventoryById.quantity ?? "N/A"}
                </p>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-xl shadow-inner p-3 border border-gray-200">
                <p className="text-xs uppercase text-gray-500 mb-1">Location</p>
                <p className="font-semibold">
                  {inventoryById.location || "N/A"}
                </p>
              </div>
            </div>

            {/* Editable Minimum Alert Input */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Set Minimum Inventory Level (Alert Threshold)
              </label>
              <input
                type="number"
                value={formData.min_inventory_level}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    min_inventory_level: e.target.value,
                  }))
                }
                placeholder="Enter alert threshold"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-gray-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Save Button */}
            <div className="text-right">
              <button
                onClick={async () => {
                  await updateInventoryMinimumLevel(
                    inventoryById.stock_id,
                    formData
                  );
                  setInventoryById({});
                  setRender((prev) => prev + 1);
                }}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-900 shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Alert
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-3">
        <span className="text-sm text-gray-600">Manage your low stocks</span>

        <div className="flex justify-between items-center">
          <div className="space-x-2 mt-3 border border-gray-200 bg-white rounded-lg p-1 shadow">
            <button
              onClick={() => {
                setActiveStock(1);
              }}
              className={`rounded-[6px] px-2 py-[6px] font-semibold text-sm cursor-pointer ${
                activeStock === 1
                  ? " border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              } `}
            >
              Low Stocks
            </button>
            <button
              onClick={() => {
                setActiveStock(2);
              }}
              className={`rounded-[6px] px-2 py-[6px] font-semibold text-sm cursor-pointer ${
                activeStock === 2
                  ? " border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              } `}
            >
              Out of Stocks
            </button>
            <button
              onClick={() => {
                setActiveStock(3);
              }}
              className={`rounded-[6px] px-2 py-[6px] font-semibold text-sm cursor-pointer ${
                activeStock === 3
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              } `}
            >
              All Stocks
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="location"
                value="Port Harcourt"
                checked={selectedLocation === "Port Harcourt"}
                onChange={() => {
                  setSelectedLocation("Port Harcourt");
                  handleLowStock();
                }}
              />
              PH
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="location"
                value="Onne"
                checked={selectedLocation === "Onne"}
                onChange={() => {
                  setSelectedLocation("Onne");
                  handleLowStock();
                }}
              />
              Onne
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="location"
                value="combined"
                checked={selectedLocation === "combined"}
                onChange={() => {
                  setSelectedLocation("combined");
                }}
              />
              Combined
            </label>
          </div>
        </div>
        <motion.div
          key={inventory.length} // 🔁 triggers re-animation when data changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-gray-200 mt-3 py-4 h-full rounded-xl shadow-md"
        >
          <TableContainer
            isPagination={true}
            isSelect={true}
            isGlobalFilter={true}
            columns={columns || []}
            data={inventory || []}
            customPageSize={10}
            divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12"
            tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-y border-slate-200 dark:border-zink-500"
            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 
      transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-100 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
            thclassName={`group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 
      sorting px-4 py-2.5 text-black bg-[#f9fafc] font-semibold text-left dark:text-zink-50 dark:bg-zink-600 
      dark:group-[.bordered]:border-zink-500`}
            tdclassName="py-2 px-4 border-b border-slate-200 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row px-4"
            tbodyclassName={"px-4"}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default LowStock;
