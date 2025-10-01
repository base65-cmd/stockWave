import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useVendorStore = create((set) => ({
  vendors: [],
  vendorLoading: false,
  loading: false,
  fetchVendors: async () => {
    set({ vendorLoading: true });
    try {
      const res = await axios.get("/vendor");
      set({ vendors: res.data.data, vendorLoading: false });
      return res.data.data;
    } catch (error) {
      set({ vendorLoading: false });
      toast.error(error.response?.data.message || "Failed to fetch vendors");
    }
  },
  fetchVendorByCategory: async (category) => {
    set({ vendorLoading: true });
    try {
      const res = await axios.get(`/vendor/category/${category}`);
      set({ vendors: res.data.data, vendorLoading: false });
      return res.data.data;
    } catch (error) {
      set({ vendorLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch vendors by category"
      );
    }
  },
  fetchVendorById: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/vendor/${id}`);
      setTimeout(() => {
        set({ vendors: res.data.data, loading: false });
      }, 1500);
      return res.data.data;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch vendors by Id"
      );
    }
  },
  fetchVendorByItem: async (id) => {
    set({ vendorLoading: true });
    try {
      const res = await axios.get(`/vendor/items/${id}`);

      set({ vendors: res.data.data, vendorLoading: false });

      return res.data.data;
    } catch (error) {
      set({ vendorLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch vendors by Item"
      );
    }
  },
  fetchVendorItems: async (id) => {
    set({ vendorLoading: true });
    try {
      const res = await axios.get(`vendor/vendor-items/${id}`);
      set({ vendorLoading: false });
      return res.data.data;
    } catch (error) {
      set({ vendorLoading: false });
      toast.error(
        error.response?.data.message ||
          "Failed to fetch items supplied by vendor"
      );
    }
  },
  addItemToVendor: async (data) => {
    set({ vendorLoading: true });
    try {
      const res = await axios.post(`/vendor/item/to-vendor`, data);
      if (res.status === 200) {
        // wait the 1.5s *before* resolving
        await new Promise((r) => setTimeout(r, 1500));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data.message || "Failed to add Vendor to Item"
      );
    } finally {
      // always clear vendorLoading
      set({ vendorLoading: false });
    }
  },
}));

export default useVendorStore;
