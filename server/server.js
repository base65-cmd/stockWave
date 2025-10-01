import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import pool from "./lib/db/db.js";
import cors from "cors";
import fs from "fs";
import path from "path";

// Import routes
import inventoryRoutes from "./routes/inventory.route.js";
import dispatchRoutes from "./routes/dispatch.route.js";
import reportRoutes from "./routes/report.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import authRoutes from "./routes/auth.route.js";
import purchaseRoutes from "./routes/purchase.route.js";
import vendorRoutes from "./routes/vendor.route.js";
import { log } from "console";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowed = ["http://localhost:5173", "http://localhost:5174"];
//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowed, credentials: true })); // Middleware to enable CORS

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/vendor", vendorRoutes);

// initialize DB connection
async function initializeDB() {
  try {
    const schemaPath = path.join(
      path.resolve(),
      "server",
      "lib",
      "db",
      "schema.sql"
    );
    const schema = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(schema);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await initializeDB();
});
