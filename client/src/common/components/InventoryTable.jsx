import React, { useEffect, useState, useMemo } from "react";
import TableContainer from "../TableContainer";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { Link } from "react-router-dom";
import DeleteConfirmation from "./DeleteConfirmation";
import { useAuthStore } from "../../stores/useAuthStore";

const InventoryTable = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const inventory = useInventoryStore((state) => state.inventory) || [];
  const deleteInventory = useInventoryStore((state) => state.deleteInventory);
  const fetchAllInventory = useInventoryStore(
    (state) => state.fetchAllInventory
  );

  const { role } = useAuthStore();
  useEffect(() => {
    fetchAllInventory();
  }, []);

  useEffect(() => {}, [inventory]);

  const confirmDelete = (rowIndex) => {
    setRowToDelete(rowIndex);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const itemToDelete = inventory[rowToDelete];
    const stockId = itemToDelete?.stock_id;
    await deleteInventory(stockId);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRowToDelete(null);
  };

  const partNumberCountMap = useMemo(() => {
    return Array.isArray(inventory)
      ? inventory.reduce((acc, item) => {
          acc[item.part_number] = (acc[item.part_number] || 0) + 1;
          return acc;
        }, {})
      : {};
  }, [inventory]);

  const columns = React.useMemo(
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
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const stockId = row.original?.stock_id;
          const name = row.original.name;
          const partNumber = row.original.part_number;
          const isMultiple = partNumberCountMap[partNumber] > 1;

          return (
            <Link
              to={`/inventory/${stockId}/view`}
              className="flex items-center gap-2 max-w-[200px]"
            >
              <span
                className="truncate overflow-hidden whitespace-nowrap text-ellipsis block hover:underline"
                title={name}
              >
                {name}
              </span>
              {isMultiple && (
                <span className="relative group/tooltip cursor-pointer shrink-0">
                  📍
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none z-10">
                    Available in multiple locations
                  </div>
                </span>
              )}
            </Link>
          );
        },
      },

      {
        header: "Part Number",
        accessorKey: "part_number",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Location",
        accessorKey: "location",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Category",
        accessorKey: "category",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Last Updated",
        accessorKey: "last_updated",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue }) => {
          const rawDate = getValue();
          const formatted = new Date(rawDate).toLocaleString("en-US", {
            year: "numeric",
            month: "short", // "Apr"
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return formatted;
        },
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const stockId = row.original?.stock_id;
          return (
            <ul className="flex items-center justify-center gap-2">
              <li>
                <Link
                  to={`/inventory/${stockId}/view`}
                  className="group/action flex items-center justify-center p-2 rounded-lg border border-gray-400 hover:bg-gray-400 transition-all duration-500 cursor-pointer"
                >
                  <svg
                    className="fill-black group-hover/action:fill-gray-900 transition-colors duration-300"
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#000"
                  >
                    <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                  </svg>
                </Link>
              </li>
              {role === "admin" && (
                <>
                  <li>
                    <Link
                      to={`/inventory/${stockId}/edit`}
                      className="group/action flex items-center justify-center p-2 rounded-lg border border-gray-400 hover:bg-gray-400 transition-all duration-500 cursor-pointer"
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
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => confirmDelete(row.index)}
                      className="group/action flex items-center justify-center p-2 rounded-lg border border-gray-400 hover:bg-red-500 hover:border-red-500 transition-all duration-500 cursor-pointer"
                    >
                      <svg
                        className="fill-black group-hover/action:fill-white transition-colors duration-300"
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#000"
                      >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                      </svg>
                    </button>
                  </li>
                </>
              )}
            </ul>
          );
        },
      },
    ],
    [partNumberCountMap]
  );

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-body">
          <TableContainer
            isPagination={true}
            isSelect={true}
            isGlobalFilter={true}
            columns={columns || []}
            data={inventory || []}
            customPageSize={10}
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
          <DeleteConfirmation
            show={showDeleteModal}
            onCancel={cancelDelete}
            onConfirm={handleDelete}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default InventoryTable;
