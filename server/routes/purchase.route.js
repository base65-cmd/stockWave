import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addPurchaseRecord,
  deletePurchaseRecord,
  getPurchaseOrderWithItems,
  getPurchaseRecordById,
  getPurchaseRecordByVendor,
  getPurchaseRecords,
  updatePurchasedItems,
  updatePurchaseRecord,
} from "../controllers/purchase.controller.js";

const upload = multer();
const router = express.Router();

router.get("/", authenticate, getPurchaseRecords);
router.get("/:id", authenticate, getPurchaseRecordById);
router.get(
  "/vendor/purchase-records/:vendorId",
  authenticate,
  getPurchaseRecordByVendor
);
router.get("/items/:purchase_id", authenticate, getPurchaseOrderWithItems);
router.post("/", authenticate, upload.single("attachment"), addPurchaseRecord);
router.delete("/:id", authenticate, deletePurchaseRecord);
router.patch("/:id", authenticate, updatePurchaseRecord);
router.patch("/items/:id", authenticate, updatePurchasedItems);

export default router;
