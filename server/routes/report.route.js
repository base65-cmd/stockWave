import express from "express";
import {
  exportInventoryCSV,
  exportInventoryExcel,
  exportInventoryPDF,
  generateDispatchReportByDepartment,
  generateDispatchReportByItem,
  generateDispatchReportByVessel,
  getAllDispatchReport,
} from "../controllers/report.controller.js";

const router = express.Router();

// Export all inventory data by type
router.get("/export/excel", exportInventoryExcel);

router.get("/export/csv", exportInventoryCSV);

router.get("/export/pdf", exportInventoryPDF); //TODO

router.get("/vessel/:vesselId", generateDispatchReportByVessel);

router.get("/item/:itemId", generateDispatchReportByItem);

router.get("/department/:departmentId", generateDispatchReportByDepartment);

router.get("/", getAllDispatchReport);

// // Get stock movement for a specific location
// router.get("/location/:locationId", getBincardByLocation);

// // Get bincard filtered by date range (query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD)
// router.get("/filter/date", getBincardByDate);

// // Get all deleted inventory items
// router.get("/recycle-bin/inventory", getDeletedInventory);

// // Get full history of a specific inventory item
// router.get("/inventory/:itemId/history", getItemHistory);
// // → Retrieves creation, dispatch, restock, transfer, and deletion history of an item.

// // Get audit logs of activities
// router.get("/audit-logs", getAuditLogs);
// // → Useful for tracking who made which changes, and when.

export default router;
