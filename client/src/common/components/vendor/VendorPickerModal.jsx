import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Loader2, LayoutGrid, List, RefreshCcw, X } from "lucide-react";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import useVendorStore from "../../../stores/useVendorStore";
import SmallVendorCard from "./SmallVendorCard";
import { useInventoryStore } from "../../../stores/useInventoryStore";
import InventoryGridLayout from "../InventoryGridLayout";
import HorizontalScrollContainer from "../HorizontalScrollContainer";
import NavbarButton from "../NavbarButton";
import clsx from "clsx";
import LoadingSpinner from "../LoadingSpinner2";

export default function VendorDirectory({ isOpen, onClose, onSelect }) {
  const [activeCategory, setActiveCategory] = useState("Spares");
  const [activeCategoryId, setActiveCategoryId] = useState(14);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState([]);
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLocation, setCurrentLocation] = useState("");
  const [itemSearchVendorResult, setItemSearchVendorResult] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [page, setPage] = useState(1); // Current Page for Inventory Side Bar
  const [products, setProducts] = useState([]);
  const scrollContainerRef = useRef(null);
  const scrollRef = useRef();

  const itemsPerPage = 12;
  const selected = "active";
  const {
    fetchVendors,
    fetchVendorByCategory,
    vendorLoading,
    fetchVendorByItem,
  } = useVendorStore();
  // const vendorLoading = false; //TODO Update this to use the vendorLoading state from the store
  const originalVendorsRef = useRef([]);
  const categoryScrollRef = useRef(null);
  const allInventory = useRef([]);
  const {
    allCategories,
    fetchAllCategories,
    fetchAllUniqueInventory,
    inv_loading,
  } = useInventoryStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchVendors();
        setVendors(result);
        originalVendorsRef.current = result;
        const inv_result = await fetchAllUniqueInventory();
        setProducts(inv_result);
        allInventory.current = inv_result;
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    fetchData();
  }, [isOpen]);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent the body from scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCategories();
    };
    fetchData();
  }, [isOpen]);

  const fetchVendorByCategoryFunction = async (category_id) => {
    const baseItems = await fetchVendorByCategory(category_id);
    return baseItems;
  };

  const paginatedVendors = vendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const debouncedSearch = useCallback(
    tab === "By Item"
      ? debounce((value) => {
          const s = value.toLowerCase();
          const filteredItems = allInventory.current.filter((item) => {
            const matchesSearch =
              (item.name?.toLowerCase().includes(s) ?? false) ||
              (item.part_number?.toLowerCase().includes(s) ?? false);

            return matchesSearch;
          });

          setProducts(filteredItems);
          setPage(1);
        }, 300)
      : debounce(async (value) => {
          const searchTerm = value.toLowerCase();
          const baseItems = await fetchVendorByCategoryFunction(
            activeCategoryId
          );
          const vendorArray =
            tab === "All"
              ? originalVendorsRef.current || []
              : Array.isArray(baseItems)
              ? baseItems
              : [];

          const updatedVendorArray =
            currentLocation !== ""
              ? vendorArray.filter((vendor) =>
                  vendor.address
                    .toLowerCase()
                    .includes(currentLocation.toLocaleLowerCase())
                )
              : vendorArray;

          const filteredVendors = updatedVendorArray.filter((vendor) => {
            const matchesName = vendor.name.toLowerCase().includes(searchTerm);
            const matchesAddress = vendor.address
              .toLowerCase()
              .includes(searchTerm);
            const matchesContact = vendor.contact_persons?.some((person) =>
              person?.name?.toLowerCase().includes(searchTerm)
            );

            const matchesSearch =
              matchesName || matchesAddress || matchesContact;

            const matchesStatus =
              selected === "all"
                ? true
                : selected === "active"
                ? vendor.is_active
                : !vendor.is_active;

            return matchesSearch && matchesStatus;
          });

          setVendors(filteredVendors);

          setCurrentPage(1);
        }, 300),
    [vendors, activeCategoryId, selected, tab, allInventory.current]
  );

  const handleFilterImmediately = async (
    searchValue,
    status,
    setTab = tab,
    location = currentLocation
  ) => {
    const searchTerm = searchValue.toLowerCase();
    const baseItems = await fetchVendorByCategoryFunction(activeCategoryId);

    const vendorArray =
      setTab === "All"
        ? originalVendorsRef.current || []
        : Array.isArray(baseItems)
        ? baseItems
        : [];

    const updatedVendorArray =
      location !== ""
        ? vendorArray.filter((vendor) =>
            vendor.address
              .toLowerCase()
              .includes(currentLocation.toLocaleLowerCase())
          )
        : vendorArray;

    const filteredVendors = updatedVendorArray.filter((vendor) => {
      const matchesName = vendor.name.toLowerCase().includes(searchTerm);
      const matchesAddress = vendor.address.toLowerCase().includes(searchTerm);
      const matchesContact = vendor.contact_persons?.some((person) =>
        person?.name?.toLowerCase().includes(searchTerm)
      );

      const matchesSearch = matchesName || matchesAddress || matchesContact;

      const matchesStatus =
        status === "all"
          ? true
          : status === "active"
          ? vendor.is_active
          : !vendor.is_active;

      return matchesSearch && matchesStatus;
    });

    setVendors(filteredVendors);
    setCurrentPage(1);
  };

  const handleCategoryChange = async (
    category,
    category_id,
    overrideLocation = location,
    setCategory = true
  ) => {
    if (setCategory) {
      setActiveCategory(category);
      setActiveCategoryId(category_id);
    }
    setCurrentPage(1);

    const filterBySearchAndStatus = (items) => {
      const s = search.toLowerCase().trim();

      return items.filter((vendor) => {
        const matchesSearch = !s
          ? true
          : vendor.name.toLowerCase().includes(s) ||
            vendor.address.toLowerCase().includes(s) ||
            vendor.contact_persons?.some((person) =>
              person?.name?.toLowerCase().includes(s)
            );

        const matchesStatus =
          selected === "all"
            ? true
            : selected === "active"
            ? vendor.is_active
            : !vendor.is_active;

        return matchesSearch && matchesStatus;
      });
    };

    const baseItems = await fetchVendorByCategoryFunction(category_id);
    if (baseItems.length === 0) {
      setVendors([]);
    }
    const filtered = filterBySearchAndStatus(baseItems);

    const updatedValue =
      currentLocation !== ""
        ? filtered.filter((vendor) =>
            vendor.address.toLowerCase().includes(currentLocation.toLowerCase())
          )
        : filtered;
    setVendors(updatedValue);
  };

  return (
    isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl max-[515px]:w-[90vw] w-[85vw] lg:w-[80vw] xl:w-[70vw] h-[80vh] relative p-6 flex flex-col"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <div className="flex relative w-full h-full">
            <div className="w-full space-y-4">
              {/* Top Bar */}
              <div className="relative max-[875px]:grid max-[875px]:grid-cols-1 max-[875px]:gap-3 flex justify-between items-center">
                {/* Search Bar */}
                <div className="relative max-[875px]:w-full min-[875px]:max-w-md flex items-center gap-3">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    className="pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      tab !== "By Item"
                        ? "Search vendors..."
                        : "Search items..."
                    }
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                  />
                  <X
                    strokeWidth={1.5}
                    className="hover:text-red-600 min-[875px]:hidden transition-all duration-150"
                    onClick={() => {
                      onClose();
                      setTab("All");
                    }}
                  />
                </div>

                <div className="flex items-center max-[875px]:justify-center gap-3">
                  <NavbarButton
                    onClick={() => {
                      view === "grid" ? setView("list") : setView("grid");
                    }}
                    icon={view === "list" ? LayoutGrid : List}
                    bgColor="bg-blue-600"
                  />
                  {/* Tabs */}
                  <div className="space-x-2 border border-gray-200 bg-white rounded-lg p-1 shadow w-fit">
                    {["All", "By Category", "By Item"].map((t) => (
                      <button
                        key={t}
                        className={`rounded-[6px] px-2 py-[6px] font-semibold text-sm cursor-pointer ${
                          tab === t
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                        }`}
                        onClick={async () => {
                          setTab(t);
                          setItemSearchVendorResult(false);
                          if (t === "By Category") {
                            handleCategoryChange("Spares", 14);
                          }

                          if (t === "All") {
                            // Restore full original vendor list first
                            setVendors(originalVendorsRef.current);
                            await handleFilterImmediately(
                              search,
                              selected,
                              "All"
                            );
                          }
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <X
                    strokeWidth={1.5}
                    className="hover:text-red-600 max-[875px]:hidden transition-all duration-150"
                    onClick={() => {
                      onClose();
                      setTab("All");
                    }}
                  />
                </div>
              </div>

              {/* Filter */}
              {tab === "By Category" && (
                <div className="flex space-x-4 mb-3 pb-1 w-full">
                  <HorizontalScrollContainer
                    activeIndex={allCategories.findIndex(
                      (cat) => cat.name === activeCategory
                    )}
                    ref={categoryScrollRef}
                  >
                    {allCategories.map((cat, i) => (
                      <button
                        key={i}
                        className={`px-4 py-1.5 rounded-full text-sm text-nowrap cursor-pointer ${
                          activeCategory === cat.name
                            ? "bg-blue-700 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300"
                        }`}
                        onClick={() =>
                          handleCategoryChange(cat.name, cat.category_id)
                        }
                      >
                        {cat.name}
                      </button>
                    ))}
                  </HorizontalScrollContainer>
                </div>
              )}
              {tab === "All" && (
                <h2 className="text-base font-medium text-gray-600 mb-4">
                  Select from All vendors
                </h2>
              )}

              {/* Vendor Cards */}
              {!itemSearchVendorResult && (
                <>
                  {tab !== "By Item" ? (
                    <div
                      ref={scrollContainerRef}
                      className="flex-1 overflow-y-auto p-3 menu border max-h-3/4 border-gray-200 rounded-lg"
                    >
                      {vendorLoading ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                          <span className="ml-2 text-sm text-gray-600">
                            Processing...
                          </span>
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            view === "grid"
                              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                              : "flex flex-col gap-4"
                          )}
                        >
                          {paginatedVendors.length === 0 ? (
                            <span className="text-gray-500 col-span-4 text-center py-4">
                              No items found in this category
                            </span>
                          ) : (
                            paginatedVendors.map((vendor, index) => (
                              <motion.div
                                key={vendor.vendor_id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                              >
                                <SmallVendorCard
                                  key={vendor.vendor_id}
                                  vendor={vendor}
                                  onClick={() => {
                                    onSelect(vendor);
                                  }}
                                />
                              </motion.div>
                            ))
                          )}
                        </div>
                      )}
                      {paginatedVendors.length > 0 && (
                        <div className="w-full flex justify-between pt-3 items-center">
                          <button
                            className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                            onClick={() => {
                              setCurrentPage((p) => Math.max(p - 1, 1));
                              setTimeout(() => {
                                scrollContainerRef.current?.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }, 0);
                            }}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <span className="text-sm">
                            Page {currentPage} of{" "}
                            {Math.ceil(vendors.length / itemsPerPage)}
                          </span>
                          <button
                            className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                            onClick={() =>
                              setCurrentPage((p) => {
                                const next =
                                  p < Math.ceil(vendors.length / itemsPerPage)
                                    ? p + 1
                                    : p;

                                setTimeout(() => {
                                  scrollContainerRef.current?.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }, 0);

                                return next;
                              })
                            }
                            disabled={
                              currentPage >=
                              Math.ceil(vendors.length / itemsPerPage)
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <h2 className="mb-4 text-base font-semibold text-gray-700">
                        Inventory List – Select an Item to View Vendors
                      </h2>
                      <div
                        ref={scrollRef}
                        className="overflow-y-scroll border border-gray-200 rounded-lg max-h-3/4 menu"
                      >
                        <InventoryGridLayout
                          products={products}
                          loading={inv_loading}
                          page={page}
                          scrollRef={scrollRef}
                          setPage={setPage}
                          onProductClick={async (item_id) => {
                            const result = await fetchVendorByItem(item_id);
                            setVendors(result);
                            setSelectedItemId(item_id);
                            setItemSearchVendorResult(true);
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {itemSearchVendorResult && (
                <>
                  <div className="flex justify-between items-center">
                    <div className=" py-2 px-4 gap-3 bg-white border  border-gray-200 rounded-xl flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {
                          allInventory.current.find(
                            (inv) => inv.item_id === selectedItemId
                          ).name
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {
                          allInventory.current.find(
                            (inv) => inv.item_id === selectedItemId
                          ).part_number
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTab("By Item");
                          setItemSearchVendorResult(false);
                        }}
                        className="underline text-blue-600 hover:text-blue-800"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-3 menu border max-h-3/4 border-gray-200 rounded-lg"
                  >
                    {vendorLoading ? (
                      /* loading spinner*/
                      <LoadingSpinner />
                    ) : paginatedVendors.length > 0 ? (
                      <div
                        className={
                          view === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                            : "flex flex-col gap-4"
                        }
                      >
                        {paginatedVendors.map((vendor, idx) => (
                          <motion.div
                            key={vendor.vendor_id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <SmallVendorCard
                              key={vendor.vendor_id}
                              vendor={vendor}
                              onClick={() => {
                                onSelect(vendor);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-gray-500 mb-2">
                          No vendor supplies this item.
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {paginatedVendors.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => {
                            setCurrentPage((p) => Math.max(p - 1, 1));
                            setTimeout(() => {
                              scrollContainerRef.current?.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }, 0);
                          }}
                          disabled={currentPage === 1}
                          className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="text-sm">
                          Page {currentPage} of{" "}
                          {Math.ceil(vendors.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentPage((p) =>
                              Math.min(
                                p + 1,
                                Math.ceil(vendors.length / itemsPerPage)
                              )
                            );
                            setTimeout(() => {
                              scrollContainerRef.current?.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }, 0);
                          }}
                          disabled={
                            currentPage >=
                            Math.ceil(vendors.length / itemsPerPage)
                          }
                          className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  );
}
