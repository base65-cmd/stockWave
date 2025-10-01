import express from "express";
import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getInventoryByCategory,
  getInventoryById,
  restoreInventory,
  addBulkInventory,
  receiveInventory,
  getShelfLocations,
  getAllCategories,
  updateInventoryMinLevel,
  lowInventory,
  outOfStock,
  getUniqueInventory,
  getLocations,
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
//TODO: Add protection and authentication to your routes
//TODO 2: Add get inventory by categories
//TODO 3: Set up minimum stock level in inventory stock and update all inventory routes accordingly
router.get("/", authenticate, getInventory);
router.get("/unique/inv", authenticate, getUniqueInventory);
router.get("/:id", authenticate, getInventoryById);
router.get("/shelf/locations", authenticate, getShelfLocations);
router.get("/locations/name", authenticate, getLocations);
router.get("/items/categories", authenticate, getAllCategories);
router.get("/category/:category", authenticate, getInventoryByCategory);
router.post("/", authenticate, addInventory);
router.post("/add-multiple", authenticate, addBulkInventory);
router.patch("/:id", authenticate, updateInventory);
router.delete("/:stock_id", authenticate, deleteInventory);
router.patch("/restore-inventory/:id", authenticate, restoreInventory);
router.post("/receive", authenticate, receiveInventory);
router.patch(
  "/inventory-minlevel/:stock_id",
  authenticate,
  updateInventoryMinLevel
);
router.get("/low-stock/inventory", authenticate, lowInventory);
router.get("/out-of-stock/inventory", authenticate, outOfStock);

export default router;
