import { useCallback, useRef, useState } from "react";
import PageHeader from "../../common/components/PageHeader";
import { CircleEqual, Loader2, Save, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useInventoryStore } from "../../stores/useInventoryStore";
import AutocompleteInput from "../../common/components/AutoCompleteInput";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import HorizontalScrollContainer from "../../common/components/HorizontalScrollContainer";
import ProductCard from "../../common/components/ProductCard";
import { debounce } from "lodash";
import { useDispatchStore } from "../../stores/useDispatchStore";
import { usePurchaseStore } from "../../stores/usePurchaseStore";
import { useAuthStore } from "../../stores/useAuthStore";
import VendorPickerModal from "../../common/components/vendor/VendorPickerModal";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useVendorStore from "../../stores/useVendorStore";
import { ConfigProvider, DatePicker, Input, Select, Space } from "antd";

//TODO Update formData to include discount, total, grandTotal, vat.
// TODO Also make disocunt and vat a dropdown to select it
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

export default function PurchaseOrderForm() {
  const { state } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultVendor = state?.vendor ?? "";
  const editVendorData = state?.vendorDetails ?? "";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [vendor, setVendor] = useState(
    editVendorData ? editVendorData.vendor_name : defaultVendor
  );
  const [refNumber, setRefNumber] = useState(
    editVendorData && editVendorData.ref_number
  );
  const [arrivalDate, setArrivalDate] = useState(
    editVendorData && editVendorData.expected_arrival_date
  );
  const [date, setDate] = useState(editVendorData && editVendorData.po_date);
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [currency, setCurrency] = useState(
    editVendorData ? editVendorData.currency : "NGN"
  );
  const [allInventory, setAllInventory] = useState([]);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState("");
  const categoryScrollRef = useRef(null);
  const [inventoryGrid, setInventoryGrid] = useState(false);
  const [popularDispatch, setPopularDispatch] = useState([]);
  const [checked, setChecked] = useState(
    editVendorData?.expected_arrival_date === null ? true : false
  );
  const [vatType, setVatType] = useState("7.5%"); // default
  const [customPercent, setCustomPercent] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [discountType, setDiscountType] = useState("0%");
  const [vendorItems, setVendorItems] = useState([]);
  const [customDiscountPercent, setCustomDiscountPercent] = useState("");
  const [customDiscountValue, setCustomDiscountValue] = useState("");
  const [serviceChargeType, setServiceChargeType] = useState("0%");
  const [customServiceChargePercent, setCustomServiceChargePercent] =
    useState("");
  const [customServiceChargeValue, setCustomServiceChargeValue] = useState("");
  const itemsPerPage = 50;
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const {
    fetchAllInventory,
    fetchAllCategories,
    fetchInventoryByCategory,
    allCategories,
    inventory,
  } = useInventoryStore();
  const { addPurchaseRecord } = usePurchaseStore();
  const { fetchFrequentlyDispatchedItems } = useDispatchStore();
  const [items, setItems] = useState(
    editVendorData
      ? editVendorData.items?.map((data) => ({
          name: data.item_name,
          part_number: data.part_number,
          quantity: Number(data.quantity_ordered),
          unitPrice: Number(data.unit_price),
          item_id: Number(data.item_id),
          arrivalDate: data.expected_arrival_date,
        }))
      : Array.from({ length: 5 }, () => ({
          name: "",
          part_number: "",
          quantity: "",
          unitPrice: "",
          item_id: "",
          arrivalDate: "",
        }))
  );
  const { user_id } = useAuthStore();
  const { fetchVendorItems } = useVendorStore();
  // Use Effects
  useEffect(() => {
    const fetchData = async () => {
      const inventory = await fetchAllInventory();
      const uniqueInventory = inventory.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.item_id === item.item_id)
      );
      const popular = await fetchFrequentlyDispatchedItems(50);

      setPopularDispatch(popular);
      setAllInventory(uniqueInventory);
      console.log(editVendorData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (performance.navigation.type === 1) {
      // 1 means page reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllCategories();
    };
    console.log(location.pathname);
    ``;
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startTime = Date.now();
      const data = await fetchAllInventory();
      const elapsed = Date.now() - startTime;
      const remainingTime = 2000 - elapsed;
      if (remainingTime > 0) {
        await new Promise((res) => setTimeout(res, remainingTime));
      }
      const uniqueInventory = data.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.item_id === item.item_id)
      );

      setProducts(uniqueInventory);
      setCurrentPage(1);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (
      (vatType === "customValue" && inputRef.current && total !== 0) ||
      (vatType === "customPercent" && inputRef.current)
    ) {
      inputRef.current.focus();
    }
  }, [vatType]);

  useEffect(() => {
    if (
      (discountType === "customValue" && inputRef.current && total !== 0) ||
      (discountType === "customPercent" && inputRef.current)
    ) {
      inputRef.current.focus();
    }
  }, [discountType]);

  useEffect(() => {
    if (
      (serviceChargeType === "customValue" &&
        inputRef.current &&
        total !== 0) ||
      (serviceChargeType === "customPercent" && inputRef.current)
    ) {
      inputRef.current.focus();
    }
  }, [serviceChargeType]);

  const isDisabled = (index) => {
    return !items[index]?.part_number?.trim();
  };
  const addRow = () => {
    setItems([
      ...items,
      {
        name: "",
        part_number: "",
        quantity: "",
        unitPrice: "",
        item_id: "",
        arrivalDate: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setSuppressSuggestions(true);
    const updated = [...items];
    const new_update = updated.filter((_, i) => i !== index);
    if (new_update.length < 5) {
      for (let i = new_update.length; i < 5; i++) {
        new_update.push({
          name: "",
          part_number: "",
          quantity: "",
          unitPrice: "",
          arrivalDate: "",
          item_id: "",
        });
      }
    }
    setItems(new_update);
    setTimeout(() => setSuppressSuggestions(false), 300);
  };
  const handleItemChange = (index, field, value) => {
    const updated = [...items];

    if (field === "quantity" || field === "unitPrice") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }

    setItems(updated);
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const calcVat = () => {
    if (vatType === "customPercent" && customPercent) {
      return (
        (total + calcDiscount() + calcServiceCharge()) *
        (Number(customPercent) / 100)
      );
    }
    if (vatType === "customPercentValue" && customPercent) {
      return (
        (total + calcDiscount() + calcServiceCharge()) *
        (Number(customPercent) / 100)
      );
    }
    if (vatType === "actualCustomValue" && customValue) {
      return Number(customValue);
    }

    const percent = Number(vatType.replace("%", ""));
    const vat =
      (total + calcDiscount() + calcServiceCharge()) * (percent / 100);

    return isNaN(vat) ? 0 : vat;
  };
  const calcServiceCharge = () => {
    if (serviceChargeType === "customPercent" && customServiceChargePercent) {
      return (
        (total - calcDiscount()) * (Number(customServiceChargePercent) / 100)
      );
    }
    if (
      serviceChargeType === "customPercentValue" &&
      customServiceChargePercent
    ) {
      return (
        (total - calcDiscount()) * (Number(customServiceChargePercent) / 100)
      );
    }
    if (serviceChargeType === "actualCustomValue" && customServiceChargeValue) {
      return Number(customServiceChargeValue);
    }

    const percent = Number(serviceChargeType.replace("%", ""));
    const serviceCharge = (total - calcDiscount()) * (percent / 100);

    return isNaN(serviceCharge) ? 0 : serviceCharge;
  };

  const calcDiscount = () => {
    // custom % typed but not yet finalized
    if (discountType === "customPercent" && customDiscountPercent) {
      return total * (Number(customDiscountPercent) / 100);
    }
    // custom % finalized and stored as option
    if (discountType === "customPercentValue" && customDiscountPercent) {
      return total * (Number(customDiscountPercent) / 100);
    }
    // custom fixed amount typed & finalized
    if (discountType === "actualCustomValue" && customDiscountValue) {
      return Number(customDiscountValue);
    }

    // built‑in percentages (e.g. "5%", "10%")
    const percent = Number(discountType.replace("%", ""));
    const disc = total * (percent / 100);

    return isNaN(disc) ? 0 : disc;
  };

  const grandTotal = total + calcDiscount() + calcVat() - calcDiscount();

  const submitPurchase = async (state = "addPO") => {
    const formData = new FormData();
    const ETA = checked ? "" : arrivalDate;
    formData.append("vendor", vendor);
    formData.append("refNumber", refNumber);
    formData.append("arrivalDate", ETA);
    formData.append("notes", notes);
    formData.append("date", date);
    formData.append("currency", currency);
    formData.append("user_id", user_id);
    formData.append("state", state);
    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase order.");
      return;
    }
    formData.append("total", total.toFixed(2));
    formData.append("VAT", calcVat().toFixed(2));
    formData.append("discount", calcDiscount().toFixed(2));
    formData.append("serviceCharge", calcServiceCharge().toFixed(2));
    formData.append("grandTotal", grandTotal.toFixed(2));
    const filteredItems = items.filter((item) => item.part_number !== "");
    formData.append("items", JSON.stringify(filteredItems));
    if (attachment) formData.append("attachment", attachment);

    await addPurchaseRecord(formData);

    // Reset State
    setItems(
      Array.from({ length: 5 }, () => ({
        name: "",
        part_number: "",
        quantity: "",
        unitPrice: "",
        item_id: "",
        arrivalDate: "",
      }))
    );
    setVendor("");
    setRefNumber("");
    setArrivalDate("");
    setDate("");
    setNotes("");
    setAttachment(null);
    setCurrency("NGN");
    setChecked(false);
    setVatType("7.5%");
    setDiscountType("0%");
    setServiceChargeType("0%");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPurchase();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrencySymbol = (code) => {
    const match = currencies.find((c) => c.code === code);
    return match ? match.symbol : "";
  };

  const handleCurrencyChange = (value) => {
    const currency = value;
    setCurrency(currency);
  };

  // Inventory Items Pop up
  const debouncedSearch = useCallback(
    debounce((value) => {
      const s = value.toLowerCase();
      const filteredItems = inventory.filter((item) => {
        const matchesSearch =
          (item.name?.toLowerCase().includes(s) ?? false) ||
          (item.part_number?.toLowerCase().includes(s) ?? false);

        return matchesSearch;
      });

      setProducts(filteredItems);
      setCurrentPage(1);
    }, 300),
    [inventory]
  );

  const handleCategoryChange = async (category, setCategory = true) => {
    if (setCategory) {
      setActiveCategory(category);
    }
    setCurrentPage(1);

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
      baseItems = allInventory;
    } else if (category === "Popular") {
      baseItems = popularDispatch;
    } else if (category === "Vendor") {
      baseItems = vendorItems;
    } else {
      baseItems = await fetchInventoryByCategory(category);
    }

    const filtered = filterBySearch(baseItems);
    setProducts(filtered);
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const discountOptions = [
    { value: "0%", label: "Discount (0%)" },
    { value: "5%", label: "Discount (5%)" },
    { value: "10%", label: "Discount (10%)" },
    discountType === "customPercentValue" && {
      value: "customPercentValue",
      label: `Discount (${customDiscountPercent}%)`,
    },
    discountType === "actualCustomValue" && {
      value: "actualCustomValue",
      label: `Discount (${((customDiscountValue / total) * 100).toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 1,
        }
      )}%)`,
    },
    { value: "customPercent", label: "% Custom" },
    { value: "customValue", label: "Custom Value" },
  ].filter(Boolean);

  const serviceChargeOptions = [
    { value: "0%", label: "Service Charge (0%)" },
    { value: "5%", label: "Service Charge (5%)" },
    { value: "10%", label: "Service Charge (10%)" },
    serviceChargeType === "customPercentValue" && {
      value: "customPercentValue",
      label: `Service Charge (${customServiceChargePercent}%)`,
    },
    serviceChargeType === "actualCustomValue" && {
      value: "actualCustomValue",
      label: `Service Charge (${(
        (customServiceChargeValue / total) *
        100
      ).toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })}%)`,
    },
    { value: "customPercent", label: "% Custom" },
    { value: "customValue", label: "Custom Value" },
  ].filter(Boolean);

  const vatOptions = [
    { value: "5%", label: "VAT (5%)" },
    { value: "7.5%", label: "VAT (7.5%)" },
    { value: "10%", label: "VAT (10%)" },
    vatType === "customPercentValue" && {
      value: "customPercentValue",
      label: `VAT (${customPercent}%)`,
    },
    vatType === "actualCustomValue" && {
      value: "actualCustomValue",
      label: `VAT (${((customValue / total) * 100).toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })}%)`,
    },
    { value: "customPercent", label: "% Custom" },
    { value: "customValue", label: "Custom Value" },
  ].filter(Boolean);

  return (
    <div className="">
      <PageHeader
        title={"Create Purchase Order"}
        button={[
          {
            name: "Save as draft",
            icon: Save,
            bgColor: "bg-blue-600",
            onClick: () => {
              if (formRef.current?.checkValidity()) {
                submitPurchase("draft");
              } else {
                formRef.current?.reportValidity(); // shows native validation messages
              }
            },
          },
        ]}
      />

      <VendorPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={async (vendor) => {
          setVendor(vendor.name);
          setPickerOpen(false);
          const result = await fetchVendorItems(vendor.vendor_id);
          setVendorItems(result);
        }}
      />

      <div className="p-5">
        {inventoryGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white relative p-3 lg:p-6 rounded-lg shadow-xl w-[95%] max-w-3xl overflow-y-scroll menu h-[90vh]"
            >
              <X
                onClick={() => {
                  setInventoryGrid(false);
                  setActiveCategory("All");
                  setSearch("");
                }}
                className="absolute top-5 right-5 text-red-500 hover:text-red-700 cursor-pointer transition-colors duration-150"
              />
              <div className="px- pb-6">
                <div className="flex justify-en">
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="⌕ Search"
                      className="text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white text-black placeholder:text-gray-400 font-medium tracking-wide"
                      onChange={(e) => {
                        setSearch(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                      value={search}
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mb-6 pb-1">
                  <HorizontalScrollContainer
                    activeIndex={allCategories.findIndex(
                      (cat) => cat.name === activeCategory
                    )}
                    ref={categoryScrollRef}
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
                    {vendor !== "" ? (
                      <button
                        className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${
                          activeCategory === "Vendor"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300"
                        }`}
                        onClick={() => handleCategoryChange("Vendor")}
                      >
                        Vendor Stock
                      </button>
                    ) : (
                      <span className="hidden" />
                    )}

                    <button
                      onClick={() => handleCategoryChange("Popular")}
                      className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${
                        activeCategory === "Popular"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-300"
                      }`}
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
                    <span className="ml-2 text-sm text-gray-600">
                      Processing...
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1  min-[450px]:grid-cols-2 min-[700px]:grid-cols-3 xl:grid-cols-4 gap-4 select-none">
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
                            on_remove={() => removeRow()}
                            purchaseOrder={true}
                            on_click={() => {
                              handleItemChange(
                                selectedIndex,
                                "name",
                                item.name
                              );
                              handleItemChange(
                                selectedIndex,
                                "part_number",
                                item.part_number
                              );
                              handleItemChange(selectedIndex, "quantity", 1);
                              handleItemChange(
                                selectedIndex,
                                "item_id",
                                item.item_id
                              );

                              if (
                                selectedIndex === items.length - 1 &&
                                items.every(
                                  (item) => item.part_number?.trim() !== ""
                                )
                              ) {
                                addRow(); // add new row if last item is selected
                              }
                              setActiveCategory("All");
                              setInventoryGrid(false);
                            }}
                            selected={items.some(
                              (i) => i.item_id === item.item_id
                            )}
                          />
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {paginatedProducts.length > 0 && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of{" "}
                      {Math.ceil(products.length / itemsPerPage)}
                    </span>
                    <button
                      className="px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                      onClick={() =>
                        setCurrentPage((p) =>
                          p < Math.ceil(products.length / itemsPerPage)
                            ? p + 1
                            : p
                        )
                      }
                      disabled={
                        currentPage >= Math.ceil(products.length / itemsPerPage)
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {(discountType === "customValue" ||
          vatType === "customValue" ||
          serviceChargeType === "customValue") &&
          total === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white flex flex-col items-center justify-center p-3 rounded-2xl shadow-2xl w-full max-w-sm h-[20vh] text-center space-y-4"
              >
                <span className="text-gray-700 text-[16px] font-medium">
                  Please add items to set custom{" "}
                  {discountType === "customValue" && "Discount"}
                  {vatType === "customValue" && "VAT"}
                  {serviceChargeType === "customValue" && "Service Charge"}
                </span>
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition duration-200"
                  onClick={() => {
                    discountType === "customValue" && setDiscountType("0%");
                    vatType === "customValue" && setVatType("7.5%");
                    serviceChargeType === "customValue" &&
                      setServiceChargeType("0%");
                  }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}

        <form onSubmit={handleSubmit} ref={formRef} className="w-full">
          {/* Top Info Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-5">
              {/* Left Column */}
              <div className="flex-1 bg-white p-5 rounded-md shadow border border-gray-100 space-y-3 text-sm">
                {/* Vendor Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Vendor Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 placeholder-gray-400"
                      placeholder="e.g. ABC Suppliers"
                      required
                    />
                    <CircleEqual
                      onClick={() => setPickerOpen(true)}
                      size={15}
                      strokeWidth={1.5}
                      className="absolute right-1.5 top-[calc(50%-7.5px)] text-gray-400 cursor-pointer hover:text-gray-600 transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Ref Number */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ref Number
                  </label>
                  <Input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 placeholder-gray-400"
                    placeholder="e.g. PO-12345"
                    required
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Currency
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
                        value={currency}
                        onChange={handleCurrencyChange}
                        required
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 bg-white p-5 rounded-md shadow border border-gray-100 space-y-3 text-sm">
                {/* Date */}
                <div className="flex flex-col">
                  <label className="block text-gray-700 font-medium mb-1">
                    Date
                  </label>
                  <ConfigProvider
                    theme={{
                      token: {
                        // colorPrimary: "#E5E7EB", // Tailwind gray-200
                        controlOutline: "transparent", // removes glow effect
                        controlPaddingHorizontal: 6,
                        colorBorder: "#E5E7EB",
                      },
                    }}
                  >
                    <Space direction="vertical">
                      <DatePicker
                        required
                        value={date ? dayjs(date) : null}
                        onChange={(_, dateString) => {
                          setDate(dateString);
                        }}
                        className="w-full"
                      />
                    </Space>
                  </ConfigProvider>
                </div>

                {/* Expected Arrival */}
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <label className="block text-gray-700 font-medium mb-1">
                      Expected Arrival
                    </label>
                    <label className="inline-flex justify-center items-center">
                      <span className="mr-2 text-gray-700 font-medium">
                        Multiple Dates
                      </span>
                      <input
                        type="checkbox"
                        className="form-checkbox h-3 w-3 mr-2 text-blue-600"
                        checked={checked}
                        onChange={(e) => {
                          setChecked(e.target.checked);
                          const checkedValue = e.target.checked;
                          if (checkedValue) {
                            setArrivalDate("");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <ConfigProvider
                    theme={{
                      token: {
                        // colorPrimary: "#E5E7EB", // Tailwind gray-200
                        controlOutline: "transparent", // removes glow effect
                        controlPaddingHorizontal: 6,
                        colorBorder: "#E5E7EB",
                      },
                    }}
                  >
                    <Space direction="vertical">
                      <DatePicker
                        placeholder="Select arrival date"
                        value={arrivalDate ? dayjs(arrivalDate) : null}
                        onChange={(_, dateString) => {
                          setArrivalDate(dateString);
                        }}
                        className="w-full"
                        required
                        disabled={checked}
                      />
                    </Space>
                  </ConfigProvider>
                </div>

                {/* Notes / Destination */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Notes / Destination
                  </label>
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 placeholder-gray-400"
                    placeholder="e.g. Deliver to warehouse 2"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Attachment (PDF)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="w-full text-sm border border-gray-200 rounded-md px-1.5 py-1.5 bg-white file:border-0 file:bg-gray-100 file:rounded-md file:px-2 file:py-[2px] file:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow mt-5 p-5">
            <span className="font-semibold text-gray-700">Add Items: </span>
            <div className="border mt-3 border-gray-200  overflow-x-auto categories">
              <table className="min-w-[900px] w-full border border-gray-200 rounded">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-center w-10">
                      #
                    </th>
                    <th className="border border-gray-200 min-w-[200px] px-3 py-2 text-left">
                      Item Description
                    </th>
                    <th className="border border-gray-200 min-w-30 px-3 py-2 text-left">
                      Part Number
                    </th>
                    <th className="border border-gray-200 min-w-20 px-3 py-2 text-center">
                      Quantity
                    </th>
                    <th className="border border-gray-200 min-w-15 px-3 py-2 text-center">
                      Currency
                    </th>
                    <th className="border border-gray-200 min-w-30 px-3 py-2 text-center">
                      Unit Price
                    </th>
                    <th className="border border-gray-200 min-w-35 px-3 py-2 text-center">
                      Subtotal
                    </th>
                    {checked && (
                      <th className="border border-gray-200 min-w-30 px-3 py-2 text-center">
                        ETA
                      </th>
                    )}
                    <th className="border border-gray-200 px-3 py-2 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {items.map((item, idx) => (
                    <tr key={idx} className="text-sm text-gray-700">
                      {/* Item Number */}
                      <td className="border border-gray-200 text-center">
                        {idx + 1}
                      </td>
                      {/* Item Description */}
                      <td className="border border-gray-200">
                        <div className="relative">
                          <AutocompleteInput
                            inventoryItems={allInventory}
                            setValue={(val) => {
                              // Handle both manual typing and item selection
                              if (typeof val === "object" && val !== null) {
                                handleItemChange(idx, "name", val.name);
                                handleItemChange(
                                  idx,
                                  "part_number",
                                  val.part_number
                                );
                                handleItemChange(idx, "quantity", 1); // default quantity to 1
                                handleItemChange(idx, "item_id", val.item_id);
                                if (
                                  idx === items.length - 1 &&
                                  items.every(
                                    (item) => item.part_number?.trim() !== ""
                                  )
                                ) {
                                  addRow(); // add new row if last item is selected
                                }
                              } else {
                                handleItemChange(idx, "name", val); // fallback for manual typing
                                handleItemChange(idx, "part_number", ""); // reset part number
                                handleItemChange(idx, "quantity", "");
                              }
                            }}
                            suppressSuggestions={suppressSuggestions}
                            value={item.name} // only shows the name in the input
                            className="text-sm w-[95%] truncate border-gray-300 focus:outline-none"
                            className2={
                              isDisabled(idx - 1) && idx > 0 && "bg-gray-100"
                            }
                            placeholder=""
                            disabled={
                              idx > 0 &&
                              items[idx - 1]?.part_number?.trim() === ""
                                ? true
                                : false
                            }
                          />
                          {idx > 0 &&
                          items[idx - 1]?.part_number?.trim() === "" ? (
                            ""
                          ) : (
                            <CircleEqual
                              size={15}
                              strokeWidth={1.5}
                              className="absolute right-1.5 top-[calc(50%-7.5px)] text-gray-400 cursor-pointer hover:text-gray-600 transition-all duration-150"
                              onClick={() => {
                                handleCategoryChange("All");
                                setSelectedIndex(idx);
                                setInventoryGrid(true);
                              }}
                            />
                          )}
                        </div>
                      </td>
                      {/* Part Number */}
                      <td
                        className={`border border-gray-200 ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <input
                          type="text"
                          disabled
                          value={item.part_number || ""}
                          className={`w-full h-full px-3 py-2 focus:outline-none ${
                            isDisabled(idx) ? "bg-gray-100" : "bg-white"
                          }`}
                          required
                        />
                      </td>

                      {/* Quantity */}
                      <td
                        className={`border border-gray-200 text-center ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <input
                          type="number"
                          min="1"
                          disabled={!item.part_number?.trim()}
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", e.target.value)
                          }
                          className={`w-full h-full px-2 py-2 text-center focus:outline-none ${
                            isDisabled(idx) ? "bg-gray-100" : "bg-white"
                          }`}
                        />
                      </td>
                      {/* Currency */}
                      <td
                        className={`border border-gray-200 text-center ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        {items[idx].part_number?.trim() ? currency : ""}
                      </td>

                      {/* Unit Price */}
                      <td
                        className={`border border-gray-200 ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-center w-full h-full px-2 py-2">
                          <input
                            type="number"
                            // min="1"
                            step="1000"
                            disabled={isDisabled(idx)}
                            required
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(idx, "unitPrice", e.target.value)
                            }
                            className={`text-center w-full focus:outline-none ${
                              isDisabled(idx) ? "bg-gray-100" : "bg-white"
                            }`}
                          />
                        </div>
                      </td>

                      {/* Total Price */}
                      <td
                        className={`border border-gray-200 text-center align-middle relative ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        {items[idx].unitPrice !== "" ? (
                          <>
                            <span>{getCurrencySymbol(currency)} </span>
                            <span>
                              {(item.quantity * item.unitPrice).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </>
                        ) : (
                          ""
                        )}
                      </td>
                      {/* ETA */}
                      {checked && (
                        <td
                          className={`border border-gray-200 text-center align-middle relative ${
                            isDisabled(idx) ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          {item.part_number?.trim() && (
                            <ConfigProvider
                              theme={{
                                token: {
                                  colorPrimary: "#fff", // Tailwind gray-200
                                  controlOutline: "transparent", // removes glow effect
                                  controlPaddingHorizontal: 6,
                                  colorBorder: "transparent",
                                },
                              }}
                            >
                              <Space direction="vertical">
                                <DatePicker
                                  value={
                                    item.arrivalDate
                                      ? dayjs(item.arrivalDate)
                                      : null
                                  }
                                  onChange={(_, dateString) => {
                                    handleItemChange(
                                      idx,
                                      "arrivalDate",
                                      dateString
                                    );
                                  }}
                                  className="w-full"
                                  required
                                />
                              </Space>
                            </ConfigProvider>
                            // <input
                            //   type="date"
                            //   disabled={!checked}
                            //   value={item.arrivalDate}
                            //   onChange={(e) =>
                            //     handleItemChange(
                            //       idx,
                            //       "arrivalDate",
                            //       e.target.value
                            //     )
                            //   }
                            //   className="w-full px-2 py-1.5"
                            //   required
                            // />
                          )}
                        </td>
                      )}
                      {/* Action Button */}
                      <td
                        className={`border border-gray-200 text-center ${
                          isDisabled(idx) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        {item.part_number?.trim() && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            <Trash2
                              strokeWidth={1.5}
                              size={20}
                              className="hover:text-red-700 cursor-pointer transition-all duration-150"
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan="7"
                      className="border-t border-gray-200 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={addRow}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        + Add Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full min-[540px]:w-fit flex flex-col p-5 max-[450px]:overflow-x-auto categories  rounded-lg mt-5 bg-white shadow">
              <table className="text-sm border border-gray-200 rounded-md">
                <tbody>
                  {/* Total */}
                  <tr>
                    <td className="border border-gray-200 h-10 px-4 py-2 text-right font-medium">
                      Total :
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-left">
                      {getCurrencySymbol(currency)}{" "}
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>

                  {/* Discount */}
                  <tr>
                    {/* --------- DISCOUNT DROPDOWN + optional input --------- */}
                    <td className="border border-gray-200 h-10 px-4 text-right font-medium w-40">
                      <div className="flex items-center justify-end">
                        {discountType !== "customPercent" && (
                          <ConfigProvider
                            theme={{
                              token: {
                                colorBorder: "Transparent",
                                colorOutline: "Transparent",
                                colorPrimary: "#fff",
                              },
                            }}
                          >
                            <Select
                              className="w-full text-right focus:outline-none"
                              style={{ direction: "rtl" }}
                              value={discountType}
                              onChange={(value) => {
                                setDiscountType(value);
                                setCustomDiscountPercent("");
                                setCustomDiscountValue("");
                              }}
                              options={discountOptions}
                            ></Select>
                          </ConfigProvider>
                        )}

                        {discountType === "customPercent" && (
                          <input
                            ref={inputRef}
                            type="number"
                            placeholder="%"
                            value={customDiscountPercent}
                            onChange={(e) =>
                              setCustomDiscountPercent(e.target.value)
                            }
                            onBlur={(e) =>
                              e.target.value !== ""
                                ? setDiscountType("customPercentValue")
                                : setDiscountType("0%")
                            }
                            className="w-20 border border-gray-300 rounded px-1 py-0.5 text-right focus:outline-none"
                          />
                        )}
                        <span>:</span>
                      </div>
                    </td>

                    {/* --------- DISCOUNT VALUE / writable when custom value --------- */}
                    <td className="border border-gray-200 px-4 py-2 w-40 text-left">
                      {getCurrencySymbol(currency)}{" "}
                      {discountType === "customValue" ? (
                        <input
                          ref={inputRef}
                          value={customDiscountValue}
                          onChange={(e) =>
                            setCustomDiscountValue(e.target.value)
                          }
                          onBlur={(e) =>
                            e.target.value !== ""
                              ? setDiscountType("actualCustomValue")
                              : setDiscountType("0%")
                          }
                          className="w-25 rounded px-1 py-0.5 text-left focus:outline-none"
                        />
                      ) : (
                        <>
                          {calcDiscount().toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Service Charge*/}
                  <tr>
                    <td className="border border-gray-200 h-10 px-4 text-right font-medium w-50">
                      <div className="flex items-center justify-end">
                        {serviceChargeType !== "customPercent" && (
                          <ConfigProvider
                            theme={{
                              token: {
                                colorBorder: "Transparent",
                                colorOutline: "Transparent",
                                colorPrimary: "#fff",
                              },
                            }}
                          >
                            <Select
                              className="text-right w-full focus:outline-none"
                              style={{ direction: "rtl" }}
                              value={serviceChargeType}
                              onChange={(value) => {
                                setServiceChargeType(value);
                                setCustomServiceChargePercent("");
                                setCustomServiceChargeValue("");
                              }}
                              options={serviceChargeOptions}
                            ></Select>
                          </ConfigProvider>
                        )}

                        {serviceChargeType === "customPercent" && (
                          <input
                            ref={inputRef}
                            type="number"
                            placeholder="%"
                            value={customServiceChargePercent}
                            onChange={(e) =>
                              setCustomServiceChargePercent(e.target.value)
                            }
                            onBlur={(e) =>
                              e.target.value !== ""
                                ? setServiceChargeType("customPercentValue")
                                : setServiceChargeType("0%")
                            }
                            className="w-20 border border-gray-300 rounded px-1 py-0.5 text-right focus:outline-none"
                          />
                        )}
                        <span>:</span>
                      </div>
                    </td>

                    {/* --------- SERVICE CHARGE VALUE / writable when custom value --------- */}
                    <td className="border border-gray-200 px-4 py-2 w-50 text-left">
                      {getCurrencySymbol(currency)}{" "}
                      {serviceChargeType === "customValue" ? (
                        <input
                          ref={inputRef}
                          value={customServiceChargePercent}
                          onChange={(e) =>
                            setCustomServiceChargeValue(e.target.value)
                          }
                          onBlur={(e) =>
                            e.target.value !== ""
                              ? setServiceChargeType("actualCustomValue")
                              : setServiceChargeType("0%")
                          }
                          className="w-25 rounded px-1 py-0.5 text-left focus:outline-none"
                        />
                      ) : (
                        <>
                          {calcServiceCharge().toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* VAT */}
                  <tr>
                    {/* ------------- DROPDOWN + optional percent input ------------- */}
                    <td className="border border-gray-200 px-4 w-40 h-10 text-right font-medium">
                      <div className="flex items-center justify-end">
                        {vatType !== "customPercent" && (
                          <ConfigProvider
                            theme={{
                              token: {
                                colorBorder: "Transparent",
                                colorOutline: "Transparent",
                                colorPrimary: "#fff",
                              },
                            }}
                          >
                            <Select
                              className="text-right w-full focus:outline-none"
                              style={{ direction: "rtl" }}
                              value={vatType}
                              onChange={(value) => {
                                setVatType(value);
                                setCustomPercent("");
                                setCustomValue("");
                              }}
                              options={vatOptions}
                            ></Select>
                          </ConfigProvider>
                        )}

                        {/* if user picked custom percent, show an input for % */}
                        {vatType === "customPercent" && (
                          <input
                            ref={inputRef}
                            type="number"
                            placeholder="%"
                            value={customPercent}
                            onChange={(e) => setCustomPercent(e.target.value)}
                            onBlur={(e) =>
                              e.target.value !== ""
                                ? setVatType("customPercentValue")
                                : setVatType("7.5%")
                            }
                            className="w-20 border border-gray-300 rounded px-1 py-0.5 text-right focus:outline-none"
                          />
                        )}
                        <span>:</span>
                      </div>
                    </td>

                    {/* ------------- VAT AMOUNT / writable when custom value ------------- */}
                    <td className="border border-gray-200 px-4 py-2 text-left">
                      {getCurrencySymbol(currency)}{" "}
                      {vatType === "customValue" ? (
                        <input
                          ref={inputRef}
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          onBlur={(e) =>
                            e.target.value !== ""
                              ? setVatType("actualCustomValue")
                              : setVatType("7.5%")
                          }
                          className="w-25 rounded px-1 py-0.5 text-left focus:outline-none"
                        />
                      ) : (
                        <>
                          {calcVat().toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Grand Total */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-200 h-10 px-4 py-2 text-right text-gray-800">
                      Grand Total :
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-left text-gray-900 min-w-40">
                      {getCurrencySymbol(currency)}{" "}
                      {grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                type="submit"
                className="px-5 py-2 mt-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Submit Purchase Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
