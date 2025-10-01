import express from "express";

const router = express.Router();

// // General Overview
// router.get("/overview", getInventoryOverview);
// // Total items, total stock, total value, etc.

// // Stock Insights
// router.get("/low-stock", getLowStockItems);
// // Items below threshold

// router.get("/out-of-stock", getOutOfStockItems);
// // Quantity = 0

// router.get("/most-dispatched", getMostDispatchedItems);
// // Top N items dispatched most over time

// router.get("/most-received", getMostReceivedItems);
// // If you track receiving, top items stocked in

// // User & Dispatch Activity
// router.get("/dispatch-summary", getDispatchSummary);
// // Dispatch count, quantity, by user or by item

// router.get("/user-activity/:userId", getUserDispatchActivity);
// // How many dispatches or receipts by a user

// // Category Insights
// router.get("/by-category", getInventoryByCategory);
// // Quantity/value of items per category

// // Time-based Analysis
// router.get("/monthly-dispatch", getMonthlyDispatchSummary);
// // Dispatches grouped by month/year

// router.get("/trends", getStockMovementTrends);
// // Combo of monthly stock-in/out

// // Custom Filters (dynamic query via query params)
// router.get("/filter", filterAnalytics);
// // ?start=2024-01-01&end=2024-03-31&category=ICT
// // Get stock usage per vessel
// router.get("/vessel-usage", getVesselStockUsage);

// // Get stock usage analysis per vessel
// router.get("/analytics/usage/vessels", getVesselStockUsage);
// // → Shows which vessels consume the most stock and what items.

// // Get most used items overall
// router.get("/analytics/items/most-used", getMostUsedItems);

// // Get low stock alerts
// router.get("/analytics/stock/low", getLowStockItems);

// // Stock summary (total quantity, cost, etc.)
// router.get("/analytics/stock/summary", getStockSummary);

export default router;
