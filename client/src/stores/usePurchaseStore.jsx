import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const usePurchaseStore = create((set) => ({
  purchaseLoading: false,
  addPurchaseRecord: async (formData) => {
    set({ purchaseLoading: true });
    try {
      if (!formData) {
        throw new Error("Purchase data is required");
      }
      const res = await axios.post("/purchase", formData);
      if (res.status !== 201) {
        throw new Error("Failed to add Purchase record");
      }
      set({ purchaseLoading: false });
      toast.success(res.data.message);
    } catch (error) {
      set({ purchaseLoading: false });
      toast.error(
        error.response?.data.message || "Failed to add Purchase Order"
      );
    }
  },
  getAllPurchaseRecord: async () => {
    set({ purchaseLoading: true });
    try {
      const res = await axios.get("/purchase");
      set({ purchaseLoading: false });
      return res.data.data;
    } catch (error) {
      set({ purchaseLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch purchase orders"
      );
    }
  },
  fetchPurchaseRecordByVendor: async (vendorId) => {
    set({ purchaseLoading: true });
    try {
      const res = await axios.get(
        `/purchase/vendor/purchase-records/${vendorId}`
      );
      set({ purchaseLoading: false });
      return res.data.data;
    } catch (error) {
      set({ purchaseLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch purchase orders"
      );
    }
  },
  fetchPurchaseOrderItems: async (vendor_id) => {
    set({ purchaseLoading: true });
    try {
      const res = await axios.get(`/purchase/items/${vendor_id}`);
      set({ purchaseLoading: false });
      return res.data.data;
    } catch (error) {
      set({ purchaseLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch purchase orders items"
      );
    }
  },
}));
