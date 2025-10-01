import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useInventoryStore = create((set) => ({
  inventory: [],
  allCategories: [],
  loading: false,
  inv_loading: false,
  shelfLocations: [],
  locations: [],
  setInventory: (inventory) => set({ inventory }),

  fetchAllInventory: async () => {
    set({ inv_loading: true });
    try {
      const res = await axios.get("/inventory");
      set({ inventory: res.data.inventory, inv_loading: false });
      return res.data.inventory;
    } catch (error) {
      set({ inv_loading: false });
    }
  },
  fetchAllUniqueInventory: async () => {
    set({ inv_loading: true });
    try {
      const res = await axios.get("/inventory/unique/inv");
      set({ inventory: res.data.inventory, inv_loading: false });
      return res.data.inventory;
    } catch (error) {
      set({ inv_loading: false });
    }
  },
  fetchInventoryById: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/inventory/${id}`);
      set({ inventory: res.data.inventory[0], loading: false });
      return res.data.inventory[0];
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.message || "Failed to fetch inventory");
    }
  },

  fetchInventoryByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/inventory/category/${category}`);
      set({ loading: false });
      return res.data.data;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch inventory by category"
      );
    }
  },

  fetchAllCategories: async () => {
    try {
      const res = await axios.get("/inventory/items/categories");
      set({ allCategories: res.data.allCategories, loading: false });
    } catch (error) {}
  },

  fetchShelfLocations: async () => {
    try {
      const res = await axios.get("/inventory/shelf/locations");
      set({ shelfLocations: res.data.shelf_locations });
    } catch (error) {
      console.error("Error fetching shelf locations:", error.message);
    }
  },
  fetchLocations: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/inventory/locations/name");
      set({ locations: res.data.locations, loading: false });
      return res.data.locations;
    } catch (error) {
      set({ loading: false });
      console.error("Error fetching locations:", error.message);
    }
  },

  createInventory: async (inventoryData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/inventory", inventoryData);
      const createdItem = res.data?.data?.[0];
      if (createdItem) {
        set((state) => ({
          inventory: [...state.inventory, createdItem],
          loading: false,
        }));
        toast.success("Inventory created successfully");
      }
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.message || "Product creation failed");
    }
  },

  deleteInventory: async (stock_id) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/inventory/${stock_id}`, {
        data: { user_id: 3 },
      });
      if (res.status >= 200 && res.status < 300) {
        set((state) => ({
          inventory: state.inventory.filter(
            (item) => item.stock_id !== stock_id
          ),
          loading: false,
        }));
        toast.success("Inventory deleted successfully");
      }
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.message || "Product deletion failed");
    }
  },

  updateInventory: async (id, inventoryData) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/inventory/${id}`, inventoryData);
      if (res.status === 200) {
        set({ loading: false });
        toast.success("Inventory updated successfully");
      }
    } catch (error) {
      console.error("PATCH error:", error);
      set({ loading: false });
      toast.error(error.response?.data.message || "Product update failed");
    }
  },
  updateInventoryMinimumLevel: async (stock_id, data) => {
    set({ loading: true });
    try {
      const res = await axios.patch(
        `/inventory/inventory-minlevel/${stock_id}`,
        data
      );
      if (res.status === 200) {
        set({ loading: false });
        toast.success("Minimum level updated successfully");
      }
    } catch (error) {
      console.error("PATCH error:", error);
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Failed to update minimum level"
      );
    }
  },
  getLowInventory: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/inventory/low-stock/inventory");
      set({ inventory: res.data.lowInventory, loading: false });
      return res.data.lowInventory;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch low inventory"
      );
    }
  },
  getOutOfStock: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/inventory/out-of-stock/inventory");
      set({ inventory: res.data.outOfStock, loading: false });
      return res.data.outOfStock;
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data.message || "Failed to fetch out of stock items"
      );
    }
  },
}));
