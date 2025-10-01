import React, { useMemo, useState, useEffect } from "react";
import { ChartCandlestick, ChevronDown, Info } from "lucide-react";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { useParams } from "react-router-dom";
import { Input, Select } from "antd";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "NGN", name: "Naira", symbol: "₦" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
];

function CreateItem({ mode = "create", data }) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [productContent, setProductContent] = useState({
    productInfo: true,
    productDetails: true,
  });

  const [stockEntry, setStockentry] = useState(
    data?.stock_entries?.length || 1
  );

  // Initialize form state with data or default values
  const [form, setForm] = useState({
    name: data?.name || "",
    part_number: data?.part_number || "",
    description: data?.description || "",
    barcode: data?.barcode || "",
    price: data?.price[data?.price.length - 1] || "",
    currency: data?.currency || null,
    category: data?.category || null,
    user_id: data?.user_id || 3,
    stock_entries: [
      {
        stock_id: data?.stock_id || "",
        location: data?.location || null,
        shelf: data?.shelf || null,
        quantity: data?.quantity || 0,
      },
    ],
  });

  const {
    createInventory,
    allCategories,
    fetchAllCategories,
    updateInventory,
    fetchLocations,
    locations,
  } = useInventoryStore();

  useEffect(() => {
    if (mode === "create") {
      setForm({
        name: "",
        part_number: "",
        description: "",
        barcode: "",
        price: "",
        currency: null,
        category: null,
        user_id: 3,
        stock_entries: [{ location: null, shelf: null, quantity: 0 }],
      });
    } else if (mode === "edit" || mode === "view") {
      if (data) {
        setForm({
          name: data.name || "",
          part_number: data.part_number || "",
          description: data.description || "",
          barcode: data.barcode || "",
          // price: data.price[data?.price.length - 1] || "",
          currency: data.currency || null,
          category: data.category || null,
          user_id: data.user_id || 3,
          stock_entries: [
            {
              stock_id: data?.stock_id || "",
              location: data?.location || null,
              shelf: data?.shelf || null,
              quantity: data?.quantity || 0,
            },
          ],
        });
      }
    }
  }, [mode, data]);

  useEffect(() => {
    if ((mode === "view" || mode === "edit") && data?.location) {
      setSelectedStore(data.location);
    }
  }, [mode, data]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCategories();
      await fetchLocations();
    };
    fetchData();
  }, []);

  const closeProductContent = (id) => {
    setProductContent((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle Currency Change Dynamically on the price entry
  const handleCurrencyChange = (value) => {
    const currency = value;
    setForm((prev) => ({ ...prev, currency: currency }));
  };
  const getCurrencySymbol = (code) => {
    const match = currencies.find((c) => c.code === code);
    return match ? match.symbol : "";
  };

  const formatPrice = (value) => {
    const clean = value.replace(/[^0-9.]/g, ""); // remove non-numeric
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPrice(raw);
    setForm((prev) => ({ ...prev, price: formatted }));
  };

  // Fetches shelf locations
  const fetchShelfLocations = useInventoryStore(
    (state) => state.fetchShelfLocations
  );
  const shelfLocations = useInventoryStore((state) => state.shelfLocations);

  useEffect(() => {
    fetchShelfLocations();
  }, []);

  const groupedShelves = useMemo(() => {
    const grouped = {};
    shelfLocations.forEach(({ location_name, shelf_code }) => {
      const key = location_name.toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(shelf_code);
    });
    return grouped;
  }, [shelfLocations]);

  const ShelfLocations1 =
    groupedShelves[locations[0]?.location_name?.toLowerCase()] || [];
  const ShelfLocations2 =
    groupedShelves[locations[1]?.location_name?.toLowerCase()] || [];

  // Barcode Generation
  const generateBarcode = () => {
    const length = 12; // standard EAN-13 or UPC-A length minus check digit
    let barcode = "";
    for (let i = 0; i < length; i++) {
      barcode += Math.floor(Math.random() * 10);
    }
    return barcode;
  };

  // Handle Submit
  const { id } = useParams();
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formEl = event.target; // the actual form element
    if (!formEl.checkValidity()) {
      formEl.reportValidity(); // show native validation messages
      return;
    }

    const formCheck = event.target.closest("form"); // get the form element
    if (!formCheck.checkValidity()) {
      formCheck.reportValidity(); // show validation messages
      return; // stop submission
    }

    if (mode === "edit") {
      updateInventory(id, form);
    } else if (mode === "create") {
      createInventory(form);
    }
  };

  const isViewMode = mode === "view";
  const buttonText =
    mode === "create" ? "Add Product" : mode === "edit" ? "Edit Product" : "";
  return (
    <div className="create-item">
      <div className="p-3">
        <form onSubmit={handleSubmit}>
          {/* Product Info Section */}
          <div className="bg-white border border-gray-200 rounded-md mb-8 transition-all duration-300">
            <h2 className="flex items-center justify-between gap-2 text-gray-800 font-semibold text-base border-b border-gray-200 px-4 py-3">
              <div className="flex gap-2.5 items-center">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Product Information</span>
              </div>
              <ChevronDown
                onClick={() => closeProductContent("productInfo")}
                className="cursor-pointer"
              />
            </h2>
            <div
              className={`${
                !productContent.productInfo
                  ? "max-h-0 opacity-0 overflow-hidden"
                  : "max-h-[500px] max-[768px]:max-h-[655px] opacity-100"
              } transition-all duration-300`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4 text-gray-800">
                <div className="flex flex-col">
                  <label className="mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="product-name"
                    required
                    disabled={mode === "view"}
                    value={form.name}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    className="border h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1">
                    Part Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="part-number"
                    required
                    value={form.part_number}
                    disabled={mode === "view"}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        part_number: e.target.value,
                      }));
                    }}
                    className="border h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 px-4 text-gray-800">
                <div className="flex flex-col">
                  <label className="mb-1">Description</label>
                  <Input.TextArea
                    id="Description"
                    value={form.description}
                    disabled={mode === "view"}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                    className="border border-gray-200 text-gray-800 p-2 rounded-md text-sm max-h-[5rem]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4 text-gray-800">
                <div className="flex flex-col">
                  <label className="mb-1">
                    Product Category <span className="text-red-500">*</span>
                  </label>
                  {(() => {
                    const categories = allCategories.map((category) => ({
                      value: category.name,
                      label: category.name,
                    }));
                    return (
                      <Select
                        options={categories}
                        id="product-category"
                        required
                        className="h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                        value={form.category}
                        placeholder="Select"
                        disabled={mode === "view"}
                        onChange={(value) => {
                          setForm((prev) => ({
                            ...prev,
                            category: value,
                          }));
                        }}
                      />
                    );
                  })()}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="currency" className="mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  {(() => {
                    const currencyList = currencies.map((currency) => ({
                      value: currency.code,
                      label: `${currency.symbol} - ${currency.name} (${currency.code})`,
                    }));
                    return (
                      <Select
                        options={currencyList}
                        id="currency"
                        name="currency"
                        placeholder="Select"
                        value={form.currency}
                        disabled={mode === "view"}
                        onChange={handleCurrencyChange}
                        required
                        className="h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                      />
                    );
                  })()}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="product-price" className="mb-1">
                    Product Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      {getCurrencySymbol(form.currency)}
                    </span>
                    <Input
                      id="product-price"
                      name="price"
                      required
                      value={form.price}
                      disabled={mode === "view"}
                      onChange={handlePriceChange}
                      className="pl-7 border border-gray-200 text-gray-800 p-2 rounded-md text-sm w-full"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex flex-col relative">
                  <label className="mb-1">
                    Barcode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      className="w-full pr-[5.5rem] border border-gray-200 text-sm p-2 rounded-md"
                      type="text"
                      id="barcode"
                      name="barcode"
                      required
                      disabled={mode === "view"}
                      value={form.barcode}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          barcode: e.target.value,
                        }));
                      }}
                      placeholder="Scan or enter barcode"
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => {
                          const newBarcode = generateBarcode();
                          setForm((prev) => ({
                            ...prev,
                            barcode: newBarcode,
                          }));
                        }}
                        className="absolute right-[3px] px-3 py-[3px] cursor-pointer bg-blue-600 text-white text-sm rounded-md hover:bg-blue-800 transition"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white border border-gray-200 rounded-md mb-8 transition-all duration-300">
            <h2 className="flex items-center justify-between gap-2 text-gray-800 font-semibold text-base border-b border-gray-200 px-4 py-3">
              <div className="flex gap-2.5 items-center">
                <ChartCandlestick className="w-4 h-4 text-blue-500" />
                <span>Product Details</span>
              </div>
              <ChevronDown
                onClick={() => closeProductContent("productDetails")}
                className="cursor-pointer"
              />
            </h2>
            <div
              className={`${
                !productContent.productDetails
                  ? "max-h-0 opacity-0 overflow-hidden"
                  : "max-h-[500px] opacity-100"
              } transition-all duration-300`}
            >
              {(() => {
                const elements = [];
                for (let i = 0; i < stockEntry; i++) {
                  elements.push(
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4 text-gray-800"
                    >
                      <div className="flex flex-col">
                        <label htmlFor={`store-location-${i}`} className="mb-1">
                          Store Location <span className="text-red-500">*</span>
                        </label>
                        <Select
                          id={`store-location-${i}`}
                          options={[
                            {
                              value: locations[0]?.location_name,
                              label: locations[0]?.location_name,
                            },
                            {
                              value: locations[1]?.location_name,
                              label: locations[1]?.location_name,
                            },
                          ]}
                          placeholder="Select"
                          name="store-location"
                          required
                          disabled={mode === "view"}
                          value={form.stock_entries[i]?.location || null}
                          onChange={(value) => {
                            // const value = e.target.value;
                            setSelectedStore(value);
                            setForm((prev) => {
                              const updated = [...prev.stock_entries];
                              updated[i] = {
                                ...updated[i],
                                location: value,
                              };
                              return {
                                ...prev,
                                stock_entries: updated,
                              };
                            });
                          }}
                          className="h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor={`shelf-location-${i}`} className="mb-1">
                          Shelf Location <span className="text-red-500">*</span>
                        </label>
                        {(() => {
                          const PhLocations = ShelfLocations1.map(
                            (location) => ({
                              value: location,
                              label: location,
                            })
                          );
                          const OnneLocations = ShelfLocations2.map(
                            (location) => ({
                              value: location,
                              label: location,
                            })
                          );
                          return (
                            <Select
                              id={`shelf-location-${i}`}
                              options={
                                selectedStore === locations[0]?.location_name
                                  ? PhLocations
                                  : OnneLocations
                              }
                              name="shelf-location"
                              required
                              placeholder="Select"
                              disabled={mode === "view"}
                              className="h-[35px]! border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                              value={form.stock_entries[i]?.shelf || null}
                              onChange={(value) => {
                                // const value = value;
                                setForm((prev) => {
                                  const updated = [...prev.stock_entries];
                                  updated[i] = {
                                    ...updated[i],
                                    shelf: value,
                                  };
                                  return {
                                    ...prev,
                                    stock_entries: updated,
                                  };
                                });
                              }}
                            />
                          );
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor={`product-quantity-${i}`}
                          className="mb-1"
                        >
                          Product Quantity{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id={`product-quantity-${i}`}
                          name="product-quantity"
                          required
                          disabled={mode === "view"}
                          value={form.stock_entries[i]?.quantity || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setForm((prev) => {
                              const updated = [...prev.stock_entries];
                              updated[i] = {
                                ...updated[i],
                                quantity: value,
                              };
                              return {
                                ...prev,
                                stock_entries: updated,
                              };
                            });
                          }}
                          className="border border-gray-200 text-gray-800 p-2 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  );
                }
                return elements;
              })()}
              <div className="mt-4 flex justify-end">
                {!isViewMode && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 m-2 px-4 py-2 rounded-md hover:bg-blue-50 transition"
                    onClick={() => {
                      setStockentry((prev) => (prev < 3 ? prev + 1 : prev));
                    }}
                  >
                    + Add Stock Entry
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          {!isViewMode && (
            <div className="flex justify-end gap-3">
              <button
                type="reset"
                className="border border-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {buttonText}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateItem;
