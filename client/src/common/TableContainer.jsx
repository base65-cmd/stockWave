import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Pagination, Select } from "antd";
import LoadingSpinner from "./components/LoadingSpinner2";

// Column Filter
const Filter = ({ column, table }) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ""}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
};

// Global Filter
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

const TableContainer = ({
  columns,
  data,
  tableclassName,
  theadclassName,
  divclassName,
  trclassName,
  thclassName,
  tdclassName,
  tbodyclassName,
  isTfoot,
  isSelect,
  isPagination,
  customPageSize,
  isGlobalFilter,
  PaginationClassName,
  SearchPlaceholder,
  highlightedId,
  context,
  isLoading = false,
  noDataMessage = "No data available",
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getFooterGroups,
    getRowModel,
    getPageOptions,
    setPageIndex,
    setPageSize,
    getState,
    getCanPreviousPage,
    getCanNextPage,
    nextPage,
    previousPage,
  } = table;

  const totalItems = data.length;
  const pageSize = getState().pagination.pageSize;
  const pageIndex = getState().pagination.pageIndex;

  const pageEnd =
    (pageIndex + 1) * pageSize > totalItems
      ? totalItems
      : (pageIndex + 1) * pageSize;

  useEffect(() => {
    Number(customPageSize) && setPageSize(Number(customPageSize));
  }, [customPageSize, setPageSize]);

  // 🧩 CONDITIONAL RENDERING SECTION
  if (isLoading) {
    return (
      <div className="flex flex-1 h-[calc(100vh-164px)] justify-center items-center py-10">
        <div className="flex items-center justify-center space-x-2">
          {/* <div
            className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div> */}
        </div>
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex h-105 justify-center items-center py-10 text-gray-500">
        {noDataMessage}
      </div>
    );
  }

  return (
    <Fragment>
      <div className="grid grid-cols-12 lg:grid-cols-12 gap-3 px-4 pb-1">
        {isSelect && (
          <div className="self-center col-span-12 lg:col-span-6">
            <label className="flex gap-2 items-center">
              Show
              <Select
                className=""
                onChange={(value) => setPageSize(value)}
                defaultValue={10}
                options={[
                  { value: 10, label: 10 },
                  { value: 25, label: 25 },
                  { value: 50, label: 50 },
                  { value: 100, label: 100 },
                ]}
              ></Select>
              entries
            </label>
          </div>
        )}

        <div className="self-center max-[450px]:col-span-12 max-[550px]:col-span-8 max-[800px]:col-span-6 col-span-5 lg:col-span-6 lg:place-self-end">
          {isGlobalFilter && (
            <label className="flex gap-2 items-center">
              Search:
              <DebouncedInput
                value={globalFilter ?? ""}
                onChange={(value) => setGlobalFilter(String(value))}
                className="py-2 px-3 ... ml-1 border border-gray-200 rounded-lg"
                placeholder={SearchPlaceholder}
              />
            </label>
          )}
        </div>
      </div>

      <div className={`categories ${divclassName}`}>
        <table className={tableclassName}>
          <thead className={theadclassName}>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`${header.column.getCanSort()} ${thclassName}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-2 text-xs">
                          {header.column.getIsSorted() === "asc"
                            ? "▲"
                            : header.column.getIsSorted() === "desc"
                            ? "▼"
                            : ""}
                        </span>
                        {header.column.getCanFilter() && (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        )}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className={tbodyclassName}>
            {getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`
                  ${trclassName}
                  ${
                    row.original.stock_id === highlightedId &&
                    context === "dispatch-modal"
                      ? "bg-blue-600 text-white group-hover:!bg-blue-600"
                      : ""
                  } `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={tdclassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {isTfoot && (
            <tfoot>
              {getFooterGroups().map((footer, tfKey) => (
                <tr key={tfKey}>
                  {footer.headers.map((tf, key) => (
                    <th
                      key={key}
                      className="p-3 text-left group-[.bordered]:border ..."
                    >
                      {flexRender(tf.column.columnDef.header, tf.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {isPagination && (
        <div className={PaginationClassName}>
          <div className="mb-4 grow md:mb-0">
            <div className="text-slate-500 dark:text-zink-200">
              Showing <b>{pageEnd}</b> of <b>{data.length}</b> Results
            </div>
          </div>

          <Pagination
            showQuickJumper
            defaultCurrent={1}
            total={data.length}
            showSizeChanger={false}
            pageSize={pageSize}
            onChange={(pageNumber) => setPageIndex(pageNumber - 1)}
          />
        </div>
      )}
    </Fragment>
  );
};

export default TableContainer;
