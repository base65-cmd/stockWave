import { AudioWaveform, EllipsisVertical, Menu, X } from "lucide-react";
import {
  PlusCircle,
  Building2,
  Bell,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import useSidebarStore from "../../stores/useSidebarStore";
import IconButton from "./IconButton";
import NavbarButton from "./NavbarButton";
import FlagIcon from "./FlagIcon";
import { useAuthStore } from "../../stores/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Dropdown, Input, Space } from "antd";
import useWindowWidth from "./useWindowWidth";
import MenuButton from "./MenuButton";

function NavBar() {
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const isOpen = useSidebarStore((state) => state.isOpen);
  const activeMenu = useSidebarStore((state) => state.activeMenu);
  const clearActiveMenu = useSidebarStore((state) => state.clearActiveMenu);
  const { logout } = useAuthStore();
  const location = useLocation();
  const isSISPage = location.pathname === "/sis";
  const windowWidth = useWindowWidth();

  function handleToggle() {
    if (activeMenu !== null) {
      clearActiveMenu();
    }

    toggleSidebar();
  }
  const items = [
    {
      label: <a>My Profile</a>,
      key: "0",
    },
    {
      label: <a>Settings</a>,
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: (
        <a
          href="/login"
          className="flex gap-2"
          onClick={async () => await logout()}
        >
          <LogOut className="w-5 h-5" strokeWidth={1} />
          Logout
        </a>
      ),
      key: "3",
    },
  ];
  return (
    <nav
      className={`bg-white border-b max-[1024px]:w-full border-gray-200 h-20 px-6 flex items-center transition-all duration-300 justify-between fixed top-0 right-0 z-50`}
      style={{
        width: isSISPage
          ? "100%"
          : isOpen
          ? `${windowWidth >= 1024 ? "calc(100% - 280px)" : "100%"}`
          : `${windowWidth >= 1024 ? "calc(100% - 60px)" : "100%"}`,
      }}
    >
      <div className="flex items-center gap-4">
        {!isSISPage ? (
          <>
            <MenuButton isOpen={isOpen} onClick={handleToggle} />
            <div className="max-[800px]:hidden">
              <Input
                type="text"
                placeholder="⌕ Search"
                className="text-sm  px-3 py-1.5 rounded-md border border-gray-200 max-[1024px]:hidden bg-white text-white placeholder:text-gray-400 font-medium tracking-wide"
              />
            </div>
          </>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Link to="/" className="text-black text-2xl flex gap-2">
              <AudioWaveform />
              <span className={``}>StockWave</span>
            </Link>
          </motion.div>
        )}
      </div>

      {!isSISPage && windowWidth < 1024 && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Link to="/" className="text-black text-2xl flex gap-2">
              <AudioWaveform />
              <span className={``}>StockWave</span>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Wrap right-side icons in a single flex container */}
      <div className="">
        <div className=" flex items-center gap-2 max-[1024px]:hidden">
          {isSISPage && (
            <NavbarButton
              name="Dashboard"
              icon={LayoutDashboard}
              bgColor="bg-blue-600"
              link="/"
            />
          )}
          <NavbarButton
            name="Add New"
            icon={PlusCircle}
            bgColor="bg-blue-600"
            link="/inventory/create"
          />
          <NavbarButton
            name="SIS"
            icon={Building2}
            bgColor="bg-blue-800"
            link="/sis"
          />
          <FlagIcon src="https://www.worldometers.info/img/flags/ni-flag.gif" />
          <hr className="h-10 mx-6 border-l border-gray-400" />
          <IconButton icon={Bell} />
          <IconButton
            icon={LogOut}
            link={"/login"}
            onClick={async () => await logout()}
          />
        </div>
        <div className="min-[1024px]:hidden">
          <div className="rounded-full w-7 h-7 flex justify-center items-center transition-all duration-200 hover:bg-gray-200">
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Space>
                <EllipsisVertical />
              </Space>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
