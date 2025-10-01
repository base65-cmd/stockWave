import pool from "../lib/db/db.js";

export async function getPurchaseRecords(req, res) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(`
        SELECT 
            po.purchase_id,
            po.ref_number,
            po.expected_arrival_date,
            po.po_date,
            po.created_at,
            po.updated_at,
            po.status,
            po.isdeleted,
            po.subtotal,
            po.service_charge,
            po.discount,
            po.vat,
            po.grand_total,
            po.currency,
            po.total_items,
            po.total_received,
            po.purchase_order_number,
            v.name AS vendor_name,
            u.full_name AS created_by_username
        FROM purchase_orders po
        LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
        LEFT JOIN users u ON po.created_by = u.user_id
        WHERE po.isdeleted = FALSE
        ORDER BY po.purchase_id DESC
    `);

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No purchase Record" });
    }

    await client.query("COMMIT");
    res
      .status(200)
      .json({ message: "Purchase Record Found", data: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching purchase order:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getPurchaseRecordById(req, res) {
  try {
  } catch (error) {}
}

export async function getPurchaseRecordByVendor(req, res) {
  const { vendorId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT 
        purchase_id,
        ref_number,
        vendor_id, 
        po_date,
        status,
        grand_total,
        currency,
        purchase_order_number
      FROM purchase_orders
      WHERE isdeleted = false AND vendor_id = $1
      `,
      [vendorId]
    );

    if (result.rows.length == 0) {
      return res.status(200).json({ message: "No purchase Record" });
    }

    await client.query("COMMIT");
    res
      .status(200)
      .json({ message: "Purchase Record Found", data: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching purchase order by Vendor:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function addPurchaseRecord(req, res) {
  const {
    vendor,
    refNumber,
    arrivalDate,
    notes,
    date,
    currency,
    total,
    VAT,
    discount,
    serviceCharge,
    grandTotal,
    items,
    state,
    user_id,
  } = req.body;
  const purchaseItems = JSON.parse(items);
  const client = await pool.connect();
  const totalItems = purchaseItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  try {
    await client.query("BEGIN");

    const vendor_result = await client.query(
      `SELECT vendor_id FROM vendors WHERE name = $1`,
      [vendor]
    );

    if (vendor_result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vendor not Found" });
    }

    const vendor_id = vendor_result.rows[0]?.vendor_id;

    const ETA = arrivalDate === "" ? null : arrivalDate;
    const currentState = state === "draft" ? "Draft" : "Created";
    const lastPoNumber =
      await client.query(`SELECT MAX(CAST(SPLIT_PART(purchase_order_number, '/', 3) AS INTEGER)) AS last_number
        FROM purchase_orders
        WHERE purchase_order_number IS NOT NULL;
        `);
    // Update PO Number for only Created Items
    console.log(lastPoNumber);

    const newPoNumber =
      state === "draft"
        ? null
        : `SSL/PO/${lastPoNumber.rows[0].last_number + 1}`;
    // Insert into Purchase Orders Table
    const result = await client.query(
      `
        INSERT INTO purchase_orders (ref_number, vendor_id, expected_arrival_date, po_date,
        status, created_by, subtotal, discount, vat, grand_total, currency, total_items, service_charge, purchase_order_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING purchase_id
        `,
      [
        refNumber,
        vendor_id,
        ETA,
        date,
        currentState,
        user_id,
        total,
        discount,
        VAT,
        grandTotal,
        currency,
        totalItems,
        serviceCharge,
        newPoNumber,
      ]
    );

    const purchase_id = result.rows[0]?.purchase_id;

    // Insert into Purchased Items Table
    for (const item of purchaseItems) {
      const expected_arrival_date =
        arrivalDate === "" ? item.arrivalDate : arrivalDate;

      await client.query(
        `
            INSERT INTO purchase_order_items (purchase_id, item_id, quantity_ordered, unit_price, expected_arrival_date)
            VALUES ($1, $2, $3, $4, $5)
            `,
        [
          purchase_id,
          item.item_id,
          item.quantity,
          item.unitPrice,
          expected_arrival_date,
        ]
      );

      // TODO: This should be updated when status has been update to send to vendor
      // Note: Implement sending the mail from the App
      // await client.query(
      //   `UPDATE inventory
      //     SET price = array_append(price, $2)
      //     WHERE id = $1`,
      //   [item.item_id, item.unitPrice]
      // );
    }

    const message =
      state === "draft"
        ? "Saved as Draft"
        : "Purchase Order Created successfully";

    await client.query("COMMIT");
    res.status(201).json({ message: message });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error adding purchase order:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function getPurchaseOrderWithItems(req, res) {
  const client = await pool.connect();
  const { purchase_id } = req.params;

  try {
    await client.query("BEGIN");

    // Fetch purchase order (parent)
    const orderResult = await client.query(
      `
      SELECT 
          po.purchase_id,
          po.ref_number,
          po.expected_arrival_date,
          po.po_date,
          po.created_at,
          po.updated_at,
          po.status,
          po.isdeleted,
          po.subtotal,
          po.service_charge,
          po.discount,
          po.vat,
          po.grand_total,
          po.currency,
          po.total_items,
          po.total_received,
          v.name AS vendor_name,
          u.full_name AS created_by_username
      FROM purchase_orders po
      LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
      LEFT JOIN users u ON po.created_by = u.user_id
      WHERE po.purchase_id = $1
        AND po.isdeleted = FALSE
      LIMIT 1
    `,
      [purchase_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    // Fetch purchase order items (children)
    const itemsResult = await client.query(
      `
      SELECT 
          poi.id,
          poi.item_id,
          i.name AS item_name,
          i.part_number,
          poi.location_id,
          l.location_name AS location_name,
          poi.quantity_ordered,
          poi.quantity_received,
          poi.unit_price,
          poi.expected_arrival_date,
          poi.isdeleted
      FROM purchase_order_items poi
      LEFT JOIN inventory i ON poi.item_id = i.id
      LEFT JOIN locations l ON poi.location_id = l.location_id
      WHERE poi.purchase_id = $1
        AND poi.isdeleted = FALSE
      ORDER BY poi.id ASC
    `,
      [purchase_id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Purchase Order Found",
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching purchase order with items:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function deletePurchaseRecord(req, res) {
  try {
  } catch (error) {}
}

export async function updatePurchaseRecord(req, res) {
  try {
  } catch (error) {}
}

export async function updatePurchasedItems(req, res) {
  try {
  } catch (error) {}
}
