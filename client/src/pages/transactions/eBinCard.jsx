import { useState, useMemo, useEffect } from "react";
import { Star, BarChart, SearchX } from "lucide-react";
import PageHeader from "../../common/components/PageHeader";
import TableContainer from "../../common/TableContainer";
import { useDispatchStore } from "../../stores/useDispatchStore";
import { useInventoryStore } from "../../stores/useInventoryStore";
import AutocompleteInput from "../../common/components/AutoCompleteInput";
import { motion } from "framer-motion";
import DispatchedItemsModal from "../../common/components/DispatchedItems";

const EBincard = () => {
  const [showPopular, setShowPopular] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [inputValue, setInputValue] = useState({ name: "", part_number: "" });
  const [quantity, setQuantity] = useState({});
  const [allDispatchRecords, setAllDispatchRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [allInventory, setAllInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [rawInventory, setRawInventory] = useState();
  const [dispatchedItems, setDispatchedItems] = useState([]);
  const [dispatchRecord, setDispatchRecord] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [inventoryName, setInventoryName] = useState(null);
  const [vesselDepartment, setVesselDepartment] = useState([]);
  const [popularDispatch, setPopularDispatch] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    vesselDept: "",
  });

  const {
    fetchAllDispatchedItems,
    fetchDispatchRecordById,
    fetchDispatchedItemById,
    fetchDepartments,
    fetchVessels,
    fetchFrequentlyDispatchedItems,
  } = useDispatchStore();
  const { fetchAllInventory } = useInventoryStore();
  const viewMode = true;

  // Fetch all data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dispatchData = await fetchAllDispatchedItems();

        const records = dispatchData.map((entry) => ({
          itemId: entry.item_id,
          stockId: entry.stock_id,
          name: entry.name,
          destination_name: entry.destination_name,
          part_number: entry.part_number,
          type: "out",
          quantity: entry.quantity,
          date: new Date(entry.dispatch_date).toLocaleDateString("en-GB"),
          dispatch_id: entry.dispatch_id,
          store: entry.location_name,
        }));

        setAllDispatchRecords(records);

        const inventory = await fetchAllInventory();
        const uniqueInventory = inventory.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.item_id === item.item_id)
        );

        setRawInventory(inventory);
        setAllInventory(uniqueInventory);
        const vesselsRes = await fetchVessels();
        const departmentsRes = await fetchDepartments();

        const vessels = vesselsRes.map((vessel) => ({
          id: `v${vessel.vessel_id}`,
          name: vessel.vessel_name,
        }));

        const departments = departmentsRes.map((department) => ({
          id: `d${department.department_id}`,
          name: department.department_name,
        }));

        setVesselDepartment([...vessels, ...departments]);
      } catch (error) {
        console.error("Failed to fetch dispatched items:", error);
      }
    };

    fetchData();
  }, []);

  // Triggered on user search
  const handleSearch = async (id) => {
    setSearchTriggered(true);
    setIsLoading(true);

    // Simulated delay (1.5s)
    setTimeout(() => {
      if (id === null) {
        setFilteredRecords([]);
        setIsLoading(false);
        return;
      }

      const currentItem = rawInventory.filter((inv) => inv.item_id === id);
      let currentQuantity = 0;
      currentItem.forEach((item) => {
        currentQuantity += item.quantity;
      });
      setCurrentQuantity(currentQuantity);

      const relatedRecords = allDispatchRecords
        .filter((record) => record.itemId === id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      let dispatchSum = 0;
      relatedRecords.forEach((record) => {
        dispatchSum += record.quantity;
      });

      const startingBalance = currentQuantity + dispatchSum;
      const startingRecord = {
        name: currentItem[0]?.name,
        part_number: currentItem[0]?.part_number,
        destination_name: "Opening Balance",
        type: "in",
        quantity: startingBalance,
        balance: startingBalance,
      };

      let balance = startingBalance;
      const withBalance = relatedRecords.map((record) => {
        balance -= record.quantity;
        return { ...record, balance };
      });

      const filteredDisplay = withBalance.filter((record) => {
        const matchesStartDate = filters.startDate
          ? new Date(record.date) >= new Date(filters.startDate)
          : true;
        const matchesEndDate = filters.endDate
          ? new Date(record.date) <= new Date(filters.endDate)
          : true;
        const matchesVesselDept = filters.vesselDept
          ? record.destination_name === filters.vesselDept
          : true;
        return matchesStartDate && matchesEndDate && matchesVesselDept;
      });

      const onlyItemFilterApplied =
        !filters.startDate && !filters.endDate && !filters.vesselDept;

      const finalRecords = onlyItemFilterApplied
        ? [startingRecord, ...filteredDisplay]
        : filteredDisplay;

      setFilteredRecords(finalRecords);
      setIsLoading(false);

      const name = allInventory.find((i) => i.item_id === id)?.name;
      setInventoryName(name);
      setInputValue("");
      setSearchId(null);
      setFilters({ startDate: "", endDate: "", vesselDept: "" });
    }, 1500); // ← adjust the delay as needed
  };

  const columns = useMemo(
    () => [
      {
        header: "Item Description",
        accessorKey: "name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const name = row.original.name;
          const dispatchId = row.original.dispatch_id;
          const rowIndex = row.index;
          const stockId = row.original.stockId;
          const destinationName = row.original.destination_name;

          // Disable interaction for the first row (index 0)
          const isOpeningBalance = destinationName === "Opening Balance";

          const handleClick = async () => {
            const dispatchRecordData = await fetchDispatchRecordById(
              dispatchId
            );
            const dispatchedItemsData = await fetchDispatchedItemById(
              dispatchId
            );
            setSelectedItemId(stockId);
            setDispatchedItems(dispatchedItemsData);
            setDispatchRecord(dispatchRecordData);
          };

          return (
            <span
              className={
                isOpeningBalance
                  ? "" // No hover/click
                  : " hover:underline cursor-pointer"
              }
              onClick={!isOpeningBalance ? handleClick : undefined}
            >
              {name}
            </span>
          );
        },
      },

      {
        header: "Part Number",
        accessorKey: "part_number",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: () => <span className="text-green-600">In</span>,
        id: "in_quantity",
        cell: ({ row }) =>
          row.original.type === "in" ? (
            <span className="text-green-600">{row.original.quantity}</span>
          ) : (
            ""
          ),
      },
      {
        header: () => <span className="text-red-600">Out</span>,
        id: "out_quantity",
        cell: ({ row }) =>
          row.original.type === "out" ? (
            <span className="text-red-600">{row.original.quantity}</span>
          ) : (
            ""
          ),
      },
      {
        header: "Cumulative",
        accessorKey: "balance",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Recipient",
        accessorKey: "destination_name",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Store",
        accessorKey: "store",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Date",
        accessorKey: "date",
        enableSorting: true,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const dispatchedItemsColumns = useMemo(() => [
    {
      header: "S/N",
      accessorKey: "id",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const rowIndex = row.index;

        return <span>{rowIndex + 1}</span>;
      },
    },
    {
      header: "Item Description",
      accessorKey: "name",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const name = row.original.name;

        return <span className="truncate block max-w-[180px]">{name}</span>;
      },
    },
    {
      header: "Part Number",
      accessorKey: "part_number",
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const stockId = row.original?.stock_id;

        if (viewMode) {
          return (
            <span className="text-center block max-w-[50px]">
              {row.original.quantity || 0}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1 bg-[#e6eaed] flex items-center justify-around select-none">
              <MinusCircle
                className={`w-4 h-4 hover:text-blue-500 cursor-pointer ${
                  viewMode && "hidden"
                }`}
                disabled={viewMode}
                onClick={() => {
                  if (viewMode) return;
                }}
              />

              <input
                className="w-12 text-center border rounded border-gray-300 text-sm"
                value={quantity[stockId] ?? ""}
                disabled={viewMode}
              />

              <PlusCircle
                className={`w-4 h-4 hover:text-blue-500 cursor-pointer ${
                  viewMode && "hidden"
                }`}
                disabled={viewMode}
                onClick={() => {
                  if (viewMode) return;
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Location",
      accessorKey: "location_name",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const currentLocationName = row.original.location_name;

        if (viewMode) {
          return (
            <span className="truncate block max-w-[180px]">
              {currentLocationName}
            </span>
          );
        }

        return (
          <select
            defaultValue={currentLocationName}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-fit focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={viewMode}
          >
            <option value="Port Harcourt">Port Harcourt</option>
            <option value="Onne">Onne</option>
          </select>
        );
      },
    },

    {
      header: "Remarks",
      accessorKey: "remarks",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row, getValue }) => {
        const value = getValue();

        return (
          <input
            type="text"
            defaultValue={value}
            className="max-w-20 truncate border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => {
              row.original.remarks = e.target.value;
            }}
          />
        );
      },
    },
  ]);

  const handleSelect = (itemId) => {
    setSearchId(itemId);
  };

  // TODO: Add Link to Shit
  return (
    <>
      <PageHeader title={"e-BinCard"} />
      <div className="m-3 space-y-6">
        {/* Filters */}
        <div className="bg-white p-5 rounded-lg shadow space-x-6 space-y-4 md:space-y-0 md:flex md:items-end md:justify-between">
          <div className="space-y-2 w-full md:w-1/4">
            <label className="text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2 w-full md:w-1/4">
            <label className="text-sm text-gray-600">End Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          <AutocompleteInput
            inventoryItems={allInventory}
            onSelect={handleSelect}
            setValue={setInputValue}
            value={
              inputValue && typeof inputValue === "object"
                ? `${inputValue.name} ${inputValue.part_number}`
                : inputValue
            }
            label={"Item"}
            className={"w-full border! border-black!"}
            className2={"w-full md:w-1/4"}
          />
          <div className="space-y-2 w-full md:w-1/4">
            <label className="text-sm text-gray-600">Vessel/Dept</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={filters.vesselDept}
              onChange={(e) =>
                setFilters({ ...filters, vesselDept: e.target.value })
              }
            >
              <option value="">Select</option>
              {vesselDepartment.map((vd) => (
                <option key={vd.id} value={vd.name}>
                  {vd.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleSearch(searchId)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Search
          </button>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                const limit = 12;
                const data = await fetchFrequentlyDispatchedItems(limit);
                setPopularDispatch(data);
                setShowStats(false);
                setShowPopular(!showPopular);
              }}
              className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded hover:bg-yellow-200"
            >
              <Star size={16} />
              Popular Items
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded hover:bg-green-200"
            >
              <BarChart size={16} />
              View Stats
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="bg-white p-5 rounded-lg shadow border border-gray-200"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-lg font-semibold text-gray-800 mb-3"
            >
              Usage Stats
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-sm text-gray-600"
            >
              Graph/data placeholder here...
            </motion.p>
          </motion.div>
        )}

        {/* Table */}
        {searchTriggered && (
          <div className="px-3 py-4 rounded bg-white min-h-[200px]">
            {isLoading ? (
              // Gradient shimmer skeleton loader
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2-3 animate-pulse">
                  {/* Simulated Title Skeleton */}
                  <div className="h-7 md:h-10 w-80 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"></div>

                  {/* Simulated Quantity Badge Skeleton */}
                  <div className="h-10 w-60 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-lg"></div>
                </div>

                {/* Table Header Mock */}
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="h-6 rounded skeleton" />
                  ))}
                </div>

                {/* Table Rows Mock */}
                <div className="space-y-4 mt-4">
                  {Array.from({ length: 7 }).map((_, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-7 gap-4">
                      {Array.from({ length: 7 }).map((_, colIdx) => (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className="h-4 rounded skeleton"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredRecords.length > 0 ? (
              // Motion wrapper for Table on success
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight leading-snug">
                    {inventoryName}
                  </h1>

                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    Quantity on Hand:{" "}
                    <span className="ml-1 font-bold">{currentQuantity}</span>
                  </div>
                </div>
                <TableContainer
                  isPagination={true}
                  isSelect={false}
                  isGlobalFilter={false}
                  columns={columns || []}
                  data={filteredRecords || []}
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
            ) : (
              // No Results UI
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-center text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SearchX className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No records found</p>
                <p className="text-sm mt-1 text-gray-400">
                  Try adjusting your filters.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Popular Items Modal Placeholder */}
        {showPopular && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white p-6 rounded-lg shadow-xl w-[95%] max-w-3xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Most Dispatched Inventory
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {popularDispatch.map((dispatch) => (
                  <button
                    key={dispatch.item_id}
                    onClick={() => {
                      setSearchId(dispatch.item_id);
                      setShowPopular(false);
                      handleSearch(dispatch.item_id);
                    }}
                    className="bg-gray-100 hover:bg-blue-100 cursor-pointer duration-150 transition-colors w-full text-left rounded-lg p-4 shadow border border-gray-200 hover:border-blue-300"
                  >
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
                      {dispatch.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      Part Number: {dispatch.part_number}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowPopular(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Show Dispatch Model */}
        {dispatchedItems.length > 0 && (
          <DispatchedItemsModal
            stock_id={selectedItemId}
            tableContext="dispatch-modal"
            dispatchedItems={dispatchedItems}
            dispatchRecords={dispatchRecord}
            index={0}
            viewMode={viewMode}
            dispatchedItemsColumns={dispatchedItemsColumns}
            setDispatchedItems={setDispatchedItems}
            setSelectedItemId={setSelectedItemId}
          />
        )}
      </div>
    </>
  );
};

export default EBincard;
