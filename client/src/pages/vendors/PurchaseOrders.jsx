import { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "../../common/components/PageHeader";
import {
  CalendarClock,
  Eye,
  FileDown,
  MoreVertical,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import TableContainer from "../../common/TableContainer";
import { usePurchaseStore } from "../../stores/usePurchaseStore";
import DashboardCard from "../../common/components/DashboardCard";
import { Dropdown, Space, Spin } from "antd";
import PurchaseOrderDetail from "../../common/components/PurchaseOrderDetail";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

const PurchaseOrders = () => {
  const [currentFilter, setCurrentFilter] = useState(0);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [index, setIndex] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [viewPODetail, setViewPODetail] = useState(false);
  const [PurchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const POFilters = [
    "All",
    "Draft",
    "Ordered",
    "Partial",
    "Received",
    "Closed",
    "Open",
  ];
  const originalPORef = useRef([]);
  const navigate = useNavigate();
  const { getAllPurchaseRecord, fetchPurchaseOrderItems, purchaseLoading } =
    usePurchaseStore();

  useEffect(() => {
    const fetchData = async () => {
      const result = await getAllPurchaseRecord();
      originalPORef.current = result;
      setPurchaseOrderList(result);
    };
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "purchase_order_number",
        header: "Purchase ID",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const poNumber = row.original.purchase_order_number;
          const draftNumber = row.original.purchase_id;

          const display_number =
            poNumber === null ? `Draft ${draftNumber}` : poNumber;
          return display_number;
        },
      },
      {
        accessorKey: "vendor_name",
        header: "Supplier",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        accessorKey: "created_by_username",
        header: "Executed By",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status; // e.g. "created", "approved", …

          const styleMap = {
            Created: "bg-blue-50  text-blue-600",
            Draft: "bg-yellow-300 text-yellow-700",
            "Sent for Approval": "bg-indigo-50 text-indigo-600",
            Approved: "bg-green-50 text-green-600",
            "Sent to Vendor": "bg-purple-50 text-purple-600",
            Partial: "bg-yellow-50 text-yellow-700",
            Received: "bg-emerald-50 text-emerald-600",
            Closed: "bg-red-50 text-red-600",
            Canceled: "bg-red-100 text-red-700",
          };

          const classes = styleMap[status] || "bg-gray-50 text-gray-600"; // fallback

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "total_received",
        header: "Received",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const { total_received, total_items } = row.original;
          return `${total_received} of ${total_items}`;
        },
      },
      {
        accessorKey: "grand_total",
        header: "Amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const { currency, grand_total } = row.original;
          const currency_symbol = currencies.find(
            (item) => currency === item.code
          ).symbol;
          const grandTotal = Number(grand_total).toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          return `${currency_symbol} ${grandTotal}`;
        },
      },
      {
        accessorKey: "expected_arrival_date",
        header: "Expected Arrival",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const { expected_arrival_date } = row.original;
          if (expected_arrival_date === null) {
            return "Multiple ETA";
          } else {
            const date = new Date(expected_arrival_date);
            return date.toLocaleDateString();
          }
        },
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const purchaseId = row.original?.purchase_id;
          const items = [
            {
              label: (
                <button
                  className="w-full flex items-center gap-2 text-left hover:text-blue-600"
                  onClick={async () => {
                    const result = await fetchPurchaseOrderItems(purchaseId);
                    navigate("/purchase-order/create", {
                      state: { vendorDetails: result },
                    });
                  }}
                >
                  <Pencil size={16} /> Edit PO
                </button>
              ),
              key: 0,
            },
            {
              label: (
                <button
                  className="w-full flex items-center gap-2 text-left hover:text-gray-700"
                  onClick={async () => {
                    const result = await fetchPurchaseOrderItems(purchaseId);
                    setPurchaseOrderItems(result);
                    setViewPODetail(true);
                    // setViewMode(true);
                    // viewOrEditDispatch();
                  }}
                >
                  <Eye size={16} /> View PO
                </button>
              ),
              key: 1,
            },
            {
              label: (
                <button
                  className="w-full flex items-center gap-2 text-left hover:text-green-600"
                  onClick={() => {
                    // downloadPDF(menuPos.dispatchId);
                    setMenuPos(null);
                  }}
                >
                  <FileDown size={16} /> Download PDF
                </button>
              ),
              key: 2,
            },
            { type: "divider" },
            {
              label: (
                <button
                  className="w-full flex items-center gap-2 text-left hover:text-red-600"
                  onClick={() => {
                    confirmDelete(menuPos.dispatchId);
                    setMenuPos(null);
                  }}
                >
                  <Trash2 size={16} /> Delete PO
                </button>
              ),
              key: 3,
            },
          ];
          return (
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Space>
                <button className="p-2 rounded-full group/action hover:bg-blue-600 transition duration-300">
                  <MoreVertical className="w-5 h-5 group-hover/action:text-white text-gray-600" />
                </button>
              </Space>
            </Dropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <PageHeader
        title="Purchase Orders"
        button={[
          {
            name: "Create Purchase Order",
            icon: Plus,
            bgColor: "bg-blue-600",
            link: "/purchase-order/create",
          },
        ]}
      />
      <Spin spinning={purchaseLoading} size="large" fullscreen={true}></Spin>
      <div className="p-3 space-y-4">
        {viewPODetail && (
          <PurchaseOrderDetail
            order={PurchaseOrderItems}
            items={PurchaseOrderItems.items}
            exit={() => {
              setViewPODetail(false);
              setPurchaseOrderItems([]);
            }}
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="w-full  backdrop-blur-sm">
            <DashboardCard
              title="Total Orders"
              icon={ShoppingCart}
              icon_bg="bg-green-300"
              value={originalPORef.current.length}
              trendPercent={12}
              trendUp={false}
            />
          </div>
          <div>
            <DashboardCard
              title="Orders Last 7 Days"
              icon={CalendarClock}
              icon_bg="bg-purple-300"
              value="56"
              trendPercent={-8}
              trendUp={false}
            />
          </div>
          <div>
            <DashboardCard
              title="Deliveries Due This Week"
              icon={Truck}
              icon_bg="bg-pink-300"
              value="21"
              trendPercent={5}
              trendUp
            />
          </div>
          <div>
            <DashboardCard
              title="Delayed Orders"
              icon={Truck}
              icon_bg="bg-blue-300"
              value="21"
              trendPercent={5}
              trendUp
            />
          </div>
          <div>
            <DashboardCard
              title="Pending Approvals"
              icon={Truck}
              icon_bg="bg-yellow-300"
              value="21"
              trendPercent={5}
              trendUp
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 overflow-x-auto mt-3 border border-gray-200 bg-white/80 rounded-2xl p-2 shadow-sm w-full sm:w-fit">
          {POFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentFilter(index);
                if (filter === "Draft") {
                  const filteredPO = originalPORef.current.filter(
                    (po) => po.status === "Draft"
                  );
                  setPurchaseOrderList(filteredPO);
                } else if (filter === "Ordered") {
                  const filteredPO = originalPORef.current.filter(
                    (po) => po.status === "Sent to Vendor"
                  );
                  setPurchaseOrderList(filteredPO);
                } else if (filter === "Partial") {
                  const filteredPO = originalPORef.current.filter(
                    (po) =>
                      po.total_received > 0 &&
                      po.total_received < po.total_items
                  );
                  setPurchaseOrderList(filteredPO);
                } else if (filter === "Received") {
                  const filteredPO = originalPORef.current.filter(
                    (po) => po.total_received === po.total_items
                  );
                  setPurchaseOrderList(filteredPO);
                } else if (filter === "Open") {
                  const filteredPO = originalPORef.current.filter(
                    (po) => po.status !== "Closed"
                  );
                  setPurchaseOrderList(filteredPO);
                } else if (filter === "Closed") {
                  const filteredPO = originalPORef.current.filter(
                    (po) => po.status === "Closed"
                  );
                  setPurchaseOrderList(filteredPO);
                } else {
                  setPurchaseOrderList(originalPORef.current);
                }
              }}
              className={`rounded-lg px-3 py-1.5 font-semibold text-sm cursor-pointer transition-colors duration-150 ${
                currentFilter === index
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className="relative bg-white/80 rounded-2xl border border-slate-200 shadow-sm py-3 px-2 sm:px-4 mt-3 overflow-x-auto">
          <TableContainer
            isPagination
            isSelect
            isLoading={purchaseLoading}
            isGlobalFilter
            columns={columns || []}
            data={purchaseOrderList || []}
            customPageSize={10}
            divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12"
            tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
            theadclassName="border-y border-slate-200 dark:border-zink-500"
            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-50"
            thclassName="px-4 py-2.5 font-semibold text-slate-700 bg-slate-100 text-left"
            tdclassName="py-2 px-4 border-b border-slate-200"
            PaginationClassName="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 sm:px-4"
            tbodyclassName="px-4"
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
