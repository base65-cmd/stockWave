import { useEffect, useState, useMemo } from "react";
import PageHeader from "../common/components/PageHeader";
import {
  CalendarIcon,
  Repeat,
  X,
  BatteryLow,
  Smile,
  Box,
  AlertTriangle,
  FileText,
  RefreshCw,
  Users,
  DollarSign,
  Truck,
  Ship,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ArrowUpCircle,
  Store,
} from "lucide-react";
import BarChartCard from "../common/components/Charts/BarChartCard";
import { useDispatchStore } from "../stores/useDispatchStore";
import AutocompleteInput from "../common/components/AutoCompleteInput";
import { useInventoryStore } from "../stores/useInventoryStore";
import { Link } from "react-router-dom";
import TransactionsTable from "../common/components/SISTransactionsTable";
import { useAuthStore } from "../stores/useAuthStore";
import { motion } from "framer-motion";
import useWindowWidth from "../common/components/useWindowWidth";
import clsx from "clsx";
import useSidebarStore from "../stores/useSidebarStore";
import { Spin, Tooltip } from "antd";

const HomePage = () => {
  const [dispatchedData, setDispatchedData] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [inputValue, setInputValue] = useState("Product_230 PN-00230");
  const { fetchAllDispatchedItems, dispatchLoading } = useDispatchStore();
  const {
    fetchAllInventory,
    getLowInventory,
    getOutOfStock,
    loading,
    inv_loading,
  } = useInventoryStore();
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const { username } = useAuthStore();
  const windowWidth = useWindowWidth();
  const { isOpen } = useSidebarStore();

  const vesselMap = {
    "Sea Wanderer": "Sea Wan",
    "Aurora’s Wake": "Aurora",
    "Blue Horizon": "Blue Hor",
    "The Mariner’s Star": "Mariner",
    "Ocean Whisper": "Ocean Whis",
    "Tempest Wind": "Tempest",
    "Eternal Tide": "Eternal",
    "Silver Gull": "Silver",
    "Wave Dancer": "Wave Dan",
    "Voyager’s Dream": "Voyager",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dispatchData = await fetchAllDispatchedItems();

        const recordsResult = dispatchData.map((entry) => ({
          name: `${entry.name} ${entry.part_number}`,
          quantity: entry.quantity,
          date: new Date(entry.dispatch_date),
          destination_name: entry.destination_name,
        }));

        setRecords(recordsResult);

        const filtered = getTotalDispatchedByDestination(
          inputValue,
          null,
          null,
          recordsResult
        );

        const resultArray = Object.entries(filtered).map(
          ([destination, total]) => ({
            destination,
            label: vesselMap[destination],
            totalQuantity: total,
          })
        );

        setDispatchedData(resultArray);

        const inventory = await fetchAllInventory();
        const uniqueInventory = inventory.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.item_id === item.item_id)
        );

        setAllInventory(uniqueInventory);
      } catch (error) {}
    };
    fetchData();
  }, []);

  function getTotalDispatchedByDestination(itemName, startDate, endDate, data) {
    const resultMap = {};

    // Initialize all vessels with 0
    Object.keys(vesselMap).forEach((vessel) => {
      resultMap[vessel] = 0;
    });

    const start = startDate ? new Date(startDate) : new Date("1900-01-01"); // earliest reasonable date
    const end = endDate ? new Date(endDate) : new Date("9999-12-31"); // far future

    data.forEach((entry) => {
      const entryDate = new Date(entry.date);

      if (entry.name === itemName && entryDate >= start && entryDate <= end) {
        const dest = entry.destination_name;

        resultMap[dest] += entry.quantity;
      }
    });

    return resultMap;
  }

  const handleSelect = (itemId) => {
    const selectedItem = allInventory.find((item) => item.item_id === itemId);
    if (!selectedItem) return;

    const label = `${selectedItem.name} ${selectedItem.part_number}`;

    const filtered = getTotalDispatchedByDestination(
      label,
      startDate,
      endDate,
      records
    );

    const resultArray = Object.entries(filtered).map(
      ([destination, total]) => ({
        destination,
        label: vesselMap[destination],
        totalQuantity: total,
      })
    );

    setDispatchedData(resultArray);
    setInputValue(label);
  };

  //Start of low stock
  useEffect(() => {
    const fetchLowStock = async () => {
      const lowStockItems = await getLowInventory();
      setLowStock(lowStockItems);
    };
    fetchLowStock();
  }, []);
  // End of low stock

  // Start of out of stock
  useEffect(() => {
    const fetchOutOfStock = async () => {
      const outOfStockItems = await getOutOfStock();
      setOutOfStock(outOfStockItems);
    };
    fetchOutOfStock();
  }, []);

  const WelcomeBanner = ({ username = "there" }) => {
    return (
      <div className="flex items-center">
        <div className=" bg-opacity-20 p-2 rounded-full">
          <Smile className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome back, {username}!</h2>
          <p className="text-sm opacity-90">
            Let’s get you back to managing your inventory.
          </p>
        </div>
      </div>
    );
  };

  const formatNumber = (n) =>
    typeof n === "number" ? (n >= 1000 ? n.toLocaleString() : String(n)) : "-";

  const formatCurrency = (v, currency = "$") =>
    `${currency}${typeof v === "number" ? v.toLocaleString() : "-"}`;

  function Sparkline({ data = [], width = 100, height = 32 }) {
    // Tiny, dependency-free sparkline. Returns svg with stroke + subtle fill.
    const path = useMemo(() => {
      if (!data || data.length === 0) return { pathD: "", fillD: "" };
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const step = data.length > 1 ? width / (data.length - 1) : width;
      const points = data.map((v, i) => {
        const x = Math.round(i * step);
        const y = Math.round(
          height - ((v - min) / range) * (height - 6) - 3 /* padding */
        );
        return [x, y];
      });
      const pathD = points.reduce(
        (acc, p, i) =>
          i === 0 ? `M ${p[0]} ${p[1]}` : `${acc} L ${p[0]} ${p[1]}`,
        ""
      );
      // fill path (close to baseline)
      const lastX = points[points.length - 1][0];
      const firstX = points[0][0];
      const baseline = height;
      const fillD = `${pathD} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
      return { pathD, fillD };
    }, [data, width, height]);

    const trendColor =
      data.length >= 2 && data[data.length - 1] >= data[0]
        ? "#16a34a"
        : "#ef4444"; // green/red

    if (!path.pathD) {
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect width={width} height={height} fill="transparent" />
        </svg>
      );
    }

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={path.fillD}
          fill={trendColor}
          fillOpacity="0.08"
          stroke="none"
        />
        <path
          d={path.pathD}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function StatCard({
    icon: Icon,
    title,
    value,
    delta,
    deltaPrefix = "",
    deltaSuffix = "%",
    deltaIsPercent = true,
    subtitle,
    progress,
    sparkline,
    link,
    ratio,
    children,
  }) {
    const positive = typeof delta === "number" ? delta >= 0 : null;

    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative rounded-2xl bg-white shadow-sm border border-gray-100 
                 transition-all duration-300 hover:shadow-md overflow-hidden 
                 grid grid-rows-[auto,1fr,auto] h-50 sm:h-56"
      >
        {/* --- HEADER --- */}
        <div className="p-2 sm:p-3 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">
              {title || <span className="invisible">placeholder</span>}
            </p>
            {value ? (
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 truncate">
                {value}
              </h3>
            ) : (
              // Maintain space even if missing
              <div className="" />
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {Icon ? (
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-tr from-indigo-50 to-blue-50 shadow-sm">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
            ) : (
              <div className="h-8 w-8" /> // keeps spacing uniform
            )}

            {typeof delta === "number" ? (
              <span
                className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-full ${
                  positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {deltaPrefix}
                {Math.abs(Number(delta).toFixed(deltaIsPercent ? 1 : 0))}
                {deltaIsPercent ? deltaSuffix : ""}
              </span>
            ) : (
              <div className="h-4" /> // keeps spacing when no delta
            )}
          </div>
        </div>

        {/* --- BODY --- */}
        <div
          className={clsx(
            "px-4 sm:px-5 pb-2 sm:pb-3 w-full gap-3 overflow-hidden",
            { "grid grid-rows-3": !children }
          )}
        >
          {children ? (
            <div className="flex-1 overflow-hidden">{children}</div>
          ) : (
            <>
              {subtitle ? (
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {subtitle}
                </p>
              ) : (
                <div className="" /> // reserve space
              )}

              {sparkline && (
                <div className="flex justify-end w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkline data={sparkline} width={200} height={40} />
                </div>
              )}

              {typeof progress === "number" && (
                <div className="mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, progress))}%`,
                      }}
                      className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] sm:text-xs text-gray-400">
                    <span>{Math.round(progress)}% complete</span>
                    {ratio && <span>{ratio}</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex justify-end items-center">
          {link ? (
            <Link
              to={link.to}
              className="flex items-center text-[11px] sm:text-sm text-indigo-600 hover:text-indigo-800 
                       transition-colors whitespace-nowrap font-medium"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
            </Link>
          ) : (
            <div className="h-4" /> // keeps uniform height when no link
          )}
        </div>

        {/* Decorative Hover Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 
                      transition duration-300 bg-gradient-to-br 
                      from-indigo-100/30 via-transparent to-transparent"
        />
      </motion.div>
    );
  }

  // Small timeline item
  function TimelineItem({ time, title, description, type = "info" }) {
    const color =
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : "bg-blue-500";
    return (
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${color}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{title}</p>
            <p className="text-xs text-gray-400">{time}</p>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------
   MOCK DATA (replace with real data)
   --------------------------- */
  const mock = {
    totalItems: 12345,
    totalValue: 452000,
    pendingPOs: 18,
    vendorsCount: 42,
    recentTransactionsCount: 320,
    dispatchesThisMonth: 95,
    vesselsActive: { active: 7, total: 10 },
    topVendors: [
      { name: "Sea Wanderer", orders: 15 },
      { name: "Aurora’s Wake", orders: 12 },
    ],
    sparklines: {
      inventory: [100, 110, 120, 130, 125, 140, 150],
      value: [420, 430, 440, 460, 455, 452, 452],
      transactions: [40, 50, 45, 60, 70, 80, 90],
      dispatches: [5, 6, 8, 12, 15, 14, 18],
    },
    recentActivity: [
      {
        time: "2h ago",
        title: "PO #2245 created",
        description: "PO for 120 units of Diesel Filter (Vendor: Sea Wanderer)",
        type: "info",
      },
      {
        time: "6h ago",
        title: "Dispatch #998 completed",
        description: "Dispatched to Vessel Aurora (On-time)",
        type: "success",
      },
      {
        time: "1 day",
        title: "Inventory adjustment",
        description: "Adjusted 5 units for Item #4523 (damage)",
        type: "error",
      },
      {
        time: "3 days ago",
        title: "New vendor onboarded",
        description:
          "Vendor 'Maritime Supplies Co.' added to the vendor directory.",
        type: "info",
      },
      {
        time: "5 days ago",
        title: "Low stock alert",
        description:
          "Item #7842 (Engine Oil Drum) dropped below minimum stock threshold.",
        type: "error",
      },
    ],
    fastMoving: [
      {
        name: "Premium Safety Gloves",
        part_number: "GLV-101",
        soldPerMonth: 120,
      },
      {
        name: "Industrial Drill Set",
        part_number: "DRL-220",
        soldPerMonth: 95,
      },
      {
        name: "LED Work Light",
        part_number: "LWL-330",
        soldPerMonth: 80,
      },
      {
        name: "Hydraulic Jack",
        part_number: "HJ-440",
        soldPerMonth: 70,
      },
      {
        name: "High-Vis Vest",
        part_number: "HVV-550",
        soldPerMonth: 65,
      },
    ],
  };
  return (
    <div className="">
      <PageHeader title="Dashboard" />
      <Spin
        spinning={inv_loading || loading || dispatchLoading}
        size="large"
        fullscreen={true}
      ></Spin>
      <div className="p-6 space-y-6 max-[450px]:space-y-3 max-[450px]:p-3">
        <WelcomeBanner username={username} />
        <div
          className={clsx("grid  gap-6 max-[450px]:gap-3", [
            isOpen && windowWidth > 1024
              ? "lg:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
          ])}
        >
          <StatCard
            icon={Box}
            title="Total Inventory Items"
            value={formatNumber(mock.totalItems)}
            delta={8.2}
            subtitle="SKUs across all warehouses"
            progress={70}
            link={{ to: "/inventory", label: "View Inventory" }}
          />

          <StatCard
            icon={DollarSign}
            title="Inventory Value"
            value={formatCurrency(mock.totalValue)}
            delta={-2.0}
            deltaIsPercent={true}
            subtitle="Estimated stock value (current)"
            // sparkline={mock.sparklines.value}
            link={{ to: "/inventory-report", label: "View Report" }}
          />

          <StatCard
            icon={FileText}
            title="Pending Purchase Orders"
            value={formatNumber(mock.pendingPOs)}
            delta={+12.5}
            subtitle="Open POs awaiting fulfillment"
            progress={40}
            // sparkline={[2, 3, 5, 7, 6, 4, 5]}
            link={{ to: "/purchase-order", label: "Manage POs" }}
          />

          <StatCard
            icon={Users}
            title="Active Vendors"
            value={formatNumber(mock.vendorsCount)}
            delta={+5}
            deltaIsPercent={false}
            subtitle={`${mock.topVendors[0].name} top vendor`}
            sparkline={[5, 6, 7, 7, 8, 9, 12]}
            link={{ to: "/vendor", label: "View Vendors" }}
          />
          {/* ROW 2: Operational Insights (4 cards) */}
          <StatCard
            icon={RefreshCw}
            title="Recent Transactions"
            value={formatNumber(mock.recentTransactionsCount)}
            delta={+12}
            subtitle="Transactions this week"
            sparkline={mock.sparklines.transactions}
            link={{ to: "/sis-transactions", label: "View History" }}
          />

          <StatCard
            icon={Truck}
            title="Dispatch Performance"
            value={formatNumber(mock.dispatchesThisMonth)}
            delta={+4.3}
            subtitle="On-time rate: 92%"
            sparkline={mock.sparklines.dispatches}
            link={{ to: "/dispatch-records", label: "View Records" }}
          />

          <StatCard
            icon={Ship}
            title="Vessel Utilization"
            value={`${mock.vesselsActive.active} / ${mock.vesselsActive.total} Active`}
            subtitle="Top Vessel: Aurora"
            progress={
              (mock.vesselsActive.active / mock.vesselsActive.total) * 100
            }
            link={{ to: "/vessel", label: "View Vessels" }}
          />

          <StatCard
            icon={Store}
            title="Top Vendors by Orders"
            value={`Total: ${mock.topVendors.length}`}
            link={{ to: "/vendor-report", label: "View Report" }}
          >
            <div className="mt-2 space-y-2">
              {mock.topVendors.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between border-b last:border-0 pb-1.5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {v.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Orders: {v.orders}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {v.orders}
                  </span>
                </div>
              ))}
            </div>
          </StatCard>
        </div>

        <div className="flex flex-col min-[850px]:flex-row gap-6 max-[450px]:gap-3">
          {/* Dispatched Items */}
          <motion.div
            whileHover={{ y: -2 }}
            className={clsx(
              "rounded-2xl shadow-sm  border border-gray-100 hover:shadow-md bg-white",
              [
                isOpen && windowWidth > 1024
                  ? "lg:w-[60%]"
                  : "w-full min-[850px]:w-[55%] lg:w-full h-fit min-[850px]:h-[450px]",
              ]
            )}
          >
            <header className="border-b relative border-gray-100 py-3 pl-3 pr-8 mb-3 grid grid-cols-1 min-[575px]:grid-cols-2 min-[700px]:grid-cols-3 min-[850px]:grid-cols-2 xl:grid-cols-3 gap-2 items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-1">
                  <Repeat
                    className="p-1"
                    size={24}
                    stroke="#1C64F2"
                    strokeWidth={1.8}
                  />
                </div>
                <span className="ml-2 font-bold">
                  Items Dispatched per Vessel
                </span>
              </div>
              <div className="flex items-center justify-center space-x-4 max-[700px]:justify-stretch">
                {/* Start Date */}
                <div className="relative flex items-center gap-2 group">
                  <div className="border border-gray-300 p-2 rounded">
                    <CalendarIcon
                      className="w-[17px] h-[17px] text-gray-600 cursor-pointer"
                      title="Select Start Date"
                    />
                  </div>
                  <input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute top-0 left-0 w-6 h-6 opacity-0 cursor-pointer"
                  />
                  <p className="text-sm min-[700px]:hidden min-[850px]:block xl:hidden ">
                    Start Date
                  </p>
                  <div className="absolute -top-8 left-1/2 max-[700px]:hidden min-[850px]:hidden xl:block -translate-x-1/2 text-nowrap scale-0 group-hover:scale-100 transition-transform bg-black text-white text-xs rounded px-2 py-1 z-10">
                    Start Date
                  </div>
                </div>

                {/* End Date */}
                <div className="relative flex items-center gap-2 group">
                  <div className="border border-gray-300 rounded cursor-pointer">
                    <CalendarIcon
                      className="w-[17px] h-[17px] m-2 text-gray-600"
                      title="Select End Date"
                    />
                  </div>
                  <input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute top-0 left-0 w-6 h-6 opacity-0 cursor-pointer"
                  />
                  <p className="text-sm min-[700px]:hidden min-[850px]:block xl:hidden">
                    End Date
                  </p>
                  <div className="absolute -top-8 left-1/2 max-[700px]:hidden min-[850px]:hidden xl:block text-nowrap -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-xs rounded px-2 py-1 z-10">
                    End Date
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2 min-[575px]:col-span-2 min-[700px]:col-span-1 min-[850px]:col-span-2 xl:col-span-1 items-center">
                <AutocompleteInput
                  inventoryItems={allInventory}
                  onSelect={handleSelect}
                  setValue={setInputValue}
                  value={inputValue}
                  className={"border! border-gray-300! py-2!"}
                  className2={"w-full"}
                />
                <X
                  size={20}
                  strokeWidth={1.5}
                  className="text-gray-400 hover:text-gray-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setInputValue("");
                    setEndDate(null);
                    setStartDate(null);
                  }}
                />
              </div>
            </header>
            <div>
              <BarChartCard
                title="Items Dispatched per Vessel"
                data={dispatchedData}
                dataKey="totalQuantity"
                barColor="#4ade80" // Tailwind green-400
                rounded={true}
              />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-2xl shadow-sm  border border-gray-100 hover:shadow-md w-full min-[850px]:w-[45%] h-[450px] bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Quick Actions</h4>
              <p className="text-xs text-gray-400">Shortcuts</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/inventory/create"
                className="flex items-center justify-between p-3 rounded border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add Inventory Item</p>
                    <p className="text-xs text-gray-400">Create new SKU</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/purchase-order/create"
                className="flex items-center justify-between p-3 rounded border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-green-50">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Create Purchase Order</p>
                    <p className="text-xs text-gray-400">New supplier PO</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/dispatch-records"
                className="flex items-center justify-between p-3 rounded border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-orange-50">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Create Dispatch</p>
                    <p className="text-xs text-gray-400">New delivery</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/vendor"
                className="flex items-center justify-between p-3 rounded border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-pink-50">
                    <Users className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add Vendor</p>
                    <p className="text-xs text-gray-400">Quick vendor form</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col min-[850px]:flex-row gap-6 max-[450px]:gap-3">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-md shadow-sm border border-gray-100 w-full min-[850px]:w-[60%] bg-white h-[432px]"
          >
            <div className="flex justify-between items-center border-b border-gray-200 p-4 h-[62px]">
              <span className="font-semibold">Recent transactions</span>
              <Link
                to="/sis-transactions"
                className="border border-gray-200 rounded p-1 text-sm hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                View All
              </Link>
            </div>
            <div className="p-4 h-[358px] menu">
              <div className="rounded border pt-3 border-gray-200">
                <TransactionsTable
                  actionButton={false}
                  limit={5}
                  isSelect={false}
                  isPagination={false}
                />
              </div>
            </div>
          </motion.div>

          {/* Recent Activity (spans 2 columns on lg) */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-md shadow-sm border border-gray-100 w-full min-[850px]:w-[40%] h-[432px] bg-white p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Recent Activity</h4>
              <Link
                to="/sis-transactions"
                className="text-sm text-gray-500 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {mock.recentActivity.map((a, i) => (
                <TimelineItem
                  key={i}
                  time={a.time}
                  title={a.title}
                  description={a.description}
                  type={a.type}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-[450px]:gap-3 ">
          {/* LowStock */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-md shadow-sm border border-gray-100 w-full bg-white h-fit sm:h-[475px]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="bg-red-100 p-2.5 text-red-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <Tooltip title={"Low Stock"}>
                  <span
                    className={clsx("truncate ", [
                      isOpen && windowWidth > 1024 && "max-w-[102px]",
                    ])}
                  >
                    Low Stock
                  </span>
                </Tooltip>
              </div>
              <Link
                to={"/low-stock"}
                className="text-sm underline cursor-pointer"
              >
                View All
              </Link>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-x-auto categories">
              {lowStock?.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[48px_200px_1fr] min-[367px]:grid-cols-[48px_300px_1fr] items-center gap-3 py-3"
                >
                  <div className="p-3 bg-red-50 rounded flex items-center text-red-600 justify-center">
                    <BatteryLow />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium max-[367px]:max-w-[200px] text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Part Number : {product.part_number}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Instock</div>
                    <div className="text-red-500 leading-tight">
                      {String(product.quantity).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Out of Stock */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-md shadow-sm border border-gray-100 w-full bg-white h-fit sm:h-[475px]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="bg-red-100 p-2.5 text-red-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <Tooltip title={"Out of Stock"}>
                  <span
                    className={clsx("truncate ", [
                      isOpen && windowWidth > 1024 && "max-w-[102px]",
                    ])}
                  >
                    Out of Stock
                  </span>
                </Tooltip>
              </div>
              <Link
                to={"/out-of-stock"}
                className="text-sm underline text-nowrap cursor-pointer"
              >
                View All
              </Link>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-x-auto categories">
              {outOfStock?.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[48px_200px_1fr] min-[367px]:grid-cols-[48px_300px_1fr] items-center gap-3 py-3"
                >
                  <div className="p-3 bg-red-50 rounded flex items-center text-red-600 justify-center">
                    <BatteryLow />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium max-[367px]:max-w-[200px] text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Part Number : {product.part_number}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Instock</div>
                    <div className="text-red-500 leading-tight">
                      {String(product.quantity).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fast Moving Products */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-md shadow-sm border border-gray-100 w-full bg-white h-fit sm:h-[475px]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="bg-blue-100 p-2.5 text-blue-600 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <Tooltip title={"Fast Moving Stock"}>
                  <span
                    className={clsx("truncate ", [
                      isOpen && windowWidth > 1024 && "max-w-[102px]",
                    ])}
                  >
                    Fast Moving Stock
                  </span>
                </Tooltip>
              </div>
              <Link
                to={"/fast-moving"}
                className="text-sm underline cursor-pointer text-nowrap"
              >
                View All
              </Link>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-x-auto categories">
              {mock.fastMoving.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[48px_200px_1fr] min-[367px]:grid-cols-[48px_250px_1fr] items-center gap-3 py-3"
                >
                  <div className="p-3 bg-blue-50 rounded flex items-center text-blue-600 justify-center">
                    <ArrowUpCircle />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium max-[367px]:max-w-[200px] text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Part Number : {product.part_number}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500 text-nowrap">
                      Issued / Month
                    </div>
                    <div className="text-blue-500 leading-tight">
                      {String(product.soldPerMonth).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
