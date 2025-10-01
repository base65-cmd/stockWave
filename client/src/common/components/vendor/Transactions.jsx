import {
  BadgeDollarSign,
  Truck,
  PackageSearch,
  Plus,
  FileText,
  PlusCircle,
  Send,
  CheckCircle,
  PackageCheck,
} from "lucide-react";
import StageProgressBar from "./StageProgressBar";
import { Link } from "react-router-dom";
import useWindowWidth from "../useWindowWidth";

const Transactions = ({ transactions, profile }) => {
  const txns = Array.isArray(transactions) ? transactions : [];
  const windowWidth = useWindowWidth();
  const stages = [
    ["Draft", FileText],
    ["Created", PlusCircle],
    ["Sent for Approval", Send],
    ["Approved", CheckCircle],
    ["Sent to Vendor", Truck],
    ["Received", PackageCheck],
  ];

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
    <div className="bg-white text-gray-900 min-[475px]:p-6 w-full">
      <div className="flex max-[430px]:flex-col min-[430px]:justify-between min-[430px]:items-center mb-4">
        <h2 className="text-lg font-semibold max-[475px]:text-right">
          Total Purchase Order
          <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300">
            {transactions.length || 0}
          </span>
        </h2>

        <Link
          to={"/purchase-order/create"}
          state={{ vendor: profile.name }}
          className="text-blue-600 text-sm flex items-center gap-1 hover:underline max-[475px]:justify-end max-[475px]:mt-1"
        >
          <Plus className="w-4 h-4" />
          Add Transactions
        </Link>
      </div>

      <div className="space-y-4">
        {txns.length === 0 ? (
          <span className="block w-full text-center text-gray-500 py-6">
            No transactions found
          </span>
        ) : (
          txns.map((item, index) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-xl border border-gray-200"
            >
              <div className="flex max-[475px]:flex-col-reverse justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800 border-r pr-2 mr-2 border-gray-300">
                      {item.purchase_order_number === null
                        ? `Draft ${item.purchase_id}`
                        : item.purchase_order_number}
                    </h3>
                    <p className="text-sm text-gray-600">{item.ref_number}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-nowrap flex items-center gap-1">
                    <BadgeDollarSign className="w-3 h-3 text-gray-400" />
                    {profile.name} • {profile.address}
                  </div>
                </div>

                <div className="text-right max-[475px]:flex max-[475px]:justify-between max-[475px]:w-full space-y-1">
                  <p className="font-bold text-base text-gray-800">
                    {currencies.find((c) => c.code === item.currency)?.symbol}
                    {Number(item.grand_total).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {/* TODO: update item.paid to fit */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.paid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-300 rounded-xl mx-auto w-[99%] py-1 mt-2">
                <StageProgressBar
                  stages={stages}
                  currentStep={stages.findIndex(
                    ([label]) => label === item.status
                  )}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
