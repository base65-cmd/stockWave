import { Tooltip } from "antd";
import clsx from "clsx";
import {
  Plus,
  FileBadge,
  Info,
  ShieldCheck,
  UserRound,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  CircleAlert,
  Settings,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
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

const GeneralInformation = ({ profile = {} }) => {
  const [showCertificates, setShowCertificates] = useState(false);

  return (
    <div className="flex max-[900px]:flex-col gap-6 w-full">
      {/* Column 1 */}
      <div className="flex flex-col w-full min-[900px]:w-[70%] gap-6">
        {/* Address Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Address</h3>
            <button className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold  text-gray-700 mb-1">
              Billing Address
            </h4>
            <p className="text-sm text-gray-600">{profile.address}</p>
          </div>
        </div>

        {/* Purchasing Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Purchasing Info</h3>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-sm space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Currency</span>
              <div className="flex">
                {profile.currency_accepted.map((code, index) => {
                  const currency = currencies.find((c) => c.code === code);

                  if (!currency) return null;

                  return (
                    <span
                      key={index}
                      className={clsx("text-gray-600 ", {
                        "mr-1": index !== profile.currency_accepted.length - 1,
                      })}
                    >
                      {currency.name} ({currency.symbol})
                      {index !== profile.currency_accepted.length - 1 && (
                        <span>, </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between">
              <span>Payment Term</span>
              <span className="text-gray-600">{profile.payment_terms}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="text-gray-600">American Express</span>
            </div>
            <div className="flex justify-between">
              <span>Price Include Taxes</span>
              <span className="text-gray-600">Yes ✅</span>
            </div>
          </div>
        </div>

        {/* Other Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Other Details</h3>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 space-y-3">
            {/* Certificates Dropdown */}
            <div>
              <button
                onClick={() => setShowCertificates(!showCertificates)}
                className="flex justify-between w-full items-center hover:underline"
              >
                <span className="flex items-center gap-2 font-medium">
                  <FileBadge className="w-4 h-4 text-blue-400" />
                  Certificates
                </span>
                {showCertificates ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showCertificates && (
                <ul className="mt-2 pl-6 list-disc text-gray-700 space-y-1">
                  {profile.compliance_docs
                    .filter((doc) => doc.has)
                    .map((doc, index) => (
                      <li key={index}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {doc.type}
                        </a>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                Status
              </span>
              <span
                className={clsx("px-2 py-1 text-xs rounded-full text-white", {
                  "bg-green-600": profile.is_active,
                  "bg-red-600": !profile.is_active,
                })}
              >
                {profile.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Tax ID */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-yellow-300" />
                Tax ID
              </span>
              <span className="text-gray-600">123-456-789</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Contact Person */}
      <div className="flex flex-col w-full min-[900px]:w-[30%] gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contact Person</h3>
            <button className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-sm flex flex-col gap-4">
            {/* Profile */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-blue-600 text-white font-bold text-sm w-10 h-10 flex items-center justify-center">
                  {profile.contact_persons[0].name
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase())
                    .join("")}
                </div>
                <div>
                  <p className="font-mediumtext-gray-700">
                    {profile.contact_persons[0].name}
                  </p>
                  <p className="text-gray-700">Manager</p>
                </div>
              </div>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-md">
                PRIMARY
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 grid grid-cols-[max-content_1fr] gap-x-3 text-gray-700">
              {/* Department */}
              <span>Department</span>
              <Tooltip title={"Sales Marketing"} trigger={"hover"}>
                <span className="text-gray-600 w-full truncate text-nowrap max-[901px]:text-right">
                  Sales marketing
                </span>
              </Tooltip>
              {/* Email */}
              <span>Email</span>
              <Tooltip title={profile.email} trigger={"hover"}>
                <span className="text-gray-600 w-full truncate text-nowrap max-[901px]:text-right">
                  {profile.email}
                </span>
              </Tooltip>
              {/* Phone */}
              <span>Phone</span>
              <Tooltip title={profile.phone} trigger={"hover"}>
                <span className="text-gray-600 w-full truncate text-nowrap max-[901px]:text-right">
                  {profile.phone}
                </span>
              </Tooltip>
            </div>

            {/* Alert */}
            <div className="bg-[#3b2f21] text-orange-300 p-2 rounded-md flex items-center justify-between text-xs">
              <div className="flex gap-2 items-center">
                <CircleAlert className="w-4 h-4" />
                <span>Portal invitation not accepted</span>
              </div>
              <button className="text-orange-200 underline text-xs ml-2">
                Reinvite
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2 bg-[#2d3238] rounded-md">
                  <Settings className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-[#2d3238] rounded-md">
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>
              <button className=" px-3 py-1.5 text-xs font-semibold text-blue-600 ring ring-blue-600 rounded-md hover:bg-blue-600 duration-150 transition-all hover:text-white">
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformation;
