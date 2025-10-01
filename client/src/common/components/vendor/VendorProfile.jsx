import { motion } from "framer-motion";
import {
  ArrowRightFromLine,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import SegmentSlider from "../SegmentSlider";
import GeneralInformation from "./GeneralInformation";
import Transactions from "./Transactions";
import Products from "./Products";
import { Link } from "react-router-dom";
import HorizontalScrollContainer from "../HorizontalScrollContainer";
import clsx from "clsx";
import { Dropdown, Space } from "antd";

const VendorProfile = ({ close, profile = {}, transactions = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const categoryScrollRef = useRef(null);
  const items = ["General Information", "Products", "Transactions", "Settings"];
  const dropdownItems = [
    {
      label: (
        <Link to={"/purchase-order/create"} type="button" className="">
          New Transaction
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <button type="button" className="">
          Edit
        </button>
      ),
      key: "1",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 bg-black/40 flex justify-center max-[951px]:p-3 min-[951px]:justify-end items-center z-150"
    >
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          duration: 0.2,
          ease: "easeOut",
        }}
        // transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white relative min-[500px]:p-6 categories overflow-y-scroll rounded-2xl min-[951px]:mr-3 space-y-4 shadow-xl w-full min-[951px]:w-[95%]
         min-[1005px]:w-[90%] min-[1063px]:w-[85%] min-[1130px]:w-[80%] min-[1204px]:w-[75%] menu h-full min-[951px]:h-[95vh]"
      >
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <span
              onClick={close}
              className="cursor-pointer bg-gray-100 p-1.5 rounded-lg border-gray-300"
            >
              <ArrowRightFromLine strokeWidth={1.5} className="text-gray-700" />
            </span>
            <div className="min-[400px]:flex justify-end hidden">
              <Link
                to={"/purchase-order/create"}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 
            font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 
            focus:outline-none dark:focus:ring-blue-800 transition-all duration-150"
              >
                New Transaction
              </Link>
              <button
                type="button"
                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 
            focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 
            py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white
             dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-all duration-150"
              >
                Edit
              </button>
            </div>
            <div className="min-[400px]:hidden">
              <Dropdown
                className="rounded-full w-7 h-7 flex justify-center items-center transition-all duration-200 hover:bg-gray-200"
                menu={{ items: dropdownItems }}
                trigger={["click"]}
              >
                <Space>
                  <EllipsisVertical />
                </Space>
              </Dropdown>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-start gap-4 bg-white w-full max-w-md">
              {/* Avatar */}
              <div className="border border-gray-200 rounded-full p-2 shrink-0">
                <UserRound className="w-8 h-8 text-gray-600" />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 w-full">
                {/* Name + Website */}
                <div className="flex max-[390px]:flex-col max-[390px]:items-start justify-between items-center w-full">
                  <span className="font-semibold text-xl text-gray-800">
                    {profile.name}
                  </span>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:underline transition"
                  >
                    Website
                  </a>
                </div>

                {/* Financials + Rating */}
                <div className="max-[390px]:flex-col flex justify-between text-sm text-gray-600">
                  <span>
                    <strong className="font-medium text-gray-700">
                      Receivable:
                    </strong>{" "}
                    $1,000
                  </span>
                  <span className="flex items-center gap-1">
                    <strong className="font-medium text-gray-700">
                      Rating:
                    </strong>{" "}
                    {profile.supply_rating}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-yellow-400 stroke-yellow-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.4 8.168L12 18.896l-7.334 3.865 1.4-8.168L.132 9.211l8.2-1.193z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <div className="hidden min-[600px]:flex ">
              <div
                onClick={() =>
                  setSelectedIndex((prev) => {
                    if (prev === 0) {
                      return prev; // don't go below 0
                    }
                    return prev - 1;
                  })
                }
                className="border-y border-l rounded-l-lg hover:bg-gray-200 transition-colors cursor-pointer duration-300 border-gray-200 flex items-center justify-center w-fit h-fit p-1.5"
              >
                <ChevronLeft className="text-gray-600" />
              </div>
              <div
                onClick={() =>
                  setSelectedIndex((prev) => {
                    if (prev === items.length - 1) {
                      return prev;
                    }
                    return prev + 1;
                  })
                }
                className="border border-gray-200 flex rounded-r-lg hover:bg-gray-200 transition-colors cursor-pointer duration-300 items-center justify-center w-fit h-fit p-1.5"
              >
                <ChevronRight className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Slider */}
          <SegmentSlider
            items={items}
            selected={selectedIndex}
            setSelected={setSelectedIndex}
            className="w-fit max-w-md mt-3 max-[455px]:hidden"
            className2={"bg-white rounded-lg shadow"}
          />
        </div>

        {/* Mobile Slider */}
        <div className="w-full min-[455px]:hidden sticky top-0 flex items-center justify-center bg-gray-200 pt-2 px-2">
          <HorizontalScrollContainer
            activeIndex={selectedIndex}
            ref={categoryScrollRef}
            className={"overflow-x-scroll scrollbar-hide"}
          >
            {items.map((item) => (
              <button
                onClick={() => setSelectedIndex(items.indexOf(item))}
                className={clsx(
                  "py-2 px-4 font-medium text-sm",
                  selectedIndex === items.indexOf(item)
                    ? "bg-white rounded-lg shadow text-black"
                    : "text-gray-500"
                )}
              >
                {item}
              </button>
            ))}
          </HorizontalScrollContainer>
        </div>
        <div className="p-3">
          {selectedIndex === 0 && <GeneralInformation profile={profile} />}
          {selectedIndex === 2 && (
            <Transactions transactions={transactions} profile={profile} />
          )}
          {selectedIndex === 1 && <Products products={profile.items} />}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VendorProfile;
