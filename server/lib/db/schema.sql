-- Users Table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
  END IF;
END
$$;
-- Creates the Enum type for user roles
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(150),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vessels Table
CREATE TABLE IF NOT EXISTS vessels (
  vessel_id SERIAL PRIMARY KEY,
  vessel_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(50),
  imo VARCHAR(20),
  last_port VARCHAR(100),
  etd DATE,
  eta DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id        SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(100),
  phone            VARCHAR(20),
  address          TEXT,

  /* 1️⃣  Item‑to‑Category map (JSONB) 
        Example:
        [
          { "item_id": 7, "category_id": 6 },
          { "item_id": 9, "category_id": 2 }
        ]
  */
  item_categories  JSONB DEFAULT '[]',

  /* Compliance documents (see previous explanation) */
  compliance_docs  JSONB DEFAULT '[]',

  /* Financial & business details */
  currency_accepted TEXT[]  DEFAULT '{}',     -- e.g. {'NGN','USD'}
  payment_terms     TEXT    DEFAULT 'Net 30', -- free‑text terms

  /* Contacts */
  contact_persons   JSONB DEFAULT '[]',

  /* Items supplied (plain list of item_ids for quick look‑ups) */
  item_ids          INTEGER[] DEFAULT '{}',

  /* Status flags */
  is_active   BOOLEAN  DEFAULT TRUE,
  blacklisted BOOLEAN  DEFAULT FALSE,
  reason_for_blacklist TEXT,

  /* 2️⃣  Supply rating (1‑5) */
  supply_rating SMALLINT CHECK (supply_rating BETWEEN 1 AND 5),
  purchase_order_number VARCHAR(50) UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Item Categories
CREATE TABLE IF NOT EXISTS item_categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INT,
  description TEXT,
  FOREIGN KEY (parent_id) REFERENCES item_categories(category_id)
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
  location_id SERIAL PRIMARY KEY,
  location_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shelf Location
CREATE TABLE IF NOT EXISTS shelf_locations (
  shelf_id SERIAL PRIMARY KEY,
  location_id INT NOT NULL, -- Reference to the main storage location
  shelf_code VARCHAR(50) NOT NULL, -- e.g., "A1", "B2", etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (location_id, shelf_code),
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  part_number VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  currency VARCHAR(3) DEFAULT 'USD',
  price NUMERIC[] NOT NULL DEFAULT '{}',
  category_id INT,
  barcode VARCHAR(100) UNIQUE,
  isdeleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES item_categories(category_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Inventory Stock per Location
CREATE TABLE IF NOT EXISTS inventory_stock (
  stock_id SERIAL PRIMARY KEY,
  item_id INT NOT NULL,
  location_id INT NOT NULL,
  shelf_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  isdeleted BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  min_inventory_level INT,
  UNIQUE (item_id, location_id), 
  -- This ensures that each item can only have one stock record per location
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (shelf_id) REFERENCES shelf_locations(shelf_id),
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

-- Inventory Receipts
CREATE TABLE IF NOT EXISTS inventory_receipts (
  receipt_id SERIAL PRIMARY KEY,
  stock_id INT NOT NULL,
  item_id INT NOT NULL,
  vendor_id INT NOT NULL,
  location_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  -- hold BOOLEAN DEFAULT FALSE,
  received_by INT NOT NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isdeleted BOOLEAN DEFAULT FALSE,
  -- Foreign Keys
  FOREIGN KEY (stock_id) REFERENCES inventory_stock(stock_id),
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  FOREIGN KEY (location_id) REFERENCES locations(location_id),
  FOREIGN KEY (received_by) REFERENCES users(user_id)
);

-- Inventory records
CREATE TABLE IF NOT EXISTS inventory_records (
  id SERIAL PRIMARY KEY,
  stock_id INT NOT NULL,
  task TEXT,
  updated_by INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_id) REFERENCES inventory_stock(stock_id),
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Inventory Change logs
CREATE TABLE IF NOT EXISTS inventory_change_log (
  log_id SERIAL PRIMARY KEY,
  item_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INT NOT NULL, -- optional: username or user ID
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
);

-- Inventory Delete Logs
CREATE TABLE IF NOT EXISTS inventory_delete_log (
  log_id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  item_id INT NOT NULL,
  stock_id INT NOT NULL,
  deleted_by INT NOT NULL, -- optional: username or user ID
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (deleted_by) REFERENCES users(user_id),
  FOREIGN KEY (stock_id) REFERENCES inventory_stock(stock_id)
);

-- Dispatch Records
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'destination_enum') THEN
    CREATE TYPE destination_enum AS ENUM ('vessel', 'department');
  END IF;
END
$$;
-- Creates the Enum type for dispatch destinations
CREATE TABLE IF NOT EXISTS dispatch_records (
  dispatch_id SERIAL PRIMARY KEY,
  destination_type destination_enum NOT NULL,
  destination_id INT NOT NULL, -- either to the vessel_id or department_id
  user_id INT NOT NULL,
  dispatch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'dispatched', -- e.g., 'dispatched', 'cancelled', 'completed'
  isdeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Dispatched Items (what was sent per dispatch)
CREATE TABLE IF NOT EXISTS dispatched_items (
  id SERIAL PRIMARY KEY,
  dispatch_id INT NOT NULL,
  item_id INT NOT NULL,
  stock_id INT NOT NULL,
  quantity INT NOT NULL,
  isdeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (dispatch_id) REFERENCES dispatch_records(dispatch_id),
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (stock_id) REFERENCES inventory_stock(stock_id)
);



CREATE TABLE IF NOT EXISTS dispatch_change_log (
  log_id SERIAL PRIMARY KEY,
  dispatch_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  changed_by INT NOT NULL, -- optional: username or user ID
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dispatch_id) REFERENCES dispatch_records(dispatch_id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
);

-- -- Recycle Bin Table
-- CREATE TABLE IF NOT EXISTS recycle_bin (
--   recycle_id SERIAL PRIMARY KEY,
--   table_name TEXT NOT NULL, -- e.g. 'inventory', 'inventory_stock', etc.
--   record_id INT NOT NULL, -- the PK of the deleted row in its original table
--   deleted_by INT, 
--   deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   old_data JSONB NOT NULL,        -- the entire deleted row as JSON
--   FOREIGN KEY (deleted_by) REFERENCES users(user_id)
-- );

-- Purchase Records
CREATE TABLE IF NOT EXISTS purchase_orders (
  purchase_id SERIAL PRIMARY KEY,
  ref_number VARCHAR(100) UNIQUE NOT NULL,
  vendor_id INT NOT NULL REFERENCES vendors(vendor_id),
  expected_arrival_date DATE,
  po_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft', -- e.g. draft, pending, received, canceled
  created_by INT NOT NULL REFERENCES users(user_id),
  isdeleted BOOLEAN DEFAULT FALSE,
  
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  service_charge NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  vat NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  total_items INT NOT NULL DEFAULT 0,
  total_received INT NOT NULL DEFAULT 0
);

-- Purchased Items 
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_id INT NOT NULL REFERENCES purchase_orders(purchase_id) ON DELETE CASCADE,
  item_id INT NOT NULL REFERENCES inventory(id),
  location_id INT REFERENCES locations(location_id),
  quantity_ordered INT NOT NULL,
  quantity_received JSONB DEFAULT '[]',--Quantity, User, Date
  unit_price NUMERIC(10, 2) NOT NULL,
  expected_arrival_date DATE,
  isdeleted BOOLEAN DEFAULT FALSE
);

-- Purchase Change Log
CREATE TABLE IF NOT EXISTS purchase_change_logs (
  log_id SERIAL PRIMARY KEY,
  purchase_id INT NOT NULL REFERENCES purchase_orders(purchase_id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INT NOT NULL REFERENCES users(user_id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


