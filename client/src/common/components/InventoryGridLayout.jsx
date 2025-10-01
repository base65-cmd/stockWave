import { useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import useSidebarStore from "../../stores/useSidebarStore";
import clsx from "clsx";

export default function InventorySidebar({
  loading,
  products = [],
  onProductClick,
  page,
  setPage,
  scrollRef,
}) {
  const ITEMS_PER_PAGE = 30;
  const { isOpen } = useSidebarStore();

  const totalPages = useMemo(
    () => Math.ceil(products.length / ITEMS_PER_PAGE),
    [products]
  );

  const paginatedProducts = useMemo(
    () => products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [products, page]
  );

  return (
    <div className="rounded-lg ">
      {/* Product Grid */}
      <div ref={scrollRef} className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        ) : (
          <div
            className={clsx("gap-4 select-none", [
              "grid grid-cols-1 min-[482px]:grid-cols-2 min-[675px]:grid-cols-3",
              isOpen
                ? "min-[850px]:grid-cols-2 min-[960px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1260px]:grid-cols-3 min-[1500px]:grid-cols-4"
                : "min-[850px]:grid-cols-3 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-6",
            ])}
          >
            {paginatedProducts.length === 0 ? (
              <span className="col-span-4 text-center text-gray-500 py-4">
                No items found in this category
              </span>
            ) : (
              paginatedProducts.map((item, idx) => (
                <motion.div
                  key={item.stock_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  onClick={() => onProductClick(item.item_id)}
                >
                  <ProductCard
                    name={item.name}
                    icon={item.category}
                    quantity={item.quantity}
                    part_number={item.part_number}
                    selected={false}
                    purchaseOrder={true}
                    inventoryGridLayout={true}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between w-full items-center gap-4">
          <button
            onClick={() => {
              setPage((p) => Math.max(p - 1, 1));
              scrollRef
                ? scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                : window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => {
              setPage((p) => Math.min(p + 1, totalPages));
              scrollRef
                ? scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                : window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
