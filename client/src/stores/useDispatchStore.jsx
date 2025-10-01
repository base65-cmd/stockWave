import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useDispatchStore = create((set) => ({
  locations: [],
  vessels: [],
  departments: [],
  dispatchLoading: false,
  dispatchData: [],

  fetchLocations: async () => {
    try {
      const res = await axios.get("dispatch/dropdown/locations");
      set({ locations: res.data.data });
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  },

  fetchVessels: async () => {
    try {
      const res = await axios.get("dispatch/dropdown/vessels");
      set({ vessels: res.data.data });
      return res.data.data;
    } catch (err) {
      console.error("Failed to fetch vessels:", err);
    }
  },

  fetchDepartments: async () => {
    try {
      const res = await axios.get("dispatch/dropdown/departments");
      set({ departments: res.data.data });
      return res.data.data;
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  },

  addDispatchRecord: async (dispatchData) => {
    set({ dispatchLoading: true });
    try {
      if (!dispatchData) {
        throw new Error("Dispatch data is required");
      }

      const res = await axios.post("/dispatch", dispatchData);
      if (res.status !== 201) {
        throw new Error("Failed to add dispatch record");
      }
      set({ dispatchLoading: false });
      toast.success("Dispatch record added successfully");
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to add dispatch record"
      );
    }
  },
  fetchAllDispatchRecords: async () => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get("/dispatch");
      set({ dispatchLoading: false, dispatchData: res.data.data });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch dispatch records"
      );
    }
  },
  fetchDispatchedItemById: async (dispatchId) => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get(`/dispatch/items/${dispatchId}`);
      set({ dispatchLoading: false, dispatchData: res.data.data });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch dispatched items"
      );
    }
  },
  fetchDispatchRecordById: async (dispatchId) => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get(`/dispatch/${dispatchId}`);
      set({ dispatchLoading: false, dispatchData: res.data.data });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch dispatched Record"
      );
    }
  },

  updateDispatchedItem: async (dispatchId, updatedData) => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.patch(
        `/dispatch/items/${dispatchId}`,
        updatedData
      );
      set({
        dispatchLoading: false,
      });
      toast.success("Dispatched item updated successfully");
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to update dispatched item"
      );
    }
  },

  fetchDispatchedItemsByVessel: async (vesselId) => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get(
        `/dispatch/dispatched/items/vessel/${vesselId}`
      );
      set({ dispatchLoading: false, dispatchData: res.data.data });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message ||
          "Failed to fetch dispatched items by vessel"
      );
    }
  },

  fetchAllDispatchedItems: async () => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get("dispatch/all/dispatched-items");
      set({ dispatchLoading: false });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch dispatched items"
      );
    }
  },

  fetchFrequentlyDispatchedItems: async (limit) => {
    set({ dispatchLoading: true });
    try {
      const res = await axios.get(
        `dispatch/all/frequently-dispatched/${limit}`
      );
      set({ dispatchLoading: false });
      return res.data.data;
    } catch (error) {
      set({ dispatchLoading: false });
      toast.error(
        error.response?.data.message ||
          "Failed to fetch frequently dispatched items"
      );
    }
  },
}));
