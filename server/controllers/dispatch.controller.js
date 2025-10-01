import pool from "../lib/db/db.js";

export async function addDispatchRecord(req, res) {
  const {
    user_id,
    destination_type,
    destination_id,
    notes,
    dispatch, // Has location, quantity, item_id, remarks
  } = req.body;

  try {
    //Check if dispatch is empty
    if (dispatch.length == 0) {
      return res.status(404).json({ message: "No dispatch item" });
    }
    // Check if quantity to be dispatched is less than available quantity
    const lowStock = [];

    try {
      for (const item of dispatch) {
        // Get location_id
        const location_result = await pool.query(
          "SELECT * FROM locations WHERE location_name = $1",
          [item.location]
        );
        const location_id = location_result.rows[0]?.location_id;
        if (!location_id) {
          throw new Error(`Location ${item.location} not found.`);
        }

        const result = await pool.query(
          "SELECT * FROM inventory_stock WHERE item_id = $1 AND location_id = $2 AND isdeleted = FALSE;",
          [item.item_id, location_id]
        );

        if (!result.rows[0]) {
          throw new Error(
            `Inventory record for item_id ${item.item_id} in location '${item.location}' not found.`
          );
        }

        const stockQuantity = result.rows[0].quantity;

        if (item.quantity > stockQuantity) {
          lowStock.push({
            item_id: result.rows[0].item_id,
            quantity: item.quantity,
            stock_quantity: stockQuantity,
          });
        }
      }
    } catch (error) {
      // console.error(`Error with item_id ${item.item_id}:`, error.message);
      throw error;
    }

    if (lowStock.length > 0) {
      return res.status(400).json({
        message:
          "Some items cannot be dispatched as their quantity exceeds the stock quantity.",
        lowStock: lowStock,
      });
    }

    //Update Dispatch Records
    const result = await pool.query(
      `INSERT INTO dispatch_records (destination_type, destination_id, user_id, notes)
        VALUES ($1, $2, $3, $4) RETURNING dispatch_id`,
      [destination_type, destination_id, user_id, notes]
    );

    const dispatch_id = result.rows[0]["dispatch_id"];

    for (const item of dispatch) {
      // Get location_id
      const location_result = await pool.query(
        "SELECT * FROM locations WHERE location_name = $1",
        [item.location]
      );
      const location_id = location_result.rows[0]?.location_id;
      if (!location_id) {
        throw new Error(`Location ${item.location} not found.`);
      }

      // Get Stock ID
      const stock_result = await pool.query(
        "SELECT * FROM inventory_stock WHERE item_id = $1 and location_id = $2",
        [item.item_id, location_id]
      );
      const stock_id = stock_result.rows[0]?.stock_id;

      if (!stock_id) {
        throw new Error(
          `Inventory record for this item in location '${item.location}' not found. It may not have been created yet.`
        );
      }

      //Update Dispatched Items
      await pool.query(
        `INSERT INTO dispatched_items (dispatch_id, item_id, stock_id, quantity) VALUES ($1, $2, $3, $4)`,
        [dispatch_id, item.item_id, stock_id, item.quantity]
      );

      //Update Inventory Quantity
      await pool.query(
        "UPDATE inventory_stock SET quantity = quantity - $1 WHERE stock_id = $2",
        [item.quantity, stock_id]
      );
    }

    res.status(201).json({ message: "Dispatch added successfully" });
  } catch (error) {
    console.error("Error adding dispatch record:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function getAllDispatchRecord(req, res) {
  try {
    // Get all dispatch records
    const result = await pool.query(`SELECT
        dr.dispatch_id,
        dr.destination_type,
        CASE
          WHEN dr.destination_type = 'vessel' THEN v.vessel_name
          WHEN dr.destination_type = 'department' THEN d.department_name
          ELSE NULL
        END AS destination_name,
        u.username,
        u.full_name,
        dr.notes,
        dr.dispatch_date,
        dr.status
        FROM dispatch_records dr
        LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
        LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
        LEFT JOIN users u ON dr.user_id = u.user_id
        WHERE dr.isdeleted = FALSE
        ORDER BY dr.dispatch_id DeSC;

        `);

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch records:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getDispatchById(req, res) {
  const { dispatchId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        dr.dispatch_id,
        dr.destination_type,
        CASE
          WHEN dr.destination_type = 'vessel' THEN v.vessel_name
          WHEN dr.destination_type = 'department' THEN d.department_name
          ELSE NULL
        END AS destination_name,
        u.username,
        dr.notes,
        dr.dispatch_date,
        dr.status
        FROM dispatch_records dr
        LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
        LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
        LEFT JOIN users u ON dr.user_id = u.user_id
        WHERE dr.dispatch_id = $1 AND dr.isdeleted = FALSE;
        `,
      [dispatchId]
    );

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }
    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch by ID:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getDispatchedItemById(req, res) {
  const { dispatchId } = req.params;
  try {
    //todo: Ensure that if dispatch record is deleted, we cant get any values below
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
              di.stock_id,
              di.quantity,
              di.remarks,
              iv.location_id,
              iv.item_id,
              l.location_name,
              dr.dispatch_date
              FROM dispatched_items di
              LEFT JOIN dispatch_records dr ON di.dispatch_id = dr.dispatch_id
              LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
              LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
              LEFT JOIN inventory i ON di.item_id = i.id
              LEFT JOIN inventory_stock iv ON di.stock_id = iv.stock_id
              LEFT JOIN locations l ON iv.location_id = l.location_id
              WHERE di.dispatch_id = $1 AND di.isdeleted = FALSE
              ORDER BY i.name ASC;
              `,
      [dispatchId]
    );

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatched items by ID:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getAllDispatchedItems(req, res) {
  try {
    //todo: Ensure that if dispatch record is deleted, we cant get any values below
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
              di.stock_id,
              di.quantity,
              di.remarks,
              iv.location_id,
              iv.item_id,
              l.location_name,
              dr.dispatch_date
              FROM dispatched_items di
              LEFT JOIN dispatch_records dr ON di.dispatch_id = dr.dispatch_id
              LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
              LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
              LEFT JOIN inventory i ON di.item_id = i.id
              LEFT JOIN inventory_stock iv ON di.stock_id = iv.stock_id
              LEFT JOIN locations l ON iv.location_id = l.location_id
              WHERE di.isdeleted = FALSE
              ORDER BY di.dispatch_id ASC;
              `
    );

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    res
      .status(200)
      .json({ message: "Dispatched Items Found", data: result.rows });
  } catch (error) {
    console.error("Error getting all dispatched items:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getDispatchByUser(req, res) {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        dr.dispatch_id,
        dr.destination_type,
        CASE
          WHEN dr.destination_type = 'vessel' THEN v.vessel_name
          WHEN dr.destination_type = 'department' THEN d.department_name
          ELSE NULL
        END AS destination_name,
        u.username,
        dr.notes,
        dr.dispatch_date
        FROM dispatch_records dr
        LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
        LEFT JOIN departments d ON dr.destination_type = 'department' AND dr.destination_id = d.department_id
        LEFT JOIN users u ON dr.user_id = u.user_id
        WHERE u.user_id = $1 AND dr.isdeleted = FALSE;
          `,
      [userId]
    );

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }
    res
      .status(200)
      .json({ message: "Dispatch Record Found", data: result.rows });
  } catch (error) {
    console.error("Error getting dispatch by user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateDispatchRecord(req, res) {
  const { dispatchId } = req.params;
  const { user_id, destination_type, destination_id, notes, dispatch_date } =
    req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM dispatch_records WHERE dispatch_id = $1 AND isdeleted = FALSE;",
      [dispatchId]
    );
    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }
    const updates = [];
    for (const key in req.body) {
      if (req.body[key] != result.rows[0][key]) {
        updates.push({
          field_name: key,
          old_value: result.rows[0][key],
          new_value: req.body[key],
        });
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields were changed. Update aborted." });
    }
    console.log(updates);

    // Update Dispatch Records
    await pool.query(
      `UPDATE dispatch_records SET
      destination_type = $1, destination_id = $2, dispatch_date = $3,
      last_updated = CURRENT_TIMESTAMP, notes = $4
      WHERE dispatch_id = $5
      `,
      [destination_type, destination_id, dispatch_date, notes, dispatchId]
    );

    // Update Dispatch Change Logs
    for (const item of updates) {
      await pool.query(
        `INSERT INTO dispatch_change_log
        (dispatch_id, field_name, old_value, new_value, changed_by, notes)
        VALUES ($1, $2, $3, $4, $5, 'Dispatch_Records: Value Change)
        `,
        [dispatchId, item.field_name, item.old_value, item.new_value, user_id]
      );
    }

    res.status(200).json({ message: "Updated dispatch records successfully" });
  } catch (error) {
    console.error("Error updating dispatch record:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}
// Todo: Ensure in the front end that if multiple location to same item id, and location update makes all location same, add it up and send as one not two
export async function updateDispatchedItem(req, res) {
  const { dispatchId } = req.params;
  const {
    dispatch, // Has item_id, quantity and location
    user_id,
    dispatch_status,
  } = req.body;

  const client = await pool.connect();
  console.log("Dispatch Item Update Body:", req.body);
  console.log("Dispatch ID:", dispatchId);

  try {
    await client.query("BEGIN"); // Start transaction

    // Fetch existing dispatched items and their locations
    const result = await client.query(
      `SELECT di.*, loc.location_name
      FROM dispatched_items di
      LEFT JOIN inventory_stock ist ON di.stock_id = ist.stock_id
      LEFT JOIN locations loc ON ist.location_id = loc.location_id 
      WHERE di.dispatch_id = $1 AND di.isdeleted = FALSE`,
      [dispatchId]
    );
    const existingDispatchItems = result.rows;

    const noUpdate = [];
    const changedQuantity = [];
    const removedItem = [];
    const addedItem = [];
    const changedLocation = [];
    const changedDispatchStatus = [];

    const existingMap = new Map();
    const dispatchMap = new Map();

    existingDispatchItems.forEach((item) => {
      const existingKey = `${item.item_id}_${item.location_name}`;
      existingMap.set(existingKey, item);
    });
    dispatch.forEach((item) => {
      const dispatchKey = `${item.item_id}_${item.location}`;
      dispatchMap.set(dispatchKey, item);
    });

    // Status Check
    const statusResult = await client.query(
      "SELECT status FROM dispatch_records WHERE dispatch_id = $1 AND isdeleted = FALSE",
      [dispatchId]
    );
    const currentStatus = statusResult.rows[0]?.status;

    if (currentStatus !== dispatch_status) {
      changedDispatchStatus.push({
        old_value: currentStatus,
        new_value: dispatch_status,
        dispatch_id: dispatchId,
        field_name: "status",
        notes: "Dispatch_Records: Status Change",
      });
    }

    // Check for unchanged, changed quantity, and removed
    for (const [key, existingItems] of existingMap.entries()) {
      if (dispatchMap.has(key)) {
        const newItem = dispatchMap.get(key);
        const item_id = existingItems.item_id;
        if (
          existingItems.quantity == newItem.quantity &&
          existingItems.location_name == newItem.location
        ) {
          noUpdate.push({
            item_id: item_id,
            quantity: existingItems.quantity,
          });
        } else if (existingItems.quantity != newItem.quantity) {
          changedQuantity.push({
            item_id: item_id,
            old_value: existingItems.quantity,
            new_value: newItem.quantity,
            stock_id: existingItems.stock_id,
          });
        }

        // Checking for Changed Location
        if (existingItems.location_name != newItem.location) {
          const location_result = await client.query(
            "SELECT * FROM locations WHERE location_name = $1",
            [newItem.location]
          );
          const location_id = location_result.rows[0]?.location_id;
          if (!location_id) {
            throw new Error(`Location ${newItem.location} not found.`);
          }

          const result = await client.query(
            "SELECT * FROM inventory_stock WHERE item_id = $1 AND location_id = $2 AND isdeleted = FALSE;",
            [item_id, location_id]
          );

          let new_stock_id = result.rows[0]?.stock_id;

          if (!new_stock_id) {
            throw new Error(
              `Inventory record for this item in location '${newItem.location}' not found. It may not have been created yet.`
            );
          }

          changedLocation.push({
            item_id: item_id,
            old_value: existingItems.location_name,
            new_value: newItem.location,
            old_stock_id: existingItems.stock_id,
            new_stock_id: new_stock_id,
          });
        }
      } else {
        // Item existed before but not in new dispatch = removed
        const item_id = existingItems.item_id;
        removedItem.push({
          item_id: item_id,
          quantity: existingItems.quantity,
          stock_id: existingItems.stock_id,
        });
      }
    }

    // Check for newly added items
    for (const [key, newItem] of dispatchMap.entries()) {
      if (!existingMap.has(key)) {
        const [item_id, location] = key.split("_");
        addedItem.push({
          item_id,
          quantity: newItem.quantity,
          location: location,
        });
      }
    }

    // Abort if no changes were made
    if (
      noUpdate.length === dispatch.length &&
      removedItem.length === 0 &&
      changedDispatchStatus.length === 0
    ) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "No fields were changed. Update aborted." });
    }
    // Check if quantity to be dispatched is less than available quantity
    const lowStock = [];
    try {
      for (const item of addedItem) {
        const location_result = await client.query(
          "SELECT * FROM locations WHERE location_name = $1",
          [item.location]
        );
        const location_id = location_result.rows[0]?.location_id;
        if (!location_id) {
          throw new Error(`Location ${item.location} not found.`);
        }

        const result = await client.query(
          "SELECT * FROM inventory_stock WHERE item_id = $1 AND location_id = $2 AND isdeleted = FALSE;",
          [item.item_id, location_id]
        );
        const stockQuantity = result.rows[0].quantity;

        if (item.quantity > stockQuantity) {
          lowStock.push({
            item_id: item.item_id,
            quantity: { prevValue: 0, currentValue: item.quantity },
            stock_quantity: stockQuantity,
          });
        }
      }

      for (const item of changedQuantity) {
        const result = await client.query(
          "SELECT * FROM inventory_stock WHERE stock_id = $1 AND isdeleted = FALSE;",
          [item.stock_id]
        );
        const stockQuantity = result.rows[0].quantity;
        if (item.old_value < item.new_value) {
          const difference = item.new_value - item.old_value;
          if (difference > stockQuantity) {
            lowStock.push({
              item_id: item.item_id,
              quantity: {
                prevValue: item.old_value,
                currentValue: item.new_value,
              },
              stock_quantity: stockQuantity,
            });
          }
        }
      }
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating dispatched item:", error.message);
      throw error;
    }

    if (lowStock.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "Some items cannot be updated as their quantity exceeds the stock quantity.",
        lowStock: lowStock,
      });
    }

    // Update Changed Location
    for (const item of changedLocation) {
      const old_quantity = existingMap.get(item.item_id).quantity;
      await client.query(
        "UPDATE inventory_stock SET quantity = quantity + $1 WHERE stock_id = $2",
        [old_quantity, item.old_stock_id]
      );

      const exisingItemInChangedQuantity = changedQuantity.find(
        (quanItem) => quanItem.item_id === item.item_id
      );
      console.log(exisingItemInChangedQuantity);

      if (!exisingItemInChangedQuantity) {
        const new_quantity = dispatchMap.get(item.item_id).quantity;
        await client.query(
          "UPDATE inventory_stock SET quantity = quantity - $1 WHERE stock_id = $2",
          [new_quantity, item.new_stock_id]
        );
      }
      await client.query(
        "UPDATE dispatched_items SET stock_id = $1 WHERE dispatch_id = $2 AND stock_id = $3",
        [item.new_stock_id, dispatchId, item.old_stock_id]
      );
    }

    // Update Changed Quantity
    for (const item of changedQuantity) {
      const difference = Math.abs(item.new_value - item.old_value);
      await client.query(
        "UPDATE inventory_stock SET quantity = quantity + $1 WHERE stock_id = $2",
        [
          item.old_value > item.new_value ? difference : -difference,
          item.stock_id,
        ]
      );
      await client.query(
        "UPDATE dispatched_items SET quantity = $1 WHERE dispatch_id = $2 AND stock_id = $3",
        [item.new_value, dispatchId, item.stock_id]
      );
      await client.query(
        `INSERT INTO dispatch_change_log 
        (dispatch_id, field_name, old_value, new_value, notes, changed_by)
        VALUES ($1, 'quantity', $2, $3, 'Dispatched_items: Quantity Change', $4)`,
        [dispatchId, item.old_value, item.new_value, user_id]
      );
    }

    // Update Removed Item
    for (const item of removedItem) {
      await client.query(
        "UPDATE inventory_stock SET quantity = quantity + $1 WHERE stock_id = $2",
        [item.quantity, item.stock_id]
      );
      await client.query(
        "UPDATE dispatched_items SET isdeleted = TRUE WHERE dispatch_id = $1 AND stock_id = $2",
        [dispatchId, item.stock_id]
      );
      await client.query(
        `INSERT INTO dispatch_change_log 
        (dispatch_id, field_name, old_value, new_value, notes, changed_by)
        VALUES ($1, 'quantity', $2, 0, 'Dispatched_items: Removed', $3)`,
        [dispatchId, item.quantity, user_id]
      );
    }

    // Add new Items
    for (const item of addedItem) {
      const location_result = await client.query(
        "SELECT * FROM locations WHERE location_name = $1",
        [item.location]
      );
      const location_id = location_result.rows[0]?.location_id;
      if (!location_id) {
        throw new Error(`Location ${item.location} not found.`);
      }

      const result = await client.query(
        "SELECT * FROM inventory_stock WHERE item_id = $1 AND location_id = $2 AND isdeleted = FALSE;",
        [item.item_id, location_id]
      );

      const stock_id = result.rows[0]?.stock_id;

      await client.query(
        `INSERT INTO dispatched_items (dispatch_id, item_id, quantity, stock_id)
        VALUES ($1, $2, $3, $4)`,
        [dispatchId, item.item_id, item.quantity, stock_id]
      );
      await client.query(
        `UPDATE inventory_stock SET quantity = quantity - $1 WHERE stock_id = $2`,
        [item.quantity, stock_id]
      );
      await client.query(
        `INSERT INTO dispatch_change_log 
        (dispatch_id, field_name, old_value, new_value, notes, changed_by)
        VALUES ($1, 'quantity', 0, $2, 'Dispatched_items: Newly Added Item', $3)`,
        [dispatchId, item.quantity, user_id]
      );
    }

    // Update Dispatch Status if changed
    if (changedDispatchStatus.length > 0) {
      await client.query(
        `UPDATE dispatch_records SET status = $1 WHERE dispatch_id = $2`,
        [dispatch_status, dispatchId]
      );
      for (const status of changedDispatchStatus) {
        await client.query(
          `INSERT INTO dispatch_change_log 
          (dispatch_id, field_name, old_value, new_value, notes, changed_by)
          VALUES ($1, 'status', $2, $3, 'Dispatch_Records: Status Change', $4)`,
          [status.dispatch_id, status.old_value, status.new_value, user_id]
        );
      }
    }
    // if (dispatch_status === "cancelled"){

    // }

    await client.query("COMMIT"); // Commit transaction

    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error updating dispatched item:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release(); // Always release the client
  }
}

export async function deleteDispatchRecord(req, res) {
  const { dispatchId } = req.params;
  const { user_id } = req.body;
  try {
    // Delete entire dispatch record and restore inventory
    const result = await pool.query(
      "SELECT * FROM dispatched_items WHERE dispatch_id = $1 AND isdeleted = FALSE",
      [dispatchId]
    );

    const existingDispatch = result.rows;
    if (existingDispatch.length === 0) {
      return res.status(200).json({ message: "No dispatch Record" });
    }

    for (const item of existingDispatch) {
      // Update dispatched items
      await pool.query(
        "UPDATE dispatched_items SET isdeleted = TRUE WHERE dispatch_id = $1",
        [item.dispatch_id]
      );

      // Update inventory stock
      await pool.query(
        "UPDATE inventory_stock SET quantity = quantity + $1 WHERE dispatch_id = $2 AND stock_id = $3",
        [item.quantity, dispatchId, item.stock_id]
      );

      //Update Dispatch Change Logs
      await pool.query(
        `INSERT INTO dispatch_change_log 
          (dispatch_id, field_name, old_value, new_value, notes, changed_by)
          VALUES ($1, 'quantity', $2, 0, 'Dispatched_items: Removed', $3)
          `,
        [dispatchId, item.quantity, user_id]
      );
    }

    // Update dispatch records
    await pool.query(
      "UPDATE dispatch_records SET isdeleted = TRUE WHERE dispatch_id = $1",
      [dispatchId]
    );

    res.status(200).json({ message: "Records Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting dispatch record:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLocations(req, res) {
  try {
    const result = await pool.query("SELECT * FROM locations");
    if (result.rows.length == 0) {
      return res.status(200).json({ data: [], message: "No Locations" });
    }
    res.status(200).json({ message: "Locations Found", data: result.rows });
  } catch (error) {
    console.error("Error getting locations:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getDepartments(req, res) {
  try {
    const result = await pool.query(
      "SELECT department_id, department_name FROM departments"
    );
    if (result.rows.length == 0) {
      return res.status(200).json({ data: [], message: "No Departments" });
    }
    res.status(200).json({ message: "Departments Found", data: result.rows });
  } catch (error) {
    console.error("Error getting departments:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getVessels(req, res) {
  try {
    const result = await pool.query("SELECT * FROM vessels");
    if (result.rows.length == 0) {
      return res.status(200).json({ data: [], message: "No Vessels" });
    }
    res.status(200).json({ message: "Vessels Found", data: result.rows });
  } catch (error) {
    console.error("Error getting vessels:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getDispatchedItemsByVessel(req, res) {
  const { vesselId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT
        di.id,
        di.dispatch_id,
        v.vessel_name,
        i.name AS item_name,
        i.part_number,
        di.stock_id,
        di.quantity,
        di.remarks,
        iv.location_id,
        iv.item_id,
        l.location_name,
        dr.dispatch_date,
        dr.status,
        u.full_name
      FROM dispatched_items di
      LEFT JOIN dispatch_records dr ON di.dispatch_id = dr.dispatch_id
      LEFT JOIN vessels v ON dr.destination_type = 'vessel' AND dr.destination_id = v.vessel_id
      LEFT JOIN inventory i ON di.item_id = i.id
      LEFT JOIN inventory_stock iv ON di.stock_id = iv.stock_id
      LEFT JOIN locations l ON iv.location_id = l.location_id
      LEFT JOIN users u on dr.user_id = u.user_id
      WHERE v.vessel_id = $1 AND di.isdeleted = FALSE
      ORDER BY dr.dispatch_date DESC, di.dispatch_id, i.name ASC;
      `,
      [vesselId]
    );

    const rows = result.rows;

    if (!rows.length) {
      return res
        .status(200)
        .json({ message: "No dispatched items found", data: [] });
    }

    // Group dispatch items by dispatch_id
    const grouped = {};
    rows.forEach((row) => {
      const {
        dispatch_id,
        dispatch_date,
        status,
        vessel_name,
        id,
        item_name,
        part_number,
        quantity,
        location_name,
        full_name,
        remarks,
      } = row;

      if (!grouped[dispatch_id]) {
        grouped[dispatch_id] = {
          dispatch_id,
          dispatch_date,
          destination_name: vessel_name,
          status,
          full_name,
          items: [],
        };
      }

      grouped[dispatch_id].items.push({
        id,
        name: item_name,
        part_number,
        quantity,
        location_name,
        remarks,
      });
    });

    const formatted = Object.values(grouped);

    res.status(200).json({
      message: "Dispatched items found",
      data: formatted,
    });
  } catch (error) {
    console.error("Error getting dispatched items by vessel:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getFrequentlyDispatchedItems(req, res) {
  try {
    const { limit } = req.params;
    const result = await pool.query(
      `SELECT
      iv.item_id,
      i.name,
      i.part_number,
      ic.name AS category,
      SUM(di.quantity) AS total_quantity
      FROM dispatched_items di
      LEFT JOIN inventory_stock iv ON di.stock_id = iv.stock_id
      LEFT JOIN inventory i ON iv.item_id = i.id
      LEFT JOIN item_categories ic ON i.category_id = ic.category_id
      WHERE di.isdeleted = FALSE
      GROUP BY iv.item_id, i.name, i.part_number, ic.name
      ORDER BY total_quantity DESC
      LIMIT $1;`,
      [limit]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(
      "Error getting all frequently dispatched items:",
      error.message
    );
    res.status(500).json({ message: "Server error" });
  }
}
