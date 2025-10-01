import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addItemsToVendor,
  getAllVendorSuppliedItems,
  getVendorById,
  getVendorByItems,
  getVendors,
  getVendorsByCategory,
} from "../controllers/vendor.controller.js";

const router = express.Router();

router.get("/", authenticate, getVendors);
router.get("/:id", authenticate, getVendorById);
router.get("/category/:category_id", authenticate, getVendorsByCategory);
router.get("/items/:itemId", authenticate, getVendorByItems);
router.get("/vendor-items/:vendor_id", authenticate, getAllVendorSuppliedItems);
router.post("/item/to-vendor", authenticate, addItemsToVendor);

export default router;
