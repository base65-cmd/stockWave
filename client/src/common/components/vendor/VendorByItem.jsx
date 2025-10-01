import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, List, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dummyItems = [
  {
    id: 1,
    name: "Hydraulic Pump",
    image: "https://via.placeholder.com/150?text=Pump",
    vendors: [
      {
        id: 1,
        name: "Alpha Supplies",
        rating: 4.5,
        email: "alpha@example.com",
      },
      { id: 2, name: "Beta Equip", rating: 3.8, email: "beta@example.com" },
    ],
  },
  {
    id: 2,
    name: "Industrial Filter",
    image: "https://via.placeholder.com/150?text=Filter",
    vendors: [],
  },
  {
    id: 3,
    name: "Control Valve",
    image: "https://via.placeholder.com/150?text=Valve",
    vendors: [
      { id: 3, name: "Gamma Tech", rating: 4.9, email: "gamma@example.com" },
    ],
  },
  // ... more dummy
];

const ITEMS_PER_PAGE = 4;

export default function VendorByItem() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  // filter items
  const filtered = useMemo(
    () =>
      dummyItems.filter((it) =>
        it.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filtered, page]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Search items…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded ${
              view === "grid"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            } shadow-sm`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            } shadow-sm`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid/List */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {paginated.map((item) => (
          <motion.div
            key={item.id}
            className="bg-white rounded-xl p-4 shadow cursor-pointer hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-32 object-cover rounded-md mb-3"
            />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {item.vendors.length > 0
                ? `${item.vendors.length} vendor${
                    item.vendors.length > 1 ? "s" : ""
                  }`
                : "No vendors yet"}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Vendor Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-xl flex flex-col"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedItem.name}
              </h2>
              <div className="flex-1 overflow-y-auto">
                {selectedItem.vendors.length > 0 ? (
                  selectedItem.vendors.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center p-3 mb-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{v.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{v.email}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {v.rating} ⭐
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No vendors supply this item yet.
                  </p>
                )}
              </div>
              <button
                className="mt-4 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
                onClick={() => alert("Add vendor flow")}
              >
                <Plus className="w-5 h-5" /> Add Vendor
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
