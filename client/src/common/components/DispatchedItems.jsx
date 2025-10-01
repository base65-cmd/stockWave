import { motion } from "framer-motion";
import TableContainer from "../TableContainer";
import NavbarButton from "./NavbarButton";
import IconButton from "./IconButton";
import { CornerUpLeft, Printer } from "lucide-react";

const DispatchedItemsModal = ({
  dispatchedItems = [],
  index = null,
  dispatchRecords = [],
  viewMode = false,
  setDispatchedItems,
  handleStatusChange,
  dispatchedItemsColumns,
  setFormData,
  setSelectedItemId,
  tableContext,
  stock_id,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[0.5px] flex justify-center overflow-y-auto menu">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg h-fit min-h-[calc(100vh-64px)] shadow-lg w-[calc(100vw-30%)] my-8 animate-slide-up relative"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
          <div className="w-fit flex items-center gap-2">
            <IconButton icon={Printer} />
            <button
              onClick={() => {
                setDispatchedItems([]);
                setSelectedItemId(null);
                // setQuantity({});
                // setIndex(null);
              }}
            >
              <NavbarButton
                name="Back"
                icon={CornerUpLeft}
                bgColor="bg-blue-600"
                onClick={() => {
                  setDispatchedItems([]);
                  setSelectedItemId(null);
                  // setQuantity({});
                  // setIndex(null);
                }}
              />
            </button>
          </div>
        </header>

        <div className="flex items-center px-5 mt-2 gap-1">
          <label className="text-sm font-medium text-gray-600">
            Ref Number:
          </label>
          <input
            disabled={viewMode}
            type="text"
            placeholder="Enter ref number"
            value={`SSL/DR/${dispatchRecords[0]?.dispatch_id}`}
            className="border-0 border-b-1 border-gray-300 focus:border-blue-600 focus:outline-none text-sm px-1 py-1 transition duration-300 w-20"
          />
        </div>

        <div className="bg-white border mb-1 border-gray-200 rounded-lg px-6 py-6 mx-6 mt-2 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Delivery Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Driver Name", value: "John Doe" },
              { label: "Vehicle", value: "Truck No. 4578AB" },
              { label: "Dispatched By", value: "Wesley Adrian" },
            ].map(({ label, value }, i) => (
              <div className="flex flex-col" key={i}>
                <label className="text-sm text-gray-600 mb-1">{label}</label>
                <input
                  disabled={viewMode}
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  defaultValue={value}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6 bg-white">
          <div className="space-y-1">
            <label className="text-sm text-gray-600 font-medium">Status</label>
            <select
              value={dispatchRecords[index]?.status || ""}
              disabled={viewMode}
              onChange={(e) => {
                handleStatusChange(index, e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  dispatch_status: e.target.value,
                }));
              }}
              className={`w-full px-3 py-2 rounded border text-sm font-medium focus:outline-none transition
                    ${
                      dispatchRecords[index]?.status === "dispatched"
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : dispatchRecords[index]?.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : dispatchRecords[index]?.status === "cancelled"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
            >
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600 font-medium">
              Destination
            </label>
            <input
              type="text"
              readOnly
              value={dispatchedItems[index]?.destination_name}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600 font-medium">
              Dispatch Date
            </label>
            <input
              disabled={viewMode}
              type="date"
              defaultValue={
                dispatchRecords[index]?.dispatch_date
                  ? new Date(dispatchRecords[index].dispatch_date)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="px-5 pb-5 mb-13">
          <TableContainer
            highlightedId={stock_id}
            context={tableContext}
            isPagination={false}
            isSelect={false}
            isGlobalFilter={false}
            columns={dispatchedItemsColumns || []}
            data={dispatchedItems || []}
            customPageSize={dispatchedItems.length}
            divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12"
            tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-y border-slate-200 dark:border-zink-500"
            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 
              transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-100 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
            thclassName="group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 
              sorting px-4 py-2.5 text-black bg-[#f9fafc] font-semibold text-left dark:text-zink-50 dark:bg-zink-600 
              dark:group-[.bordered]:border-zink-500"
            tdclassName="py-2 px-4 border-b border-slate-200 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row px-4"
            tbodyclassName={"px-4"}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default DispatchedItemsModal;
