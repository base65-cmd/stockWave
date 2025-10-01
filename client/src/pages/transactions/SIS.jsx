import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ProductCard from "../../common/components/ProductCard";
import {
  Eye,
  MinusCircle,
  PlusCircle,
  Printer,
  RotateCcw,
  Save,
  Scroll,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useInventoryStore } from "../../stores/useInventoryStore";
import HorizontalScrollContainer from "../../common/components/HorizontalScrollContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatchStore } from "../../stores/useDispatchStore";
import LocationToggle from "../../common/components/LocationToggle";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  Select,
  Space,
  ConfigProvider,
  DatePicker,
  Input,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import useWindowWidth from "../../common/components/useWindowWidth";

const SIS = () => {
  const [quantity, setQuantity] = useState({});
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentID, setCurrentID] = useState("");
  const [allDispatchedItems, setAllDispatchedItems] = useState([]);
  const [vesselList, setVesselList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const categoryScrollRef = useRef(null);
  const { username, user_id } = useAuthStore();
  const scrollRef = useRef(null);
  const windowWidth = useWindowWidth();
  const {
    fetchLocations,
    locations,
    fetchVessels,
    fetchDepartments,
    addDispatchRecord,
    fetchAllDispatchRecords,
    fetchAllDispatchedItems,
  } = useDispatchStore();

  const {
    fetchAllCategories,
    fetchInventoryByCategory,
    allCategories,
    inventory,
    fetchAllInventory,
  } = useInventoryStore();

  const [formData, setFormData] = useState({
    user_id: user_id,
    destination_type: null,
    destination_id: "",
    // date: new Date().toISOString().split("T")[0],
    date: "",
    ref_number: "",
    notes: "",
    dispatch: [],
  });

  // Code to get Change Items per page depending on width of window
  function getItemsPerPage(width) {
    if (width < 480) return 10;
    if (width < 768) return 20;
    if (width < 1024) return 50;
    return 100;
  }

  function useItemsPerPage() {
    const [itemsPerPage, setItemsPerPage] = useState(() =>
      typeof window !== "undefined" ? getItemsPerPage(window.innerWidth) : 100
    );

    useEffect(() => {
      let raf = 0;
      const onResize = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          setItemsPerPage(getItemsPerPage(window.innerWidth));
        });
      };
      window.addEventListener("resize", onResize);
      // set once in case something changed before listener attached
      onResize();
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
      };
    }, []);

    return itemsPerPage;
  }

  const itemsPerPage = useItemsPerPage();

  const totalPages = useMemo(
    () => Math.ceil(products.length / itemsPerPage),
    [products]
  );

  const addInventory = (id) => {
    const product = products.find((p) => p.stock_id === id);
    if (!product) return;

    setItems((prev) => {
      const exists = prev.find((item) => item.stock_id === id);
      if (exists) return prev;
      return [...prev, product];
    });

    setFormData((prev) => ({
      ...prev,
      dispatch: [
        ...prev.dispatch,
        {
          stock_id: product.stock_id,
          item_id: product.item_id,
          quantity: 1,
          location: location,
          remarks: "",
        },
      ],
    }));

    setQuantity((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const increaseQuantity = (id) => {
    setQuantity((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setFormData((prev) => {
      const updatedDispatch = prev.dispatch.map((item) => {
        if (item.stock_id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      return { ...prev, dispatch: updatedDispatch };
    });
  };

  const decreaseQuantity = (id) => {
    setQuantity((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const updatedItems = items.filter((item) => item.stock_id !== id);
        setItems(updatedItems);
        const newQty = { ...prev };
        delete newQty[id];
        return newQty;
      }
      return { ...prev, [id]: current - 1 };
    });
    setFormData((prev) => {
      const updatedDispatch = prev.dispatch.map((item) => {
        if (item.stock === id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      return { ...prev, dispatch: updatedDispatch };
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.stock_id !== id));
    setQuantity((prev) => {
      const newQty = { ...prev };
      delete newQty[id];
      return newQty;
    });
    setFormData((prev) => ({
      ...prev,
      dispatch: prev.dispatch.filter((item) => item.stock_id !== id),
    }));
  };

  // Fetch All Inventory, vessels, locations, departments, categories
  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCategories();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchAllInventory();
      const filteredData = data.filter(
        (item) =>
          item.location?.toString().toLowerCase() === location.toLowerCase()
      );
      setProducts(filteredData);

      setCurrentPage(1);

      await fetchLocations();
      const fetchedVessels = await fetchVessels();
      const fetchedDepartments = await fetchDepartments();

      const vessel_list = fetchedVessels.map((vessel) => ({
        value: vessel.vessel_id,
        label: vessel.vessel_name,
      }));
      setVesselList(vessel_list);

      const department_list = fetchedDepartments.map((department) => ({
        value: department.department_id,
        label: department.department_name,
      }));
      setDepartmentList(department_list);
      const fetchedDispatchItems = await fetchAllDispatchedItems();
      setAllDispatchedItems(fetchedDispatchItems);

      const startTime = Date.now();
      const elapsed = Date.now() - startTime;
      const remainingTime = 2000 - elapsed;
      if (remainingTime > 0) {
        await new Promise((res) => setTimeout(res, remainingTime));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchAllDispatchRecords();
      setCurrentID(res[0]["dispatch_id"] + 1);
    };
    fetchData();
  }, [products]);

  // End of Use Effects
  const [location, setLocation] = useState("Zyra");
  const handleCategoryChange = async (
    category,
    overrideLocation = location,
    setCategory = true
  ) => {
    if (setCategory) {
      setActiveCategory(category);
    }
    setCurrentPage(1);

    const filterByLocation = (items) => {
      return items.filter(
        (item) =>
          item.location?.toString().toLowerCase() ===
          overrideLocation.toString().toLowerCase()
      );
    };

    const filterBySearch = (items) => {
      const s = search.toLowerCase().trim();
      if (!s) return items;

      return items.filter(
        (item) =>
          (item.name?.toLowerCase().includes(s) ?? false) ||
          (item.part_number?.toLowerCase().includes(s) ?? false)
      );
    };

    let baseItems;

    if (category === "All") {
      baseItems = inventory;
    } else {
      baseItems = await fetchInventoryByCategory(category);
    }

    const filtered = filterBySearch(filterByLocation(baseItems));
    setProducts(filtered);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      const s = value.toLowerCase();
      const filteredItems = inventory.filter((item) => {
        const matchesSearch =
          (item.name?.toLowerCase().includes(s) ?? false) ||
          (item.part_number?.toLowerCase().includes(s) ?? false);

        const matchesLocation =
          item.location?.toString().toLowerCase() === location.toLowerCase();

        return matchesSearch && matchesLocation;
      });

      setProducts(filteredItems);
      setCurrentPage(1);
    }, 300),
    [inventory, location]
  );

  const handleSubmit = async () => {
    if (
      !formData.destination_type ||
      !formData.destination_id ||
      !formData.date ||
      items.length === 0
    ) {
      alert("Please fill in all required fields and add items to dispatch.");
      return;
    }
    await addDispatchRecord(formData);

    setItems([]);
    setQuantity({});
    setFormData({
      user_id: 3,
      destination_type: null,
      destination_id: "",
      // date: new Date().toISOString().split("T")[0],
      date: "",
      ref_number: "",
      notes: "",
      dispatch: [],
    });

    // 🔄 Refetch inventory for current location
    const data = await fetchAllInventory();
    const filteredData = data.filter(
      (item) =>
        item.location?.toString().toLowerCase() === location.toLowerCase()
    );
    setProducts(filteredData);
    setCurrentPage(1);
    setActiveCategory("All");

    // Scroll to the beginning
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollToStart();
    }
  };

  const paginatedProducts = useMemo(
    () =>
      products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [products, currentPage, itemsPerPage]
  );

  const getLocationSummary = (items) => {
    const locationCounts = items.reduce((acc, item) => {
      const loc = item.location;
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});

    const locations = Object.keys(locationCounts);

    if (locations.length === 1) {
      // Only one location
      return locations[0];
    }

    // Multiple locations — return with counts
    return (
      locations.map((loc) => `${loc} (${locationCounts[loc]})`).join(", ") ||
      "--"
    );
  };

  return (
    <div>
      {/* <PageHeader title="Stock Issuance System" /> */}
      <div className="grid grid-cols-1 min-[910px]:grid-cols-2 rounded-lg bg-white min-[910px]:h-[calc(100vh-80px)]">
        {/* First Column */}
        <div
          ref={scrollRef}
          className="relative px-6 pb-6 border-r  border-gray-200 overflow-y-scroll menu"
        >
          {windowWidth <= 900 && (
            <div className="fixed z-100 top-26 bg-gray-100 right-6 rounded border px-3 py-1 border-gray-300">
              <p className="font-semibold text-gray-700 text-sm">
                Items: <span className="font-normal">{items.length}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 mt-6 mb-3 xl:flex xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome, {username}
              </h2>
              <p className="text-sm text-gray-500 mb-2">December 24, 2024</p>
            </div>
            <div className="flex flex-col min-[430px]:flex-row justify-between min-[430px]:items-center gap-2">
              <Input
                type="text"
                placeholder="⌕ Search"
                className="text-sm px-3 py-1.5 max-w-[191.58px] rounded-md border border-gray-200 bg-white text-black placeholder:text-gray-400 font-medium tracking-wide"
                onChange={(e) => {
                  setSearch(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                value={search}
              />
              <div className="">
                <LocationToggle
                  value={location}
                  locations={locations}
                  onChange={(newLoc) => {
                    setLocation(newLoc);
                    handleCategoryChange(activeCategory, newLoc);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mb-6 pb-1">
            <HorizontalScrollContainer
              activeIndex={allCategories.findIndex(
                (cat) => cat.name === activeCategory
              )}
              ref={categoryScrollRef}
              className={"overflow-x-scroll"}
            >
              <button
                className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${
                  activeCategory === "All"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300"
                }`}
                onClick={() => handleCategoryChange("All")}
              >
                All
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300`}
              >
                Popular
              </button>
              {allCategories.map((cat, i) => (
                <button
                  key={i}
                  className={`px-4 py-1.5 rounded-full text-sm text-nowrap cursor-pointer ${
                    activeCategory === cat.name
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300"
                  }`}
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </HorizontalScrollContainer>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-600">Processing...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2  min-[650px]:grid-cols-3 min-[910px]:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 select-none">
              {paginatedProducts.length === 0 ? (
                <span className="text-gray-500 col-span-4 text-center py-4">
                  No items found in this category
                </span>
              ) : (
                paginatedProducts.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <ProductCard
                      key={i}
                      name={item.name}
                      icon={item.category}
                      quantity={item.quantity}
                      part_number={item.part_number}
                      on_click={() => addInventory(item.stock_id)}
                      selected={items.some((i) => i.stock_id === item.stock_id)}
                      on_remove={() => removeItem(item.stock_id)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="mt-4 flex justify-between w-full items-center gap-4">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  windowWidth >= 1024
                    ? scrollRef.current?.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    : window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                  windowWidth >= 1024
                    ? scrollRef.current?.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    : window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Second Column */}
        {/* Order Details */}
        <div className="w-full overflow-y-scroll menu">
          <div className="space-y-4 p-6 border-b border-gray-200">
            <div className="bg-[#f9fafc] p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold">Dispatch List</h3>
              <p className="text-sm text-gray-500">{`Transaction ID : SSL/DR/${currentID} `}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <ConfigProvider
                  theme={{
                    token: {
                      // colorPrimary: "#E5E7EB", // Tailwind gray-200
                      controlOutline: "transparent", // removes glow effect
                      controlPaddingHorizontal: 6,
                      controlHeight: 37.33,
                      colorBorder: "#E5E7EB",
                    },
                  }}
                >
                  <Space direction="vertical">
                    <DatePicker
                      value={formData.date ? dayjs(formData.date) : null}
                      onChange={(_, dateString) => {
                        setFormData((prev) => ({
                          ...prev,
                          date: dateString,
                        }));
                      }}
                      className="w-full"
                    />
                  </Space>
                </ConfigProvider>
              </div>
              <div>
                <ConfigProvider
                  theme={{
                    token: {
                      // colorPrimary: "#E5E7EB", // Tailwind gray-200
                      controlOutline: "transparent", // removes glow effect
                      controlPaddingHorizontal: 6,
                      controlHeight: 37.33,
                      colorBorder: "#E5E7EB",
                    },
                  }}
                >
                  <Input
                    placeholder="Ref Number"
                    type="text"
                    className="w-full border border-gray-200 focus:outline-1 p-1.5 rounded-md"
                    value={formData.ref_number}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        ref_number: e.target.value,
                      }));
                    }}
                  />
                </ConfigProvider>
              </div>
              <div>
                <ConfigProvider
                  theme={{
                    token: {
                      // colorPrimary: "#E5E7EB", // Tailwind gray-200
                      controlOutline: "transparent", // removes glow effect
                      controlPaddingHorizontal: 6,
                      controlHeight: 37.33,
                      colorBorder: "#E5E7EB",
                    },
                  }}
                >
                  <Select
                    options={[
                      { value: "vessel", label: "Vessel" },
                      {
                        value: "department",
                        label: "Department",
                      },
                    ]}
                    value={formData.destination_type}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        destination_type: value,
                      }));
                    }}
                    placeholder="Vessel/Department"
                    className="w-full"
                  />
                </ConfigProvider>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <ConfigProvider
                  theme={{
                    token: {
                      // colorPrimary: "#E5E7EB", // Tailwind gray-200
                      controlOutline: "transparent", // removes glow effect
                      controlPaddingHorizontal: 6,
                      controlHeight: 37.33,
                      colorBorder: "#E5E7EB",
                    },
                  }}
                >
                  {/* Vessel or Department based on selection */}
                  {formData.destination_type === null && (
                    <Select
                      options={[{ value: "--", label: "--" }]}
                      className="w-full"
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          destination_id: value,
                        }));
                      }}
                      placeholder="Select a type above"
                    />
                  )}
                  {formData.destination_type === "vessel" && (
                    <Select
                      className="w-full"
                      options={vesselList}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          destination_id: value,
                        }));
                      }}
                      placeholder="Choose a Vessel"
                    />
                  )}
                  {formData.destination_type === "department" && (
                    <Select
                      options={departmentList}
                      className="w-full"
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          destination_id: value,
                        }));
                      }}
                      placeholder="Choose a Department"
                    />
                  )}
                </ConfigProvider>
              </div>
            </div>

            <div className="col-span-3">
              <Input.TextArea
                className="w-full border focus:outline-1 border-gray-200 p-1.5 rounded-md "
                rows="2"
                placeholder="Add any additional notes here..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#f8f8f8] to-[#fefefe] p-6 border-b border-gray-200">
            <h4 className="font-semibold ml-5 text-lg text-gray-800 mb-2">
              Dispatch Details
            </h4>
            <div className="space-y-4 overflow-x-auto categories">
              {items.length !== 0 ? (
                <table className="min-w-full table-fixed text-left border-separate border-spacing-y-3 border-spacing-x-5 text-sm">
                  <thead>
                    <tr className="text-nowrap">
                      <th>Item Description</th>
                      <th>Part Number</th>
                      <th>Quantity</th>
                      <th>Location</th>
                      <th>Remark</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {items.map((item, i) => (
                        <motion.tr
                          key={item.stock_id}
                          className="text-left align-top"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="align-middle">
                            <div
                              className="relative w-[150px]"
                              onMouseEnter={() => setHoveredRow(item.stock_id)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <Tooltip
                                title={() => (
                                  <>
                                    <p>{item.name}</p>
                                    {formData.destination_id && (
                                      <p className="tw:text-white">
                                        {(() => {
                                          const latest = allDispatchedItems
                                            .filter((el) => {
                                              let destinationName = "";

                                              if (
                                                formData.destination_type ===
                                                "vessel"
                                              ) {
                                                const vessel = vesselList.find(
                                                  (item) =>
                                                    item.value ===
                                                    formData.destination_id
                                                );
                                                destinationName = vessel
                                                  ? vessel.label
                                                  : "";
                                              } else if (
                                                formData.destination_type ===
                                                "department"
                                              ) {
                                                const dept =
                                                  departmentList.find(
                                                    (item) =>
                                                      item.value ===
                                                      formData.destination_id
                                                  );
                                                destinationName = dept
                                                  ? dept.label
                                                  : "";
                                              }

                                              return (
                                                el.stock_id === item.stock_id &&
                                                el.destination_name ===
                                                  destinationName
                                              );
                                            })
                                            .sort(
                                              (a, b) =>
                                                new Date(b.dispatch_date) -
                                                new Date(a.dispatch_date)
                                            )
                                            ?.at(0);

                                          return latest
                                            ? `Last Given: ${new Date(
                                                latest.dispatch_date
                                              ).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })} (Quantity: ${
                                                latest.quantity
                                              })`
                                            : "Last Given: No previous entry";
                                        })()}
                                      </p>
                                    )}
                                  </>
                                )}
                                placement={
                                  itemsPerPage === 10 ? "bottom" : "right"
                                }
                              >
                                <span className="truncate block cursor-pointer">
                                  {item.name}
                                </span>
                              </Tooltip>
                              <span className="text-[13px] text-gray-500 block">
                                In Stock: {item.quantity}
                              </span>
                            </div>
                          </td>

                          <td className="text-nowrap">{item.part_number}</td>

                          <td>
                            <div className="rounded-lg p-1 bg-[#e6eaed] flex items-center justify-around select-none">
                              <MinusCircle
                                className="w-4 h-4 hover:text-blue-500 cursor-pointer"
                                onClick={() => decreaseQuantity(item.stock_id)}
                              />
                              <input
                                className="w-12 text-center rounded border-gray-300 text-sm"
                                value={quantity[item.stock_id] ?? ""}
                                onChange={(e) =>
                                  setQuantity((prev) => ({
                                    ...prev,
                                    [item.stock_id]: e.target.value,
                                  }))
                                }
                                onBlur={() => {
                                  const raw = quantity[item.stock_id];
                                  const num = parseInt(raw, 10);
                                  if (!isNaN(num) && num > 0) {
                                    setQuantity((prev) => ({
                                      ...prev,
                                      [item.stock_id]: num,
                                    }));
                                    setFormData((prev) => {
                                      const updatedDispatch = prev.dispatch.map(
                                        (dispatchItem) => {
                                          if (
                                            dispatchItem.stock_id ===
                                            item.stock_id
                                          ) {
                                            return {
                                              ...dispatchItem,
                                              quantity: num,
                                            };
                                          }
                                          return dispatchItem;
                                        }
                                      );
                                      return {
                                        ...prev,
                                        dispatch: updatedDispatch,
                                      };
                                    });
                                  } else {
                                    removeItem(item.stock_id);
                                  }
                                }}
                                style={{
                                  MozAppearance: "textfield",
                                  WebkitAppearance: "none",
                                  appearance: "textfield",
                                }}
                              />
                              <PlusCircle
                                className="w-4 h-4 hover:text-blue-500 cursor-pointer"
                                onClick={() => increaseQuantity(item.stock_id)}
                              />
                            </div>
                          </td>

                          <td>
                            {item.location === locations[0]?.location_name
                              ? locations[0]?.location_name
                              : locations[1]?.location_name}
                          </td>
                          <td>
                            <ConfigProvider
                              theme={{
                                token: {
                                  // colorPrimary: "#E5E7EB", // Tailwind gray-200
                                  controlOutline: "transparent", // removes glow effect
                                  controlPaddingHorizontal: 6,
                                  controlHeight: 35,
                                  colorBorder: "#E5E7EB",
                                },
                              }}
                            >
                              <Input className="border w-25! rounded border-gray-200" />
                            </ConfigProvider>
                          </td>
                          <td>
                            <Trash2
                              className="w-[16px] h-[16px] hover:text-red-500 cursor-pointer"
                              onClick={() => removeItem(item.stock_id)}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center my-10">
                  <img
                    src="/images/empty-cart.webp"
                    alt="empty cart"
                    className="w-45 h-45"
                  />
                  <p className="font-semibold">No Items Selected</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#f9fafc] p-4 text-sm">
            <div className="0">
              {/* Summary Info */}
              <div>
                <div className="space-y-4 bg-white rounded border border-gray-200">
                  <div className="flex justify-between px-6 pt-3">
                    {/* Destination Name */}
                    <div className=" text-[15px]">
                      {(formData.destination_type !== null &&
                        formData.destination_type
                          .toLowerCase()
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")) ||
                        "Vessel/Department"}
                    </div>
                    <div className="text-end text-[15px]">
                      {" "}
                      {formData.destination_type === "vessel"
                        ? vesselList.find(
                            (v) => v.value == formData.destination_id
                          )?.label || "--"
                        : formData.destination_type === "department"
                        ? departmentList.find(
                            (d) => d.value == formData.destination_id
                          )?.label || "--"
                        : "--"}
                    </div>
                  </div>
                  <div className="flex justify-between px-6">
                    {/* Location Summary */}
                    <div className=" text-[15px]">Location</div>
                    <div className="text-end  text-[15px]">
                      {" "}
                      {getLocationSummary(items)}
                    </div>
                  </div>
                  {/* Total Items */}
                  <div className="flex justify-between px-6">
                    <div className=" text-[15px]">Total Items</div>
                    <div className="text-end  text-[15px]">{items.length}</div>
                  </div>
                  {/* Total Quantity */}
                  <div className=" bg-[#e6eaed] flex justify-between px-6 py-3">
                    <div className="text-[16px] font-semibold">
                      Total Quantity
                    </div>
                    <div className="text-end text-[16px] font-semibold">
                      {Object.values(quantity).reduce(
                        (sum, val) => sum + Number(val || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 min-[600px]:grid-cols-2 xl:grid-cols-3 gap-3 pt-4">
                <button
                  className="bg-green-100 gap-2 flex items-center justify-center text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200"
                  onClick={() => {
                    // optional: export logic or show manifest
                  }}
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>

                <button
                  className="bg-red-100 flex gap-2 items-center justify-center text-red-700 border border-red-300 px-4 py-2 rounded hover:bg-red-200"
                  onClick={() => {
                    setItems([]);
                    setQuantity({});
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  className="bg-blue-100 text-blue-700 gap-2 flex items-center justify-center border border-blue-300 px-4 py-2 rounded hover:bg-blue-200"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                <button
                  className="bg-indigo-100 flex items-center gap-2 justify-center text-indigo-700 border border-indigo-300 px-4 py-2 rounded hover:bg-indigo-200"
                  onClick={() => {
                    // optional: export logic or show manifest
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Preview Manifest
                </button>

                <button
                  className="bg-orange-100 flex items-center gap-2 justify-center text-orange-700 border border-orange-300 px-4 py-2 rounded hover:bg-orange-200"
                  onClick={() => {
                    // optional: export logic or show manifest
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Dispatch
                </button>

                <button
                  className="bg-amber-100 flex items-center gap-2 justify-center text-amber-700 border border-amber-300 px-4 py-2 rounded hover:bg-amber-200"
                  onClick={() => {
                    // optional: export logic or show manifest
                  }}
                >
                  <Scroll className="w-4 h-4" />
                  Issue Log
                </button>
              </div>

              {/* Submit Button */}
              <button
                className="bg-green-600 mt-4 w-full text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSubmit}
              >
                Add to Dispatch
              </button>
            </div>
          </div>
        </div>
        {/* /Order Details */}
      </div>
    </div>
  );
};

export default SIS;
