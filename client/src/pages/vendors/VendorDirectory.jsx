import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  LayoutGrid,
  List,
  RefreshCcw,
  Plus,
  Funnel,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useVendorStore from "../../stores/useVendorStore";
import PageHeader from "../../common/components/PageHeader";
import { debounce } from "lodash";
import { useInventoryStore } from "../../stores/useInventoryStore";
import HorizontalScrollContainer from "../../common/components/HorizontalScrollContainer";
import VendorCard from "../../common/components/vendor/VendorCard";
import VendorProfile from "../../common/components/vendor/VendorProfile";
import LoadingSpinner from "../../common/components/LoadingSpinner2";
import { usePurchaseStore } from "../../stores/usePurchaseStore";
import InventoryGridLayout from "../../common/components/InventoryGridLayout";
import clsx from "clsx";
import SegmentSlider from "../../common/components/SegmentSlider";
import { ConfigProvider, Input, Popover, Select } from "antd";
import useSidebarStore from "../../stores/useSidebarStore";

const options = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const items = ["All", "By Category", "By Item"];

export default function VendorDirectory() {
  const [activeCategory, setActiveCategory] = useState("Spares");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(14);
  const [itemSearchVendorResult, setItemSearchVendorResult] = useState(false);
  const [selected, setSelected] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(false);
  const [tab, setTab] = useState("All");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorList, setVendorList] = useState([]); // To add vendors to item
  const [selectedVendor, setSelectedVendor] = useState({});
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1); // Current Page for Inventory Side Bar
  const [currentLocation, setCurrentLocation] = useState(null);
  const [transactions, setTransactions] = useState({});
  const itemsPerPage = 12;
  const {
    fetchVendors,
    fetchVendorByCategory,
    vendorLoading,
    fetchVendorById,
    loading,
    fetchVendorByItem,
    addItemToVendor,
  } = useVendorStore();
  const { isOpen } = useSidebarStore();
  const { fetchPurchaseRecordByVendor } = usePurchaseStore();
  // const vendorLoading = false; //TODO Update this to use the vendorLoading state from the store
  const originalVendorsRef = useRef([]);
  const allInventory = useRef([]);
  const categoryScrollRef = useRef(null);
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
        const inv_result = await fetchAllUniqueInventory();
        allInventory.current = inv_result;
        setProducts(inv_result);
        setVendors(result);
        originalVendorsRef.current = result;
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    fetchData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCategories();
    };
    fetchData();
  }, []);

  const fetchVendorByCategoryFunction = async (category_id) => {
    const baseItems = await fetchVendorByCategory(category_id);
    // setTimeout(() => {
    //   window.scrollTo({ top: 60, behavior: "smooth" });
    // }, -10000);
    return baseItems;
  };

  const vendorStates = [
    ...new Set(
      originalVendorsRef.current
        .map((v) => v.address.split(",").pop().trim())
        .filter(Boolean)
    ),
  ];

  const paginatedVendors = vendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLocationFilter = async (value) => {
    setCurrentLocation(value);
    const selectedLocation = value.toLowerCase();

    const baseItems = await fetchVendorByCategoryFunction(activeCategoryId);
    const vendorArray =
      tab === "All"
        ? originalVendorsRef.current || []
        : Array.isArray(baseItems)
        ? baseItems
        : [];

    const filteredVendors = vendorArray.filter((vendor) => {
      const matchesAddress = vendor.address
        .toLowerCase()
        .includes(selectedLocation);
      const matchesStatus =
        selected === "all"
          ? true
          : selected === "active"
          ? vendor.is_active
          : !vendor.is_active;
      return matchesAddress && matchesStatus;
    });

    setVendors(filteredVendors);
  };

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

  const debouncedSearch2 = useCallback(
    debounce(async (value) => {
      const searchTerm = value.toLowerCase();

      const filteredVendors = originalVendorsRef.current.filter((vendor) => {
        const matchesName = vendor.name.toLowerCase().includes(searchTerm);

        return matchesName;
      });

      setVendorList(filteredVendors);

      setCurrentPage(1);
    }, 300),
    [vendors, activeCategoryId, selected, tab]
  );

  const handleFilterImmediately = async (
    searchValue,
    status,
    setTab = tab,
    location = currentLocation
  ) => {
    const searchTerm = searchValue.toLowerCase();
    const baseItems =
      setTab === "By Category"
        ? await fetchVendorByCategoryFunction(activeCategoryId)
        : [];

    const vendorArray =
      setTab === "All"
        ? originalVendorsRef.current || []
        : Array.isArray(baseItems)
        ? baseItems
        : [];

    const updatedVendorArray =
      location !== null
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
      currentLocation !== null
        ? filtered.filter((vendor) =>
            vendor.address.toLowerCase().includes(currentLocation.toLowerCase())
          )
        : filtered;
    setVendors(updatedValue);
  };

  const handleTabChange = async (index) => {
    setTab(items[index]);

    setItemSearchVendorResult(false);
    if (items[index] === "By Category") {
      await handleCategoryChange("Spares", 14);
    }

    if (items[index] === "By Item") {
      setSearch("");
      setSelected("all");
    }
    if (items[index] === "All") {
      // Restore full original vendor list first
      setVendors(originalVendorsRef.current);
      await handleFilterImmediately(search, selected, "All");
    }

    setTimeout(() => {
      window.scrollTo({ top: 60, behavior: "smooth" });
    }, 0);
  };

  const SidebarFilter = ({ className = "" } = {}) => {
    return (
      <div
        className={`${className} rounded-2xl w-[300px] flex max-[450px]:hidden flex-col justify-between max-[850px]:h-fit `}
      >
        <div className=" shrink-0 flex flex-col gap-5 max-[850px]:p-1 min-[850px]:p-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              disabled={itemSearchVendorResult}
              className="pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                tab === "By Item" ? "Search Items..." : "Search vendors..."
              }
              value={!itemSearchVendorResult ? search : ""}
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
          </div>

          {/* Active / Inactive */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex w-full gap-2">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className={`px-3 py-1.5 w-1/3 rounded-md border text-sm font-medium  transition-all
          ${
            selected === opt.value && tab !== "By Item"
              ? "border-blue-600 text-blue-600 bg-blue-50 cursor-pointer"
              : clsx({
                  "border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer":
                    tab !== "By Item",
                  "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed opacity-50":
                    tab === "By Item",
                })
          }`}
                >
                  <input
                    type="radio"
                    name="vendor-status"
                    value={opt.value}
                    checked={selected === opt.value}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      handleFilterImmediately(search, e.target.value);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hidden"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Filter Location */}
          <div className="w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter By Location
            </label>
            <Select
              placeholder="Select Location"
              options={vendorStates.map((state) => ({
                value: state,
                label: state,
              }))}
              disabled={tab === "By Item"}
              value={currentLocation}
              onChange={handleLocationFilter}
              className={clsx(
                "w-full rounded-lg border-gray-200  px-4 py-2 text-sm"
              )}
            />
          </div>

          {/* Filter by Rating */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter by Rating
            </label>
            <div className="flex flex-col relative">
              <Input
                disabled={tab === "By Item"}
                type="number"
                min="0"
                max="5"
                placeholder="Min"
                className={clsx(
                  "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 z-10"
                )}
              />
              {/* Vertical line */}
              <div className="h-2 w-px ml-[10%] bg-gray-300" />
              <Input
                disabled={tab === "By Item"}
                type="number"
                min="0"
                max="5"
                placeholder="Max"
                className={clsx(
                  "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 z-10"
                )}
              />
            </div>
          </div>

          {/* Filter by Total Items */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Filter by Total Items
            </label>
            <div className="flex flex-col relative">
              <Input
                disabled={tab === "By Item"}
                type="number"
                min={1}
                placeholder="Min"
                className={clsx(
                  "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 z-10",
                  {
                    "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed opacity-50":
                      tab === "By Item",
                  }
                )}
              />
              {/* Vertical line */}
              <div className="h-2 w-px bg-gray-300 ml-[10%]" />
              <Input
                disabled={tab === "By Item"}
                type="number"
                min={1}
                placeholder="Max"
                className={clsx(
                  "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 z-10"
                )}
              />
            </div>
          </div>
        </div>
        <button
          disabled={tab === "By Item"}
          onClick={async () => {
            setSelected("all");
            setCurrentLocation(null);
            setSearch("");
            await handleFilterImmediately("", "all", undefined, null);
          }}
          className={clsx(
            "w-full flex gap-2 items-center text-gray-700 justify-center max-[850px]:py-2 min-[850px]:h-20 max-[850px]:mt-2 bg-gray-200 max-[850px]:rounded-full min-[850px]:rounded-b-2xl",
            {
              "cursor-not-allowed": tab === "By Item",
              "cursor-pointer": tab !== "By Item",
            }
          )}
        >
          <RefreshCcw className="w-5 h-5" />
          Reset Filters
        </button>
      </div>
    );
  };
  return (
    <div className="w-full relative">
      <PageHeader
        title={"Vendor Directory"}
        button={[
          {
            onClick: () => {
              view === "grid" ? setView("list") : setView("grid");
            },
            icon: view === "list" ? LayoutGrid : List,
            bgColor: "bg-blue-600",
          },
        ]}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <AnimatePresence>
          {vendorDetails && (
            <VendorProfile
              profile={selectedVendor}
              transactions={transactions}
              close={() => setVendorDetails(false)}
            />
          )}
        </AnimatePresence>
      )}
      {/* Mobile Tabs */}
      <div className="min-[450px]:hidden sticky top-20 z-14 w-full">
        <SegmentSlider
          onClick={handleTabChange}
          items={items}
          selected={selectedTabIndex}
          setSelected={setSelectedTabIndex}
          className={"w-full"}
          className2={"border-b-4 border-white"}
          vendorDirectory={true}
          className3={"flex-1"}
        />
        <ConfigProvider
          theme={{
            token: {
              // colorPrimary: "#E5E7EB", // Tailwind gray-200
              controlOutline: "transparent", // removes glow effect
              colorBorder: "transparent",
              borderRadius: 0,
            },
            components: {
              Select: {
                selectorBg: "#E5E7EB",
                hoverBorderColor: "transparent",
                activeBorderColor: "transparent",
              },
            },
          }}
        >
          <Select
            options={[
              { value: "all", label: "All Vendors" },
              { value: "active", label: "Active Vendors" },
              { value: "inactive", label: "Inactive Vendors" },
            ]}
            className="h-11! w-full! border-y border-gray-300"
            defaultValue={"all"}
            onChange={(value) => {
              setSelected(value);
              handleFilterImmediately(search, value);
            }}
          />
        </ConfigProvider>
      </div>

      <div className="hidden min-[450px]:block min-[850px]:hidden">
        <Popover
          placement="left"
          content={() => <SidebarFilter className="" />}
          trigger={"click"}
          className=""
        >
          <div className="fixed right-5 border bg-gray-100 p-2 rounded-full z-14 top-[calc(50vh-20.665px)] border-gray-300 ">
            <Funnel
              className="font-semibold text-gray-600"
              strokeWidth={1.4}
              size={24}
            />
          </div>
        </Popover>
      </div>
      <div className="flex relative">
        <div className="w-0 flex-grow p-3">
          <div className="flex justify-end items-center">
            {/* Tabs */}
            <div className="space-x-2 mb-3 border max-[450px]:hidden border-gray-200 bg-white rounded-lg p-1 shadow w-fit">
              {items.map((t) => (
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

                    if (t === "By Item") {
                      setSearch("");
                      setSelected("all");
                    }
                    if (t === "All") {
                      // Restore full original vendor list first
                      setVendors(originalVendorsRef.current);
                      await handleFilterImmediately(search, selected, "All");
                    }
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          {!itemSearchVendorResult && (
            <>
              <div className={tab === "By Category" ? "block" : "hidden"}>
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
              </div>

              {/* Vendor Cards */}
              {tab !== "By Item" ? (
                <>
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
                        "gap-3",
                        view === "grid"
                          ? [
                              "grid grid-cols-1 min-[482px]:grid-cols-2 min-[675px]:grid-cols-3",
                              isOpen
                                ? "min-[850px]:grid-cols-2 min-[960px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1260px]:grid-cols-3 min-[1500px]:grid-cols-4"
                                : "min-[850px]:grid-cols-2 min-[960px]:grid-cols-3 min-[1500px]:grid-cols-4",
                            ]
                          : "flex flex-col gap-4"
                      )}
                    >
                      {paginatedVendors.length === 0 ? (
                        <span className="text-gray-500 h-[calc(100vh-280px)] flex justify-center pt-[50%] col-span-4 text-center py-4">
                          No items found in this category
                        </span>
                      ) : (
                        paginatedVendors.map((vendor, index) => (
                          <motion.div
                            key={vendor.vendor_id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <VendorCard
                              key={vendor.vendor_id}
                              vendor={vendor}
                              view={view}
                              displayVendorDetails={async () => {
                                const data = await fetchVendorById(
                                  vendor.vendor_id
                                );
                                const purchaseData =
                                  await fetchPurchaseRecordByVendor(
                                    vendor.vendor_id
                                  );
                                setSelectedVendor(data);
                                setTransactions(purchaseData);
                                setVendorDetails(true);
                              }}
                            />
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {paginatedVendors.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <button
                        className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(p - 1, 1));
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
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
                              window.scrollTo({ top: 0, behavior: "smooth" });
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
                </>
              ) : (
                <>
                  <h2 className="mb-4 ml-4 text-base font-semibold text-gray-700">
                    Inventory List – Select an Item to View Vendors
                  </h2>
                  <InventoryGridLayout
                    products={products}
                    loading={inv_loading}
                    page={page}
                    setPage={setPage}
                    onProductClick={async (item_id) => {
                      const result = await fetchVendorByItem(item_id);
                      setVendors(result);
                      setSelectedItemId(item_id);
                      setItemSearchVendorResult(true);
                    }}
                  />
                </>
              )}
            </>
          )}

          {itemSearchVendorResult && (
            <>
              <div className="flex justify-between items-center mb-3">
                <div className=" py-2 px-4 gap-3 bg-white border border-gray-200 rounded-xl flex items-center">
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
                  <div className="relative inline-block group">
                    <button
                      onClick={() => {
                        setVendorList(originalVendorsRef.current);
                        setShowVendorModal(true);
                      }}
                      className="p-1.5 flex bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="absolute left-1/2 bottom-full z-1000 mb-2 w-max px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 pointer-events-none transform -translate-x-1/2 group-hover:opacity-100 transition-opacity">
                      Add Vendor
                    </span>
                  </div>
                </div>
              </div>

              {vendorLoading ? (
                /* loading spinner*/
                <LoadingSpinner />
              ) : paginatedVendors.length > 0 ? (
                <div
                  className={clsx(
                    "gap-3",
                    view === "grid"
                      ? [
                          "grid grid-cols-1 min-[482px]:grid-cols-2 min-[675px]:grid-cols-3",
                          isOpen
                            ? "min-[850px]:grid-cols-2 min-[960px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1260px]:grid-cols-3 min-[1500px]:grid-cols-4"
                            : "min-[850px]:grid-cols-2 min-[960px]:grid-cols-3 min-[1500px]:grid-cols-4",
                        ]
                      : "flex flex-col gap-4"
                  )}
                >
                  {paginatedVendors.map((vendor, idx) => (
                    <motion.div
                      key={vendor.vendor_id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <VendorCard
                        vendor={vendor}
                        view={view}
                        displayVendorDetails={async () => {
                          const data = await fetchVendorById(vendor.vendor_id);
                          const purchaseData =
                            await fetchPurchaseRecordByVendor(vendor.vendor_id);
                          setSelectedVendor(data);
                          setTransactions(purchaseData);
                          setVendorDetails(true);
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
                  <button
                    onClick={() => {
                      setVendorList(originalVendorsRef.current);
                      setShowVendorModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Add Vendor
                  </button>
                </div>
              )}

              {/* Pagination */}
              {paginatedVendors.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(p - 1, 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
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
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(vendors.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage >= Math.ceil(vendors.length / itemsPerPage)
                    }
                    className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Modal: list of all vendors */}
              {showVendorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg h-[50vh] w-[32vw] relative">
                    <div className="relative w-full mb-4">
                      <Search className="absolute left-3 top-[13px] w-4 h-4 text-gray-500" />
                      <input
                        className="pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={"Search vendors..."}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          debouncedSearch2(e.target.value);
                        }}
                      />
                    </div>

                    {vendorList.length === 0 ? (
                      <ul className=" overflow-y-auto menu space-y-2">
                        <li className="text-gray-500 italic flex items-center">
                          Nothing matches your search. Try different keywords.
                        </li>
                      </ul>
                    ) : (
                      <ul className="max-h-[calc(100%-100px)] overflow-y-auto menu">
                        {vendorList.map((v) => (
                          <li
                            key={v.vendor_id}
                            className="border-b px-2 border-gray-200 text-gray-700 py-2 hover:bg-gray-100 transition-all duration-150"
                            onClick={async () => {
                              const data = {
                                item_id: selectedItemId,
                                vendor_id: v.vendor_id,
                              };
                              setShowVendorModal(false);
                              await addItemToVendor(data);
                              const result = await fetchVendorByItem(
                                data.item_id
                              );
                              setSearch("");
                              setVendors(result);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{v.name}</span>
                              {!v.is_active && (
                                <div className="bg-red-500 flex items-center justify-center text-white px-1 text-[13px] border border-red-300 rounded-xl">
                                  <span>inactive</span>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 px-4 py-2 text-white">dummy space</div>
                    <button
                      onClick={() => {
                        setSearch("");
                        setShowVendorModal(false);
                      }}
                      className="absolute bottom-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <SidebarFilter
          className={
            "max-[850px]:hidden min-[850px]:flex min-[850px]:sticky z-10 top-23 bg-white self-start mr-3 my-3 min-[850px]:h-[calc(100vh-104px)]"
          }
        />
      </div>
    </div>
  );
}
