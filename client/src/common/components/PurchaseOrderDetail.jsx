import { Card } from "antd";
import { Calendar, User, Truck, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import TableContainer from "../TableContainer";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function PurchaseOrderDetail({ order, items, exit }) {
  if (!order) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading purchase order...
      </div>
    );
  }

  const columns = useMemo(
    () => [
      {
        header: "Item",
        accessorKey: "item_name",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {row.original.item_name}
          </span>
        ),
      },
      {
        header: "Part Number",
        accessorKey: "part_number",
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        header: "Ordered Qty",
        accessorKey: "quantity_ordered",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <span className="text-blue-600">{row.original.quantity_ordered}</span>
        ),
      },
      {
        header: "Received Qty",
        accessorKey: "quantity_received",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const qty =
            Array.isArray(row.original.quantity_received) &&
            row.original.quantity_received.length > 0
              ? row.original.quantity_received.reduce(
                  (sum, entry) => sum + (entry.quantity || 0),
                  0
                )
              : 0;
          return <span className="text-green-600">{qty}</span>;
        },
      },
      {
        header: "Unit Price",
        accessorKey: "unit_price",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <span>
            {order.currency}{" "}
            {Number(row.original.unit_price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        header: "Expected Arrival",
        accessorKey: "expected_arrival_date",
        enableColumnFilter: false,
        cell: ({ row }) =>
          row.original.expected_arrival_date ? (
            new Date(row.original.expected_arrival_date).toLocaleDateString()
          ) : (
            <span className="text-gray-400">Not set</span>
          ),
      },
      {
        header: "Location",
        accessorKey: "location_name",
        enableColumnFilter: false,
      },
    ],
    []
  );

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "NGN", name: "Naira", symbol: "₦" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CAD", name: "Canadian Dollar", symbol: "$" },
    { code: "AUD", name: "Australian Dollar", symbol: "$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[0.5px] flex justify-center overflow-y-auto menu">
      {/* Background blur overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 rounded-lg p-6 h-fit min-h-[calc(100vh-64px)] shadow-lg w-[calc(100vw-30%)] my-8 animate-slide-up relative"
      >
        {/* Content */}
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Purchase Order: {order.ref_number}
            </h1>
            <p className="text-gray-500">
              Created on{" "}
              {new Date(order.po_date || order.created_at).toLocaleDateString()}
            </p>
          </div>
          <p>
            <span className="font-bold">Vendor:</span> {order.vendor_name}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-gray-500 text-sm">Vendor</p>
                <h3 className="font-semibold">{order.vendor_name}</h3>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-gray-500 text-sm">Expected Arrival</p>
                <h3 className="font-semibold">
                  {order.expected_arrival_date
                    ? new Date(order.expected_arrival_date).toLocaleDateString()
                    : "Not set"}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-gray-500 text-sm">Created By</p>
                <h3 className="font-semibold">{order.created_by_username}</h3>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-gray-500 text-sm">Grand Total</p>
                <h3 className="font-semibold">
                  {order.currency} {Number(order.grand_total).toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Status + meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium shadow
              ${
                order.status === "received"
                  ? "bg-green-100 text-green-700"
                  : order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-600"
              }`}
          >
            Status: {order.status}
          </span>

          <div className="flex gap-6 text-sm text-gray-500">
            <span>Total Items: {order.total_items}</span>
            <span>Received: {order.total_received}</span>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white/70 backdrop-blur-md shadow-sm rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Ordered Items
          </h2>
          <TableContainer
            isPagination={true}
            isSelect={false}
            isGlobalFilter={false}
            columns={columns || []}
            data={items || []}
            customPageSize={10}
            divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12"
            tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-y border-slate-200 dark:border-zink-500"
            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 
              transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-100 dark:group-[.hover]:hover:bg-zink-600"
            thclassName="group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 
              sorting px-4 py-2.5 text-black bg-[#f9fafc] font-semibold text-left"
            tdclassName="py-2 px-4 border-b border-slate-200"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row px-4"
            tbodyclassName="px-4"
          />
        </div>

        {/* Totals footer */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-sm">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-gray-600 font-medium">
                    Subtotal
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {
                      currencies.find(
                        (currency) => currency.code === order.currency
                      ).symbol
                    }
                    {Number(order.subtotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600 font-medium">
                    Service Charge
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {
                      currencies.find(
                        (currency) => currency.code === order.currency
                      ).symbol
                    }
                    {Number(order.service_charge).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600 font-medium">
                    Discount
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    -
                    {
                      currencies.find(
                        (currency) => currency.code === order.currency
                      ).symbol
                    }
                    {Number(order.discount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-600 font-medium">VAT</td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {
                      currencies.find(
                        (currency) => currency.code === order.currency
                      ).symbol
                    }
                    {Number(order.vat).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold text-lg">
                  <td className="px-4 py-3 text-gray-900">Grand Total</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {
                      currencies.find(
                        (currency) => currency.code === order.currency
                      ).symbol
                    }
                    {Number(order.grand_total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <button
            onClick={exit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Back to Purchase Orders
          </button>
        </div>
      </motion.div>
    </div>
  );
}
