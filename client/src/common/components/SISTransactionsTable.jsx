import React, { useEffect, useState, useMemo } from "react";
import TableContainer from "../TableContainer";
import { Link } from "react-router-dom";
import DeleteConfirmation from "./DeleteConfirmation";
import { useDispatchStore } from "../../stores/useDispatchStore";
import {
  Eye,
  Pencil,
  Trash2,
  FileDown,
  MoreVertical,
  CornerUpLeft,
  Printer,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import NavbarButton from "./NavbarButton";
import IconButton from "./IconButton";

const TransactionsTable = ({
  limit = 10,
  isSelect,
  isGlobal,
  actionButton = true,
  isPagination = true,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [dispatchRecords, setDispatchRecords] = useState([]);
  const {
    fetchAllDispatchRecords,
    fetchDispatchedItemById,
    updateDispatchedItem,
  } = useDispatchStore();
  const [menuPos, setMenuPos] = useState(null); // { x, y, dispatchId } or null
  const [dispatchedItems, setDispatchedItems] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [index, setIndex] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const [formData, setFormData] = useState({
    user_id: 3,
    dispatch: [],
    dispatch_status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDispatchRecords();
        setDispatchRecords(data);
      } catch (error) {
        console.error("Failed to fetch dispatch records:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {}, [dispatchRecords]);

  const confirmDelete = (rowIndex) => {
    setRowToDelete(rowIndex);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".dropdown-menu")) {
        setMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDelete = async () => {
    // console.log("Deleting item at index:", rowToDelete);
    // const itemToDelete = inventory[rowToDelete];
    // const stockId = itemToDelete?.stock_id;
    // await deleteInventory(stockId);
    // setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRowToDelete(null);
  };

  const columns = React.useMemo(() => {
    const cols = [];
    if (actionButton) {
      cols.push({
        header: <input type="checkbox" />,
        accessorKey: "select",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => <input type="checkbox" />,
      });
    }
    cols.push(
      {
        header: "Dispatch ID",
        accessorKey: "dispatch_id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ getValue }) => <span>{`SSL/DR/${getValue()}`}</span>,
      },
      {
        header: "Destination",
        accessorKey: "destination_name", // assumed mapped in your data
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ getValue }) => (
          <span title={getValue()} className="truncate block max-w-[180px]">
            {getValue()}
          </span>
        ),
      },
      {
        header: "Dispatched On",
        accessorKey: "dispatch_date",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const rawDate = getValue();
          return new Date(rawDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        header: "Delivery Status",
        accessorKey: "status",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const status = getValue();

          const badgeClass =
            status === "dispatched"
              ? "bg-blue-600 text-white"
              : status === "cancelled"
              ? "bg-red-600 text-white"
              : status === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600";
          return (
            <div
              className={`font-medium ${badgeClass} w-fit rounded py-1 px-2 shadow`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        },
      },
      {
        header: "Dispatched By",
        accessorKey: "full_name",
        enableSorting: true,
        enableColumnFilter: false,
      }
    );

    if (actionButton) {
      cols.push(
        {
          header: "Notes",
          accessorKey: "notes",
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ getValue }) => {
            const val = getValue();
            return (
              <span className="truncate block max-w-[200px]" title={val}>
                {val}
              </span>
            );
          },
        },
        {
          header: "",
          accessorKey: "actions",
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }) => {
            const dispatchId = row.original?.dispatch_id;

            const handleClick = (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const menuWidth = 192; // ~12rem (48 Tailwind units or w-48)
              const padding = 16;

              let left = rect.right;
              const rightEdge = left + menuWidth;

              // Adjust if menu would go off screen
              if (rightEdge > window.innerWidth - padding) {
                left = window.innerWidth - menuWidth - padding;
              }

              setMenuPos({
                x: left,
                y: rect.bottom + window.scrollY,
                dispatchId,
              });

              setIndex(row.index);
            };

            return (
              <button
                onClick={handleClick}
                className="p-2 rounded-full group/action hover:bg-blue-600 transition duration-300"
              >
                <MoreVertical className="w-5 h-5 group-hover/action:text-white text-gray-600" />
              </button>
            );
          },
        }
      );
    }
    return cols;
  }, []);

  const handleStatusChange = (i, newStatus) => {
    setDispatchRecords((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], status: newStatus };
      return updated;
    });
  };

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
              {quantity[stockId] || row.original.quantity || 0}
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
                  decreaseQuantity(stockId);

                  setFormData((prev) => {
                    const updatedDispatch = prev.dispatch.map((item) => {
                      if (item.stock_id === stockId) {
                        const currentQty =
                          quantity[stockId] || item.quantity || 0;
                        return {
                          ...item,
                          quantity: currentQty > 1 ? currentQty - 1 : 0,
                        };
                      }
                      return item;
                    });
                    return { ...prev, dispatch: updatedDispatch };
                  });
                }}
              />

              <input
                className="w-12 text-center border rounded border-gray-300 text-sm"
                value={quantity[stockId] ?? ""}
                disabled={viewMode}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity((prev) => ({
                    ...prev,
                    [stockId]: e.target.value,
                  }));

                  setFormData((prev) => {
                    const updatedDispatch = prev.dispatch.map((item) => {
                      if (item.stock_id === stockId) {
                        return {
                          ...item,
                          quantity: isNaN(val) ? 0 : val,
                        };
                      }
                      return item;
                    });

                    return { ...prev, dispatch: updatedDispatch };
                  });
                }}
                onBlur={() => {
                  const raw = quantity[stockId];
                  const num = parseInt(raw, 10);
                  if (!isNaN(num) && num > 0) {
                    setQuantity((prev) => ({
                      ...prev,
                      [stockId]: num,
                    }));
                  } else {
                    removeItem(stockId);
                  }
                }}
                style={{
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                  appearance: "textfield",
                }}
              />

              <PlusCircle
                className={`w-4 h-4 hover:text-blue-500 cursor-pointer ${
                  viewMode && "hidden"
                }`}
                disabled={viewMode}
                onClick={() => {
                  if (viewMode) return;
                  increaseQuantity(stockId);

                  setFormData((prev) => {
                    const updatedDispatch = prev.dispatch.map((item) => {
                      if (item.stock_id === stockId) {
                        const currentQty =
                          quantity[stockId] || item.quantity || 0;
                        return {
                          ...item,
                          quantity: currentQty + 1,
                        };
                      }
                      return item;
                    });
                    return { ...prev, dispatch: updatedDispatch };
                  });
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
            onChange={(e) => {
              const newLocationId = e.target.value;
              row.original.location_id = newLocationId;
              row.original.location_name =
                e.target.options[e.target.selectedIndex].text;

              setFormData((prev) => {
                const updatedDispatch = prev.dispatch.map((item) => {
                  if (item.stock_id === row.original.stock_id) {
                    return {
                      ...item,
                      location: e.target.options[e.target.selectedIndex].text,
                    };
                  }
                  return item;
                });
                return { ...prev, dispatch: updatedDispatch };
              });
            }}
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

  const increaseQuantity = (id) => {
    setQuantity((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQuantity = (id) => {
    setQuantity((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const updatedItems = items.filter((item) => item.stock_id !== id);
        setItems(updatedItems);
        const newQty = { ...prev };
        delete newQty[id];
        return newQty;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const viewOrEditDispatch = async () => {
    const data = await fetchDispatchedItemById(menuPos.dispatchId);
    const quantityMap = {};
    data.forEach((item) => {
      quantityMap[item.stock_id] = item.quantity;
    });

    setDispatchedItems(data); // Store full item list
    setQuantity(quantityMap);
    setMenuPos(null);
    setFormData((prev) => ({
      ...prev,
      dispatch: data.map((item) => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        location: item.location_name,
        item_id: item.item_id,
      })),
      dispatch_status: dispatchRecords[index]?.status || "",
    }));
  };

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-body">
          <TableContainer
            isPagination={isPagination}
            isSelect={isSelect}
            isGlobalFilter={isGlobal}
            columns={columns || []}
            data={dispatchRecords || []}
            customPageSize={limit}
            divclassName="my-2 col-span-12 overflow-x-auto categories lg:col-span-12"
            tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-y border-slate-200 dark:border-zink-500"
            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 
            transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-100 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
            thclassName={`group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 
              sorting px-4 py-2.5 text-black bg-[#f9fafc] font-semibold text-left dark:text-zink-50 dark:bg-zink-600 
              dark:group-[.bordered]:border-zink-500`}
            tdclassName={`px-4 ${
              actionButton ? "border-b py-2" : "py-3"
            } border-slate-200 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500`}
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row px-4"
            tbodyclassName={"px-4"}
          />
          <DeleteConfirmation
            show={showDeleteModal}
            onCancel={cancelDelete}
            onConfirm={handleDelete}
          />
          {/* Context Menu for Dispatch Actions */}
          {menuPos && (
            <div
              style={{
                position: "absolute",
                top: menuPos.y,
                left: menuPos.x,
                zIndex: 9999,
              }}
              className="bg-white shadow-xl border rounded-lg py-3 px-3 w-fit text-sm text-gray-700"
            >
              <ul className="flex flex-col gap-2 dropdown-menu">
                <li>
                  <button
                    className="w-full flex items-center gap-2 text-left hover:text-blue-600"
                    onClick={() => {
                      viewOrEditDispatch();
                      setViewMode(false);
                    }}
                  >
                    <Pencil size={16} /> Edit Dispatch
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center gap-2 text-left hover:text-gray-700"
                    onClick={() => {
                      setViewMode(true);
                      viewOrEditDispatch();
                    }}
                  >
                    <Eye size={16} /> View Dispatch
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center gap-2 text-left hover:text-green-600"
                    onClick={() => {
                      downloadPDF(menuPos.dispatchId);
                      setMenuPos(null);
                    }}
                  >
                    <FileDown size={16} /> Download PDF
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center gap-2 text-left hover:text-red-600"
                    onClick={() => {
                      confirmDelete(menuPos.dispatchId);
                      setMenuPos(null);
                    }}
                  >
                    <Trash2 size={16} /> Delete Dispatch
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Dispatched Items Modal */}
          {dispatchedItems.length > 0 && (
            <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[0.5px] flex justify-center overflow-y-auto menu">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg h-fit min-h-[calc(100vh-64px)] shadow-lg w-[calc(100vw-30%)] my-8 animate-slide-up relative"
              >
                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Transactions
                  </h2>
                  <div className="w-fit flex items-center gap-2">
                    <IconButton icon={Printer} />

                    <NavbarButton
                      name="Back"
                      icon={CornerUpLeft}
                      bgColor="bg-blue-600"
                      onClick={() => {
                        setDispatchedItems([]);
                        setQuantity({});
                        setIndex(null);
                      }}
                    />
                  </div>
                </header>
                <div className="flex items-center px-5 mt-2 gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Ref Number:
                  </label>
                  <input
                    disabled={viewMode}
                    type="text"
                    value={`SSL/DR/${dispatchRecords[0]?.dispatch_id}`}
                    placeholder="Enter ref number"
                    className="border-0 border-b-1 border-gray-300 focus:border-blue-600 focus:outline-none text-sm px-1 py-1 transition duration-300 w-fit"
                  />
                </div>

                {/* Delivery Information */}
                <div className="bg-white border mb-1 border-gray-200 rounded-lg px-6 py-6 mx-6 mt-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Delivery Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">
                        Driver Name
                      </label>
                      <input
                        disabled={viewMode}
                        type="text"
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter driver's name"
                        defaultValue="John Doe"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">
                        Vehicle
                      </label>
                      <input
                        disabled={viewMode}
                        type="text"
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter vehicle or plate number"
                        defaultValue="Truck No. 4578AB"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">
                        Dispatched By
                      </label>
                      <input
                        disabled={viewMode}
                        type="text"
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter dispatch user's name"
                        defaultValue="Wesley Adrian"
                      />
                    </div>
                  </div>
                </div>
                {/* Top Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6 bg-white">
                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 font-medium">
                      Status
                    </label>
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

                  {/* Destination */}
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

                  {/* Dispatch Date */}
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

                {/* Table Section */}
                <div className="px-5 pb-5 mb-13">
                  <TableContainer
                    isPagination={false}
                    isSelect={isSelect}
                    isGlobalFilter={isGlobal}
                    columns={dispatchedItemsColumns || []}
                    data={dispatchedItems || []}
                    customPageSize={dispatchedItems.length}
                    divclassName="my-2 col-span-12 overflow-x-auto categories lg:col-span-12"
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
                </div>

                {/* Footer Buttons */}
                {!viewMode && (
                  <div className="absolute bottom-5 right-5 flex justify-end gap-3">
                    <button
                      type="reset"
                      className="border border-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        setDispatchedItems([]);
                        setQuantity({});
                        setIndex(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={async () => {
                        const dispatchId = dispatchRecords[index]?.dispatch_id;
                        await updateDispatchedItem(dispatchId, formData);
                        setDispatchedItems([]);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TransactionsTable;
