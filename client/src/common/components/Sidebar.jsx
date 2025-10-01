import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AudioWaveform,
  ChartLine,
  ChevronRight,
  Clipboard,
  Dot,
  LayoutDashboard,
  LogOut,
  ScanBarcode,
  ScrollText,
  Send,
  Settings,
  Ship,
} from "lucide-react";
import useSidebarStore from "../../stores/useSidebarStore";
import { useAuthStore } from "../../stores/useAuthStore";
import clsx from "clsx";
import useWindowWidth from "./useWindowWidth";

const sidebarMenu = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory Management",
    icon: Clipboard,
    subMenu: [
      {
        name: "Inventory List",
        path: "/inventory",
      },
      {
        name: "Add Items",
        path: "/inventory/create",
      },
      {
        name: "Stock Adjustment",
        path: "/stock-adjustment",
      },
      {
        name: "Inventory Report",
        path: "/inventory-report",
      },
      {
        name: "Low Stock",
        path: "/low-stock",
      },
    ],
  },
  {
    name: "Applications",
    icon: Send,
    subMenu: [
      {
        name: "Chat",
        path: "/chat",
      },
      {
        name: "Calendar",
        path: "/calendar",
      },
      {
        name: "Tasks",
        path: "/tasks",
      },
      {
        name: "Notes",
        path: "/notes",
      },
    ],
  },
  {
    name: "Vessel Management",
    icon: Ship,
    subMenu: [
      {
        name: "Vessel Overview",
        path: "/vessel",
      },
      {
        name: "Dispatch Records",
        path: "/dispatch-records",
      },
    ],
  },
  {
    name: "Transactions",
    icon: ScanBarcode,
    subMenu: [
      {
        name: "SIS",
        path: "/sis",
      },
      {
        name: "Returns/Adjustments",
        path: "/returns",
      },
      {
        name: "Transaction History",
        path: "/sis-transactions",
      },
      {
        name: "e-BinCard",
        path: "/ebincard",
      },
    ],
  },
  {
    name: "Vendors",
    icon: ScrollText,
    subMenu: [
      {
        name: "Vendor Directory",
        path: "/vendor",
      },
      {
        name: "Add/Edit Vendors",
        path: "/add-vendor",
      },
      {
        name: "Purchase Orders",
        path: "/purchase-order",
      },
      {
        name: "Vendor Reports",
        path: "/vendor-report",
      },
    ],
  },
  {
    name: "Reports & Analytics",
    icon: ChartLine,
    subMenu: [
      {
        name: "Inventory Report",
        path: "/inventory-report",
      },
      {
        name: "Dispatch Records",
        path: "/dispatch",
      },
      {
        name: "Custom Report",
        path: "/custom-report",
      },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    subMenu: [
      {
        name: "General Settings",
        path: "/settings",
      },
      {
        name: "User Management",
        path: "/user-management",
      },
    ],
  },
  {
    name: "Logout",
    icon: LogOut,
    path: "/login",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const setActiveMenu = useSidebarStore((state) => state.setActiveMenu);
  const clearActiveMenu = useSidebarStore((state) => state.clearActiveMenu);
  const activeMenu = useSidebarStore((state) => state.activeMenu);
  const { logout } = useAuthStore();
  const windowWidth = useWindowWidth();

  useEffect(() => {
    // set default open/closed based on width
    if (windowWidth < 1024) {
      useSidebarStore.setState({ isOpen: false });
    } else {
      useSidebarStore.setState({ isOpen: true });
    }
  }, [windowWidth]);

  function toggleMenu(index) {
    if (activeMenu === index) {
      clearActiveMenu();
    } else {
      setActiveMenu(index);
    }
    if (!isOpen) {
      toggleSidebar();
    }
  }

  function activateSubMenu(index) {
    setActiveMenu(index);
    if (!isOpen) {
      toggleSidebar();
    }
  }
  return (
    <nav
      className={`${
        isOpen
          ? " w-[280px] transition-all duration-300"
          : "min-[1024px]:w-[60px] max-[1024px]:w-0 transition-all duration-300"
      } h-screen bg-white text-black flex max-[1024px]:fixed min-[1024px]:sticky z-16 top-20 min-[1024px]:top-0 flex-col border-r border-gray-200`}
    >
      <header className="h-20 flex items-center justify-center border-b max-[1024px]:hidden border-gray-200 px-6 font-audiowide text-2xl text-stone-50 tracking-wider">
        <motion.div
          whileHover={{ scale: 1.1 }}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Link to="/" className="block text-black">
            <span className={`${!isOpen && "hidden invisible"}`}>
              StockWave
            </span>
            <AudioWaveform className={`${isOpen && "hidden invisible"}`} />
          </Link>
        </motion.div>
      </header>

      <ul
        className={`flex-1 overflow-y-scroll space-y-2 menu text-black text-nowrap ${
          isOpen ? "pl-4 pr-2.5 py-3" : "pl-1.5 pr-0 overflow-hidden"
        }`}
      >
        <li
          className={`mb-2 text-gray-400 text-[10px] uppercase font-bold tracking-wider ${
            !isOpen && "invisible"
          }`}
        >
          Navigation
        </li>

        {sidebarMenu.map((item, index) => {
          const isActive = activeMenu === index;
          const hasSubMenu = !!item.subMenu;

          const Tag = item.path ? Link : "button";

          return (
            <li key={item.name}>
              <Tag
                to={item.path}
                onClick={async () => {
                  hasSubMenu ? toggleMenu(index) : activateSubMenu(index);
                  if (item.name === "Logout") {
                    await logout(() => navigate("/login"));
                  }
                  if (windowWidth < 1024 && !hasSubMenu) {
                    toggleSidebar();
                  }
                }}
                className={`w-full flex items-center rounded-md text-sm font-medium transition-all duration-300 ${
                  pathname === item.path ||
                  (hasSubMenu &&
                    item.subMenu.some(
                      (subItem) =>
                        subItem.path === pathname ||
                        pathname.startsWith(subItem.path + "/")
                    ))
                    ? "bg-blue-600 text-white transition-all duration-300"
                    : "hover:bg-stone-100"
                } 
                ${
                  isOpen
                    ? "px-3 py-3 justify-between gap-3"
                    : "px-0 py-3 justify-center"
                }
                  `}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={16}
                    className={clsx({
                      invisible: !isOpen && windowWidth < 1024,
                    })}
                  />
                  <span className={`${!isOpen && "hidden invisible"} `}>
                    {item.name}
                  </span>
                </div>
                {hasSubMenu && (
                  <ChevronRight
                    size={16}
                    className={`transition-all duration-300 ${
                      isActive ? "rotate-90" : ""
                    } ${!isOpen && "hidden invisible"}`}
                  />
                )}
              </Tag>

              {hasSubMenu && (
                <ul
                  className={clsx(
                    `grid transition-all duration-300 overflow-hidden ${
                      isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`
                  )}
                >
                  <div className="overflow-hidden">
                    {item.subMenu.map((subItem, subIndex) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          onClick={() => {
                            if (windowWidth < 1024) {
                              toggleSidebar();
                            }
                          }}
                          className={clsx(
                            `flex items-center gap-3 px-6 py-3 mt-1 text-sm rounded-md transition-all hover:bg-stone-100`,
                            pathname === subItem.path ||
                              pathname.startsWith(subItem.path + "/")
                              ? "text-blue-600 font-semibold transition-all duration-300"
                              : "hover:text-blue-600 hover:font-semibold transition-all duration-300"
                          )}
                        >
                          <Dot size={18} />
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </div>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
