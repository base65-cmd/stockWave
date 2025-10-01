import { Box, MoreHorizontal, Plus } from "lucide-react";

const Products = ({ products }) => {
  return (
    <div className="p-1 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg text-gray-700 flex items-center justify-center font-semibold">
          <Box className="mr-1" />
          Total Product{" "}
          <span className="ml-2 text-sm bg-gray-600 text-white px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </h2>
        <button className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="grid gap-4">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl border border-gray-200 w-full bg-white shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
          >
            {/* Ellipsis Menu - repositioned for mobile */}
            <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="text-gray-400 w-5 h-5" />
            </button>

            {/* Top Section - Product Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Stocked Product
                </p>
              </div>
            </div>
            <div className="border-b border-gray-200 -mx-3 sm:-mx-5 mt-2 "></div>

            {/* Details Grid */}
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Part Number</p>
                <p className="font-semibold text-gray-800">
                  {product.part_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Current Qty</p>
                <p className="font-semibold text-gray-800">
                  {product.quantity}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Reorder Point
                </p>
                <p className="font-semibold text-gray-800">
                  {product.min_stock_level}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Last Purchase Price
                </p>
                <p className="font-semibold text-gray-800">
                  ${product.last_price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
