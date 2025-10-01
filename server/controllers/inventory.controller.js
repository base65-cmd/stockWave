import pool from "../lib/db/db.js";

export async function getAllInventory() {
  try {
    const result = await pool.query(`
            SELECT 
            i.id AS item_id,
            i.name,
            i.part_number,
            i.description,
            i.barcode,
            i.price,
            i.currency,
            ic.name AS category,
            l.location_name AS location,
            sl.shelf_code AS shelf,
            sl.description AS shelf_description,
            s.quantity,
            s.stock_id,
            s.last_updated,
            s.min_inventory_level
            FROM inventory i
            LEFT JOIN item_categories ic ON i.category_id = ic.category_id
            LEFT JOIN inventory_stock s ON i.id = s.item_id
            LEFT JOIN locations l ON s.location_id = l.location_id
            LEFT JOIN shelf_locations sl ON s.shelf_id = sl.shelf_id
            WHERE i.isdeleted = FALSE AND s.isdeleted = FALSE
            ORDER BY item_id ASC ;
            `);
    return result;
  } catch (error) {
    throw error;
  }
}

async function fetchItemById(id) {
  try {
    const result = await getAllInventory();
    const allInventory = result.rows;

    const gottenInventory = [];

    allInventory.forEach((inventory) => {
      if (inventory.stock_id == id) {
        gottenInventory.push(inventory);
      }
    });
    return gottenInventory;
  } catch (error) {
    throw error;
  }
}

export const getInventoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
              i.id AS item_id,
              i.name,
              i.part_number,
              i.description,
              i.barcode,
              i.price,
              i.currency,
              ic.name AS category,
              l.location_name AS location,
              sl.shelf_code AS shelf,
              sl.description AS shelf_description,
              s.quantity,
              s.stock_id,
              s.last_updated,
              s.min_inventory_level
              FROM inventory i
              LEFT JOIN item_categories ic ON i.category_id = ic.category_id
              LEFT JOIN inventory_stock s ON i.id = s.item_id
              LEFT JOIN locations l ON s.location_id = l.location_id
              LEFT JOIN shelf_locations sl ON s.shelf_id = sl.shelf_id
              WHERE i.isdeleted = FALSE AND s.isdeleted = FALSE AND s.stock_id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not Found" });
    }
    res
      .status(200)
      .json({ inventory: result.rows, message: "Inventory item found" });
  } catch (error) {
    console.log("error in getInventoryById controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getInventoryByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      `
      WITH RECURSIVE category_tree AS (
        SELECT category_id
        FROM item_categories
        WHERE name = $1
  
        UNION ALL
  
        SELECT ic.category_id
        FROM item_categories ic
        INNER JOIN category_tree ct ON ic.parent_id = ct.category_id
      )
      SELECT 
        i.id AS item_id,
        i.name,
        i.part_number,
        i.description,
        i.barcode,
        i.price,
        i.currency,
        ic.name AS category,
        l.location_name AS location,
        sl.shelf_code AS shelf,
        sl.description AS shelf_description,
        s.quantity,
        s.last_updated,
        s.stock_id
      FROM inventory i
      LEFT JOIN item_categories ic ON i.category_id = ic.category_id
      LEFT JOIN inventory_stock s ON i.id = s.item_id
      LEFT JOIN locations l ON s.location_id = l.location_id
      LEFT JOIN shelf_locations sl ON s.shelf_id = sl.shelf_id
      WHERE 
        i.isdeleted = FALSE 
        AND s.isdeleted = FALSE 
        AND i.category_id IN (SELECT category_id FROM category_tree);
      `,
      [category]
    );
    if (result.rows.length === 0) {
      return res.json({ data: [], message: "Items not Found" });
    }
    res.status(200).json({ data: result.rows, message: "Inventor Item Found" });
  } catch (error) {
    console.log("error in getInventoryByCategory controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getShelfLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.location_name, sl.shelf_code 
      FROM shelf_locations sl
      LEFT JOIN locations l ON sl.location_id = l.location_id
    `);

    res.status(200).json({ shelf_locations: result.rows });
  } catch (error) {
    console.error("Error fetching shelf locations:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM locations
    `);

    res.status(200).json({ locations: result.rows });
  } catch (error) {
    console.error("Error fetching shelf locations:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM item_categories");
    res.status(200).json({ allCategories: result.rows });
  } catch (error) {
    console.error("Error fetching all categories:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const result = await getAllInventory();
    const inventory = result.rows;

    if (inventory.length === 0) {
      return res.status(404).json({ message: "No inventory Found" });
    }
    res.status(200).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUniqueInventory = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT DISTINCT ON (item_id)
            i.id AS item_id,
            i.name,
            i.description,
            i.barcode,
            i.price,
			      i.part_number,
            i.currency,
            ic.name AS category,
            l.location_name AS location,
            sl.shelf_code AS shelf,
            sl.description AS shelf_description,
            s.quantity,
            s.stock_id,
            s.last_updated,
            s.min_inventory_level
            FROM inventory i
            LEFT JOIN item_categories ic ON i.category_id = ic.category_id
            LEFT JOIN inventory_stock s ON i.id = s.item_id
            LEFT JOIN locations l ON s.location_id = l.location_id
            LEFT JOIN shelf_locations sl ON s.shelf_id = sl.shelf_id
            WHERE i.isdeleted = FALSE AND s.isdeleted = FALSE
			 ORDER BY item_id ASC; `);
    const inventory = result.rows;
    if (inventory.length === 0) {
      return res.status(404).json({ message: "No inventory Found" });
    }
    res.status(200).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Todo: getting error and item still adding fix this
export const addInventory = async (req, res) => {
  const {
    name,
    part_number,
    description,
    barcode,
    price,
    currency,
    category,
    stock_entries, //has location, shelf and quantity
    user_id,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //Check if item already exists
    const existingItem = await client.query(
      "SELECT * FROM inventory WHERE part_number = $1",
      [part_number]
    );

    if (existingItem.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: `Item ${name} already exists.` });
    }

    const category_result = await client.query(
      "SELECT * FROM item_categories WHERE name = $1",
      [category]
    );
    const category_id = category_result.rows[0]?.category_id || null; //Foreign Key Id
    const priceValue = [parseInt(price.toString().replace(/,/g, ""), 10)];
    console.log("Price Value:", priceValue); // Log the price value for debugging

    // Update Inventory Table
    const result = await client.query(
      `INSERT INTO inventory (name, part_number, description, currency, price, category_id, barcode, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        part_number,
        description,
        currency,
        priceValue,
        category_id,
        barcode,
        user_id,
      ]
    );
    const item_id = result.rows[0]["id"]; //Foreign Key Id

    // Loop through stock_entries and update inventory stock
    for (const stock of stock_entries) {
      const { location, shelf, quantity } = stock;

      // Get location_id
      const location_result = await client.query(
        "SELECT * FROM locations WHERE location_name = $1",
        [location]
      );
      const location_id = location_result.rows[0]?.location_id;
      if (!location_id) {
        throw new Error(`Location ${location} not found.`);
      }

      // Get shelf_id
      const shelf_result = await client.query(
        "SELECT * FROM shelf_locations WHERE shelf_code = $1",
        [shelf]
      );

      const shelf_id = shelf_result.rows[0]?.shelf_id;
      if (!shelf_id) {
        throw new Error(`Shelf ${shelf} not found.`);
      }

      // Insert into inventory_stock
      const res = await client.query(
        "INSERT INTO inventory_stock (item_id, location_id, quantity, shelf_id) VALUES ($1, $2, $3, $4) RETURNING stock_id",
        [item_id, location_id, quantity, shelf_id]
      );

      const stock_id = res.rows[0]?.stock_id;

      // Update Inventory Record
      await client.query(
        `INSERT INTO inventory_records (stock_id, task, updated_by) 
      VALUES ($1, 'addInventory', $2)`,
        [stock_id, user_id]
      );
    }

    await client.query("COMMIT");

    res
      .status(201)
      .json({ data: result.rows, message: "Inventory added successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error adding inventory:", error.message); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message }); // Handle errors
  } finally {
    client.release();
  }
};

export const addBulkInventory = async (req, res) => {
  const { multipleInventory, user_id } = req.body;
  const unableToAdd = []; // Store items that couldn't be added
  try {
    for (const inventory of multipleInventory) {
      try {
        //Check if item already exists
        const existingItem = await pool.query(
          "SELECT * FROM inventory WHERE part_number = $1 AND isdeleted = FALSE",
          [inventory.part_number]
        );

        if (existingItem.rows.length > 0) {
          // If item exists, log and add to list
          console.log(`Item ${inventory.name} already exists.`);
          unableToAdd.push(inventory.name);
          continue;
        }

        // Getting Category ID
        const category_result = await pool.query(
          "SELECT * FROM item_categories WHERE name = $1",
          [inventory.category]
        );
        const category_id = category_result.rows[0]["category_id"]; //Foreign Key Id

        // Update Inventory Table
        const result = await pool.query(
          `INSERT INTO inventory (name, part_number, description, currency, price, category_id, barcode, created_by)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            inventory.name,
            inventory.part_number,
            inventory.description,
            inventory.currency,
            inventory.price,
            category_id,
            inventory.barcode,
            user_id,
          ]
        );

        // Loop through stock_entries and update inventory stock
        for (const stock of inventory.stock_entries) {
          const { location, shelf, quantity } = stock;

          // Get location_id
          const location_result = await pool.query(
            "SELECT * FROM locations WHERE location_name = $1",
            [location]
          );
          const location_id = location_result.rows[0]?.location_id;
          if (!location_id) {
            throw new Error(`Location ${location} not found.`);
          }

          // Get shelf_id
          const shelf_result = await pool.query(
            "SELECT * FROM shelf_locations WHERE shelf_code = $1",
            [shelf]
          );

          const shelf_id = shelf_result.rows[0]?.shelf_id;
          if (!shelf_id) {
            throw new Error(`Shelf ${shelf} not found.`);
          }

          // Insert into inventory_stock
          const res = await pool.query(
            "INSERT INTO inventory_stock (item_id, location_id, quantity, shelf_id) VALUES ($1, $2, $3, $4)",
            [item_id, location_id, quantity, shelf_id]
          );
          const stock_id = res.rows[0]?.stock_id;
          // Update Inventory Record
          await pool.query(
            `INSERT INTO inventory_records (item_id, task, updated_by) 
          VALUES ($1, 'addInventory', $2)`,
            [stock_id, user_id]
          );
        }
      } catch (error) {
        console.log(`unable to add ${inventory.name}`);
        throw error;
      }
    }
    if (unableToAdd.length == 0) {
      return res
        .status(201)
        .json({ message: "All Inventory added successfully" });
    } else if (unableToAdd.length == multipleInventory.length) {
      return res
        .status(409)
        .json({ message: "No items were added because they already exist." });
    } else {
      return res.status(207).json({
        message:
          "Some inventory items were added, but these items already exist:",
        unableToAdd,
      });
    }
  } catch (error) {
    console.log("Error adding multiple inventory:", error.message); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message }); // Handle errors
  }
};

export const updateInventory = async (req, res) => {
  //TODO 1: Ensure That on the front end, price is in two decimal places
  // Allowing change from all except location
  const { id } = req.params;
  const {
    name,
    part_number,
    description,
    barcode,
    price,
    currency,
    category,
    stock_entries, //has stock_id, location, shelf and quantity
    user_id,
  } = req.body;

  try {
    //Check for Exisiting Inventory
    const existingInventory = await fetchItemById(id);

    if (existingInventory.length === 0) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    //Log Updates
    const updates = [];
    const changeLogs = [];
    const deleted = [];

    const currentStock = await pool.query(
      `SELECT * FROM inventory_stock WHERE stock_id = $1 AND isdeleted = FALSE`,
      [id]
    );
    const existingStocks = currentStock.rows;

    // Update other fields except stock entries
    for (const key in req.body) {
      if (key === "stock_entries" || key === "user_id") continue;

      const newVal = req.body[key];
      const oldVal = existingInventory[0][key];

      const normalizedNew =
        newVal === null || newVal === undefined ? "" : newVal;
      const normalizedOld =
        oldVal === null || oldVal === undefined ? "" : oldVal;

      if (normalizedNew !== normalizedOld) {
        updates.push({ field: `${key} change`, value: newVal });
        changeLogs.push({
          field: key,
          old: oldVal,
          new: newVal,
        });
      }
    }

    const existingStockMap = new Map();
    for (const stock of existingStocks) {
      existingStockMap.set(`${stock.stock_id}`, stock);
    }

    const updatedStockMap = new Map();
    for (const stock of stock_entries) {
      updatedStockMap.set(`${stock.stock_id}`, stock);
    }
    console.log("Existing Stock Map:", existingStockMap);
    console.log("Updated Stock Map:", updatedStockMap);

    let incoming_location_id;
    let incoming_shelf_id;
    // Detect removed or changed entries
    for (const [key, existing] of existingStockMap) {
      const incoming = updatedStockMap.get(key);
      if (incoming) {
        // Get location_id
        const location_result = await pool.query(
          "SELECT * FROM locations WHERE location_name = $1",
          [incoming.location]
        );
        incoming_location_id = location_result.rows[0]?.location_id;
        if (!incoming_location_id) {
          throw new Error(`Location ${incoming.location} not found.`);
        }
        // Get shelf_id
        const shelf_result = await pool.query(
          "SELECT * FROM shelf_locations WHERE shelf_code = $1",
          [incoming.shelf]
        );

        incoming_shelf_id = shelf_result.rows[0]?.shelf_id;
        if (!incoming_shelf_id) {
          throw new Error(`Shelf ${incoming.shelf} not found.`);
        }
      }

      if (!incoming) {
        //Stock removed
        deleted.push({
          stock_id: existing.stock_id,
        });
        updates.push({
          field: "deleted stock",
          value: existingStockMap.get(key),
        });
        changeLogs.push({
          field: "all",
          old: `stock_id:${existing.stock_id} location:${existing.location_id} shelf:${existing.shelf_id} quantity:${existing.quantity}`,
          new: "deleted",
        });
      }
      if (incoming.quantity != existing.quantity) {
        // Update Quantity
        updates.push({ field: "quantity change", value: incoming.quantity });
        changeLogs.push({
          field: "quantity",
          old: existing.quantity,
          new: incoming.quantity,
        });
      }
      if (incoming_location_id != existing.location_id) {
        // Location Change
        updates.push({ field: "location change", value: incoming.location });
        changeLogs.push({
          field: "location_id",
          old: existing.location_id,
          new: incoming.location_id,
        });
      }
      if (incoming_shelf_id != existing.shelf_id) {
        // Shelf Change
        updates.push({ field: "shelf change", value: incoming.shelf });
        changeLogs.push({
          field: "shelf_id",
          old: existing.shelf_id,
          new: incoming.shelf_id,
        });
      }
    }

    // Detect new Entry
    for (const [key, updated] of updatedStockMap) {
      if (key === "new" || key === "") {
        // Only log truly new entries
        updates.push({ field: "new entry", value: updated });
        changeLogs.push({
          field: "all",
          old: null,
          new: updated,
        });
      }
    }

    // Checking for Updates
    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "No fields were changed. Update aborted." });
    }
    console.log("Updates:", updates); // Log updates for debugging

    // Get Foreign Key IDs

    //Category ID
    const category_result = await pool.query(
      "SELECT category_id FROM item_categories WHERE name = $1",
      [category]
    );
    const category_id = category_result.rows[0].category_id;

    //Update the log change table
    try {
      changeLogs.forEach(async (log) => {
        await pool.query(
          `INSERT INTO inventory_change_log (item_id, field_name, old_value, new_value, changed_by)
                  VALUES ($1, $2, $3, $4, $5)`,
          [id, log.field, log.old, log.new, user_id]
        );
      });
    } catch (error) {
      throw error;
    }

    const priceArray = [price];
    //Update Inventory Table
    await pool.query(
      `UPDATE inventory SET
          name = $1,
          part_number = $2,
          description = $3,
          currency = $4,
          price = $5,
          category_id = $6,
          barcode = $7,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = $8;`,
      [
        name,
        part_number,
        description,
        currency,
        priceArray,
        category_id,
        barcode,
        id,
      ]
    );

    // Loop through stock_entries and update inventory stock
    for (const stock of stock_entries) {
      const { location, shelf, quantity, stock_id } = stock;

      // Get Foreign Key IDs

      // Get location_id
      const location_result = await pool.query(
        "SELECT * FROM locations WHERE location_name = $1",
        [location]
      );
      const location_id = location_result.rows[0]?.location_id;
      if (!location_id) {
        throw new Error(`Location ${location} not found.`);
      }

      // Get shelf_id
      const shelf_result = await pool.query(
        "SELECT * FROM shelf_locations WHERE shelf_code = $1",
        [shelf]
      );

      const shelf_id = shelf_result.rows[0]?.shelf_id;
      if (!shelf_id) {
        throw new Error(`Shelf ${shelf} not found.`);
      }

      // For deleted Entries
      for (const stock of deleted) {
        await pool.query(
          "UPDATE inventory_stock SET isdeleted = TRUE WHERE stock_id = $1",
          [stock.stock_id]
        );
      }

      //Update Inventory Stock
      if (stock_id == "new") {
        const res = await pool.query(
          `INSERT INTO inventory_stock (item_id, location_id, shelf_id, quantity)
          VALUES ($1, $2, $3, $4) RETURNING stock_id`,
          [id, location_id, shelf_id, quantity]
        );

        const new_stock_id = res.rows[0]?.stock_id;

        // Update Inventory Record
        await pool.query(
          `INSERT INTO inventory_records (stock_id, task, updated_by)
          VALUES ($1, 'updateInventory', $2)`,
          [new_stock_id, user_id]
        );
      } else {
        await pool.query(
          `UPDATE inventory_stock SET
            location_id = $1,
            shelf_id = $2,
            quantity = $3,
            last_updated = CURRENT_TIMESTAMP
            WHERE stock_id = $4 `,
          [location_id, shelf_id, quantity, stock_id]
        );

        await pool.query(
          `INSERT INTO inventory_records (stock_id, task, updated_by)
          VALUES ($1, 'updateInventory', $2)`,
          [stock_id, user_id]
        );
      }
    }

    res
      .status(200)
      .json({ message: "Inventory Updated Successfully", data: changeLogs });
  } catch (error) {
    console.log("Error in Update Inventory controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateInventoryMinLevel = async (req, res) => {
  const { stock_id } = req.params;
  const { min_inventory_level, user_id } = req.body;

  try {
    // Check if item exists
    const result = await pool.query(
      "SELECT * FROM inventory_stock WHERE stock_id = $1 AND isdeleted = FALSE",
      [stock_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (result.rows[0].min_inventory_level == min_inventory_level) {
      return res.status(400).json({ message: "No change was made" });
    }

    if (min_inventory_level < result.rows[0].quantity) {
      return res.status(400).json({
        message: "Minimum level cannot be set below current quantity",
      });
    }
    // Update the minimum inventory level
    await pool.query(
      "UPDATE inventory_stock SET min_inventory_level = $1 WHERE stock_id = $2",
      [min_inventory_level, stock_id]
    );
    // Log the update in inventory records
    await pool.query(
      `INSERT INTO inventory_records (stock_id, task, updated_by)
      VALUES ($1, 'updateMinInventoryLevel', $2)`,
      [stock_id, user_id]
    );
    res.status(200).json({
      message: "Minimum inventory level updated successfully",
    });
  } catch (error) {
    console.log(
      "Error in Update Inventory Min Level controller",
      error.message
    );
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const restoreInventory = async (req, res) => {
  const { stock_id } = req.params;
  const { user_id } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM inventory_stock WHERE stock_id = $1",
      [stock_id]
    );

    //Check if Item Exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    //Check if item is deleted
    const wasDeleted = result.rows[0]["isdeleted"];
    const item_id = result.rows[0]?.item_id;

    if (!wasDeleted) {
      return res.status(404).json({
        message:
          "Item has not been deleted previously or not found in recycle bin",
      });
    }

    // Update Inventory Record
    await pool.query(
      `INSERT INTO inventory_records (stock_id, task, updated_by) 
      VALUES ($1, 'restoreInventory', $2)`,
      [stock_id, user_id]
    );

    // const inv_result = await pool.query(
    //   "SELECT * FROM inventory_stock WHERE item_id = $1",
    //   [item_id]
    // );

    // if (inv_result.rows.length > 1) {
    //   const allDeleted = inv_result.rows.every(
    //     (inventory) => inventory.isdeleted === true
    //   );

    //   if (allDeleted) {

    //   }
    // }

    // Update Inventory Table
    await pool.query("UPDATE inventory SET isdeleted = FALSE WHERE id = $1", [
      item_id,
    ]);

    // Update Inventory Stock Table
    await pool.query(
      "UPDATE inventory_stock SET isdeleted = FALSE WHERE stock_id = $1",
      [stock_id]
    );

    res.status(200).json({ message: "Inventory Item Restored Successfully" });
  } catch (error) {
    console.log("Error in Restore Inventory controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  const { stock_id } = req.params;
  const { user_id } = req.body;

  try {
    // Check if item exists
    const result = await pool.query(
      "SELECT * FROM inventory_stock WHERE stock_id = $1 AND isdeleted = FALSE",
      [stock_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const item_id = result.rows[0].item_id; // Get the item_id from inventory_stock
    //Update the delete log
    await pool.query(
      "INSERT INTO inventory_delete_log (table_name, item_id, stock_id, deleted_by) VALUES ($1, $2, $3, $4)",
      ["inventory/inventory_stock", item_id, stock_id, user_id]
    );

    //Delete Records. Note that this is a soft delete
    // Check if there are any active (not deleted) inventory_stock records for this item
    const stockCheck = await pool.query(
      `
          SELECT COUNT(*) 
          FROM inventory_stock 
          WHERE item_id = $1 AND isdeleted = FALSE
      `,
      [item_id]
    );

    if (parseInt(stockCheck.rows[0].count) === 1) {
      await pool.query("UPDATE inventory SET isdeleted = TRUE WHERE id = $1", [
        item_id,
      ]); //Deleted from inventory
    }
    await pool.query(
      "UPDATE inventory_stock SET isdeleted = TRUE WHERE stock_id = $1",
      [stock_id]
    ); //Deleted from inventory_stock

    // Update Inventory Record
    await pool.query(
      `INSERT INTO inventory_records (stock_id, task, updated_by) 
      VALUES ($1, 'deleteInventory', $2)`,
      [stock_id, user_id]
    );

    res.status(200).json({ message: "Inventory Deleted Successfully" });
  } catch (error) {
    console.log("Error in Delete Inventory controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const receiveInventory = async (req, res) => {
  const {
    user_id,
    stock_entries, //Includes quantity, item id, vendor, location
  } = req.body;
  try {
    for (const stock of stock_entries) {
      const { quantity, item_id, vendor, location } = stock;

      const result = await pool.query(
        "SELECT * FROM inventory WHERE id = $1 AND isdeleted = FALSE",
        [item_id]
      );

      //Check if Item Exists
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      // Get location_id
      const location_result = await pool.query(
        "SELECT * FROM locations WHERE location_name = $1",
        [location]
      );
      const location_id = location_result.rows[0]?.location_id;
      if (!location_id) {
        throw new Error(`Location ${location} not found.`);
      }

      // Get stock_id
      const stock_result = await pool.query(
        "SELECT * FROM inventory_stock WHERE item_id = $1 AND location_id = $2 AND isdeleted = FALSE",
        [item_id, location_id]
      );
      const stock_id = stock_result.rows[0]?.stock_id;
      if (!stock_id) {
        throw new Error(`Stock not found.`);
      }

      // Stock Previous quantity for stock records
      const old_quantity = stock_result.rows[0]?.quantity;
      const new_quantity = old_quantity + quantity;

      // Get stock_id
      const vendor_result = await pool.query(
        "SELECT vendor_id FROM vendors WHERE name = $1",
        [vendor]
      );
      const vendor_id = vendor_result.rows[0]?.vendor_id;
      if (!stock_id) {
        throw new Error(`Vendor ${vendor} not found.`);
      }

      // Update Inventory Receipts
      await pool.query(
        `INSERT INTO inventory_receipts 
        (stock_id, item_id, vendor_id, location_id, quantity, received_by)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [stock_id, item_id, vendor_id, location_id, quantity, user_id]
      );

      // Update Inventory Stock Table, Adding Quantity
      await pool.query(
        `UPDATE inventory_stock SET quantity = quantity + $1 WHERE stock_id = $2`,
        [quantity, stock_id]
      );

      // Update Inventory Records
      await pool.query(
        `INSERT INTO inventory_records (stock_id, task, updated_by) 
        VALUES ($1, 'receiveInventory', $2)`,
        [stock_id, user_id]
      );

      // Update inventory change logs
      await pool.query(
        `INSERT INTO inventory_change_log (item_id, field_name, old_value, new_value, changed_by)
                VALUES ($1, 'quantity', $2, $3, $4)`,
        [item_id, old_quantity, new_quantity, user_id]
      );
    }

    res.status(200).json({ message: "Inventory Received Successfully" });
  } catch (error) {
    console.log("Error in Receive Inventory controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const lowInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id AS item_id,
        i.name,
        i.part_number,
        s.quantity,
        s.stock_id,
        s.min_inventory_level
      FROM inventory i
      LEFT JOIN inventory_stock s ON i.id = s.item_id
      WHERE 
        s.isdeleted = FALSE
        AND s.quantity <= s.min_inventory_level
        AND s.quantity > 0
      ORDER BY s.quantity ASC 
      LIMIT 5;
    `);
    res.status(200).json({ lowInventory: result.rows });
  } catch (error) {
    console.error("Error fetching low inventory:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const outOfStock = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id AS item_id,
        i.name,
        i.part_number,
        s.quantity,
        s.stock_id
      FROM inventory i
      LEFT JOIN inventory_stock s ON i.id = s.item_id
      WHERE 
        s.isdeleted = FALSE
        AND s.quantity <= 0
      ORDER BY i.name ASC;
    `);
    res.status(200).json({ outOfStock: result.rows });
  } catch (error) {
    console.error("Error fetching out of stock items:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
