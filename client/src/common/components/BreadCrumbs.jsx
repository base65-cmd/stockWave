import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BreadCrumbs() {
  const location = useLocation();
  const pathnames = location.pathname
    .split("/")
    .filter((x) => x && isNaN(Number(x))); // Ignore empty or numeric segments

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full px-3 md:px-6 py-2 md:py-3 overflow-y-hidden"
    >
      <ul className="flex flex-wrap items-center text-gray-600  gap-1 text-[13px] sm:text-sm font-medium">
        {/* Home Icon */}
        <li className="flex items-center gap-1 hover:text-blue-700 transition-colors">
          <Link to="/" className="flex items-center gap-1">
            <Home size={16} className="hidden sm:block" />
            <span className="block sm:hidden font-semibold">Home</span>
            <span className="hidden sm:block">Home</span>
          </Link>
        </li>

        <AnimatePresence>
          {pathnames.map((name, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const decodedName = decodeURIComponent(name);
            const displayName =
              decodedName === "sis"
                ? decodedName.toUpperCase()
                : decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

            return (
              <motion.li
                key={to}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-1 ${
                  isLast
                    ? "text-gray-400 cursor-default"
                    : "hover:text-blue-700 transition-colors"
                }`}
              >
                <ChevronRight size={14} className="mx-1 text-gray-400" />
                {isLast ? (
                  <span className="truncate max-w-[80px] sm:max-w-none">
                    {displayName}
                  </span>
                ) : (
                  <Link to={to} className="truncate max-w-[80px] sm:max-w-none">
                    {displayName}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </nav>
  );
}

export default BreadCrumbs;
