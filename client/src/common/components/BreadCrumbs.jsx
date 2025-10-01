import { ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

function BreadCrumbs() {
  const location = useLocation();
  const pathnames = location.pathname
    .split("/")
    .filter((x) => x && isNaN(Number(x))); // Filter out numeric segments

  return (
    <nav>
      <ul className="flex items-center text-gray-600 gap-[6.5px] text-sm font-semibold">
        <li className="flex items-center gap-[6.5px] hover:text-blue-700">
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((name, index) => {
          const isLast = index === pathnames.length - 1;
          const displayName =
            name === "sis"
              ? name.toUpperCase()
              : name.charAt(0).toUpperCase() + name.slice(1);
          return (
            <li
              key={index}
              className={`flex items-center gap-[6.5px] ${
                isLast
                  ? "pointer-events-none cursor-default opacity-75 font-normal"
                  : "hover:text-blue-700"
              }`}
            >
              <ChevronRight size={15} />
              <Link to={`/${pathnames.slice(0, index + 1).join("/")}`}>
                {displayName}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BreadCrumbs;
