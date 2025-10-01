import pool from "../lib/db/db.js";
export async function getVendors(req, res) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(`
            SELECT 
                vendor_id,
                name,
                contact_persons,
                phone,
                email,
                address,
                supply_rating,
                item_ids,
                is_active
            FROM vendors
            WHERE isdeleted = FALSE
            ORDER BY name ASC
        `);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "No vendors found" });
    }

    await client.query("COMMIT");
    res.status(200).json({
      message: "Vendors retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching vendors:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getVendorsByCategory(req, res) {
  const { category_id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        SELECT 
            vendor_id,
            name,
            contact_persons,
            phone,
            email,
            address,
            supply_rating,
            item_ids,
             is_active
        FROM vendors
        WHERE isdeleted = FALSE
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements(item_categories) AS elem
                WHERE (elem->>'category_id')::int = $1
            )
        ORDER BY name ASC;
        `,
      [category_id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(200)
        .json({ message: "No vendors found for this category", data: [] });
    }

    await client.query("COMMIT");
    res.status(200).json({
      message: "Vendors retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching vendors by category:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getVendorById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      WITH
      -- Unnest the vendor's item_ids
      vendor_items AS (
        SELECT unnest(v.item_ids) AS item_id
        FROM vendors v
        WHERE v.vendor_id = $1
      ),
      -- Aggregate stock quantities & min levels per item
      stock_agg AS (
        SELECT
          item_id,
          SUM(quantity)            AS total_quantity,
          SUM(min_inventory_level) AS total_min_stock
        FROM inventory_stock
        WHERE NOT isdeleted
        GROUP BY item_id
      ),
      -- Build a JSON array of item details
      item_details AS (
        SELECT json_agg(
          json_build_object(
            'item_id',          i.id,
            'name',             i.name,
            'part_number',      i.part_number,
            'quantity',         COALESCE(sa.total_quantity, 0),
            'last_price',       i.price[array_length(i.price, 1)],
            'min_stock_level',  COALESCE(sa.total_min_stock, 0)
          )
          ORDER BY i.name
        ) AS items
        FROM vendor_items vi
        JOIN inventory i
          ON i.id = vi.item_id
          AND NOT i.isdeleted
        LEFT JOIN stock_agg sa
          ON sa.item_id = i.id
      )
        SELECT
          -- All your vendor columns
          v.vendor_id,
          v.name,
          v.email,
          v.phone,
          v.address,
          v.item_categories,
          v.compliance_docs,
          v.currency_accepted,
          v.payment_terms,
          v.contact_persons,
          v.item_ids,
          v.is_active,
          v.blacklisted,
          v.reason_for_blacklist,
          v.supply_rating,
          v.created_at,
          v.updated_at,
          -- Our JSON array of enriched inventory items
          COALESCE(idt.items, '[]'::json) AS items
    FROM vendors v
    LEFT JOIN item_details idt ON true
    WHERE v.vendor_id = $1;

      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Vendor retrieved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching vendor by ID:", error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getVendorByItems(req, res) {
  const { itemId } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `
      SELECT 
        vendor_id,
        name,
        contact_persons,
        phone,
        email,
        address,
        supply_rating,
        item_ids,
        is_active
      FROM vendors
      WHERE isdeleted = false AND $1 = ANY(item_ids)
       ORDER BY name ASC
      `,
      [itemId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(200).json({ message: "No vendors found", data: [] });
    }

    await client.query("COMMIT");
    res.status(200).json({
      message: "Vendors retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching vendors by Item:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

// Code to add vendor to supply a particular item
export async function addItemsToVendor(req, res) {
  const { item_id, vendor_id } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT item_ids 
     FROM vendors 
     WHERE vendor_id = $1`,
      [vendor_id]
    );

    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Vendor not found" });
    }

    const existingIds = checkRes.rows[0].item_ids;
    if (existingIds.includes(item_id)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Item is already assigned to this vendor" });
    }

    const result = await client.query(
      `
      UPDATE vendors
      SET item_ids = array_append(item_ids, $1)
      WHERE vendor_id = $2
      RETURNING *
    `,
      [item_id, vendor_id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Couldn't add item to vendor" });
    }

    await client.query("COMMIT");
    return res
      .status(200)
      .json({ message: "Item added successfully", data: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding item to vendor:", error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getAllVendorSuppliedItems(req, res) {
  const { vendor_id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT i.id AS item_id,
       i.name,
       i.part_number
    FROM vendors v
    JOIN inventory i 
    ON i.id = ANY (v.item_ids)
    WHERE v.vendor_id = $1;`,
      [vendor_id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(200)
        .json({ message: "No vendors found for this category", data: [] });
    }

    await client.query("COMMIT");
    res.status(200).json({
      message: "Vendors retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching items supplied by vendor:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}
