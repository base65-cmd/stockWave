import pool from "../lib/db/db.js";
import { getAllInventory } from "./inventory.controller.js";
import ExcelJS from "exceljs";

export const exportInventoryExcel = async (req, res) => {
  try {
    const result = await getAllInventory();
    const inventory = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Report");

    // Define columns
    worksheet.columns = [
      {
        header: "ID",
        key: "item_id",
        width: 5,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Name", key: "name", width: 30 },
      { header: "Part Number", key: "part_number", width: 20 },
      { header: "Description", key: "description", width: 40 },
      {
        header: "Currency",
        key: "currency",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Price", key: "price", width: 10 },
      { header: "Barcode", key: "barcode", width: 20 },
      { header: "Category", key: "category", width: 20 },
      { header: "Location", key: "location", width: 15 },
      {
        header: "Shelf",
        key: "shelf",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Shelf Description", key: "shelf_description", width: 25 },
      {
        header: "Quantity",
        key: "quantity",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      {
        header: "Last Update",
        key: "last_updated",
        width: 20,
        style: { alignment: { horizontal: "left", vertical: "middle" } },
      },
    ];

    worksheet.getRow(1).font = { bold: true };

    // Add rows
    inventory.forEach((row) => {
      worksheet.addRow(row);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=inventory.xlsx");

    // Write file to response
    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.log(error);
  }
};

export const exportInventoryCSV = async (req, res) => {
  try {
    const result = await getAllInventory();
    const inventory = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Report");

    // Define columns
    worksheet.columns = [
      {
        header: "ID",
        key: "item_id",
        width: 5,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Name", key: "name", width: 30 },
      { header: "Part Number", key: "part_number", width: 20 },
      { header: "Description", key: "description", width: 40 },
      {
        header: "Currency",
        key: "currency",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Price", key: "price", width: 10 },
      { header: "Barcode", key: "barcode", width: 20 },
      { header: "Category", key: "category", width: 20 },
      { header: "Location", key: "location", width: 15 },
      {
        header: "Shelf",
        key: "shelf",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      { header: "Shelf Description", key: "shelf_description", width: 25 },
      {
        header: "Quantity",
        key: "quantity",
        width: 10,
        style: { alignment: { horizontal: "center", vertical: "middle" } },
      },
      {
        header: "Last Update",
        key: "last_updated",
        width: 20,
        style: { alignment: { horizontal: "left", vertical: "middle" } },
      },
    ];

    worksheet.getRow(1).font = { bold: true };

    // Add rows
    inventory.forEach((row) => {
      worksheet.addRow(row);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=inventory.csv");

    // Write file to response
    await workbook.csv.write(res);

    res.end();
  } catch (error) {
    console.log(error);
  }
};

export const exportInventoryPDF = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const generateDispatchReportByVessel = async (req, res) => {
  const { vesselId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        di.id,
        di.dispatch_id,
        v.vessel_name,
        i.name,
        i.part_number,
        di.quantity,
        dr.dispatch_date
        FROM dispatched_items di
        LEFT JOIN dispatch_records dr ON dr.destination_type = 'vessel' AND di.dispatch_id = dr.dispatch_id
        LEFT JOIN vessels v ON dr.destination_id = v.vessel_id
        LEFT JOIN inventory i ON di.item_id = i.id
        WHERE di.isdeleted = FALSE AND v.vessel_id = $1;
        `,
      [vesselId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch report by vessel id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateDispatchReportByItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
          di.id,
          di.dispatch_id,
          dr.destination_type,
          CASE
            WHEN dr.destination_type = 'vessel' THEN v.vessel_name
            WHEN dr.destination_type = 'department' THEN d.department_name
            ELSE NULL
          END AS destination_name,
          i.name,
          i.part_number,
          di.quantity,
          dr.dispatch_date
          FROM dispatched_items di
          LEFT JOIN dispatch_records dr ON di.dispatch_id = dr.dispatch_id
          LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
          LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
          LEFT JOIN inventory i ON di.item_id = i.id
          WHERE di.isdeleted = FALSE AND di.item_id = $1;
          `,
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch report by vessel id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateDispatchReportByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
          di.id,
          di.dispatch_id,
          d.department_name,
          i.name,
          i.part_number,
          di.quantity,
          dr.dispatch_date
          FROM dispatched_items di
          LEFT JOIN dispatch_records dr ON dr.destination_type = 'department' AND di.dispatch_id = dr.dispatch_id
          LEFT JOIN departments d ON dr.destination_id = d.department_id
          LEFT JOIN inventory i ON di.item_id = i.id
          WHERE di.isdeleted = FALSE AND d.department_id = $1;
          `,
      [departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch report by vessel id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDispatchReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
            di.id,
            di.dispatch_id,
            CASE
              WHEN dr.destination_type = 'vessel' THEN v.vessel_name
              WHEN dr.destination_type = 'department' THEN d.department_name
              ELSE NULL
            END AS destination_name,
            i.name,
            i.part_number,
            di.quantity,
            dr.dispatch_date
            FROM dispatched_items di
            LEFT JOIN dispatch_records dr ON di.dispatch_id = dr.dispatch_id
            LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
            LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
            LEFT JOIN inventory i ON di.item_id = i.id
            WHERE di.isdeleted = FALSE;
            `
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch report by vessel id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
