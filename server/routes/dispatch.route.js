import express from "express";
import {
  addDispatchRecord,
  deleteDispatchRecord,
  getAllDispatchRecord,
  getDispatchById,
  getDispatchByUser,
  updateDispatchedItem,
  updateDispatchRecord,
  getDispatchedItemById,
  getLocations,
  getVessels,
  getDepartments,
  getDispatchedItemsByVessel,
  getAllDispatchedItems,
  getFrequentlyDispatchedItems,
} from "../controllers/dispatch.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
//TODO 1: Create a table for Purchase Logs,
// and then purchased items(these will include the item id, quantity, price and time)

router.get("/", getAllDispatchRecord);
router.get("/all/dispatched-items", authenticate, getAllDispatchedItems);
router.post("/", authenticate, addDispatchRecord);
router.get("/:dispatchId", authenticate, getDispatchById);
router.get("/items/:dispatchId", authenticate, getDispatchedItemById);
router.get("/user/:userId", authenticate, getDispatchByUser);
router.patch("/:dispatchId", authenticate, updateDispatchRecord);
router.patch("/items/:dispatchId/", authenticate, updateDispatchedItem);
router.delete("/:dispatchId", authenticate, deleteDispatchRecord);
router.get("/dropdown/locations", authenticate, getLocations);
router.get("/dropdown/vessels", authenticate, getVessels);
router.get("/dropdown/departments", authenticate, getDepartments);
router.get(
  "/dispatched/items/vessel/:vesselId",
  authenticate,
  getDispatchedItemsByVessel
);
router.get(
  "/all/frequently-dispatched/:limit",
  authenticate,
  getFrequentlyDispatchedItems
);

export default router;
