-- ============================================================
--  RJ's Café — Supabase (PostgreSQL) Schema · FULL EDITION
--  Includes guest + admin/staff features
--  Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT DEFAULT 0,
  is_available SMALLINT DEFAULT 1,
  is_featured SMALLINT DEFAULT 0,
  image VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF / ADMIN ACCOUNTS ──────────────────────────────────
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  auth_id UUID UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'staff',
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_type VARCHAR(20) DEFAULT 'pickup',
  delivery_address TEXT,
  payment_method VARCHAR(20) DEFAULT 'cash',
  special_requests TEXT,
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  reference_code VARCHAR(20) NOT NULL UNIQUE,
  guest_name VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  num_guests INT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_settings (
  id SERIAL PRIMARY KEY,
  day_of_week VARCHAR(20) NOT NULL UNIQUE,
  is_open SMALLINT DEFAULT 1,
  open_time TIME DEFAULT '08:00:00',
  close_time TIME DEFAULT '20:00:00'
);

CREATE TABLE inventory_log (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150),
  change_qty INT NOT NULL,
  reason VARCHAR(255),
  staff_name VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(150),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log    ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ (guests browse)
CREATE POLICY "public read categories"    ON categories    FOR SELECT USING (true);
CREATE POLICY "public read products"      ON products      FOR SELECT USING (true);
CREATE POLICY "public read orders"        ON orders        FOR SELECT USING (true);
CREATE POLICY "public read order_items"   ON order_items   FOR SELECT USING (true);
CREATE POLICY "public read reservations"  ON reservations  FOR SELECT USING (true);
CREATE POLICY "public read shop_settings" ON shop_settings FOR SELECT USING (true);

-- PUBLIC INSERT (guests place orders / make reservations)
CREATE POLICY "public insert orders"       ON orders       FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert order_items"  ON order_items  FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert reservations" ON reservations FOR INSERT WITH CHECK (true);

-- PUBLIC UPDATE on reservations (cancel by code)
CREATE POLICY "public update reservations" ON reservations FOR UPDATE USING (true);

-- AUTHENTICATED (logged-in staff/admin) full access
CREATE POLICY "auth full categories"      ON categories      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full products"        ON products        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full orders"          ON orders          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full order_items"     ON order_items     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full reservations"    ON reservations    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full shop_settings"   ON shop_settings   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full staff"           ON staff           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full inventory_log"   ON inventory_log   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth full activity_log"    ON activity_log    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
--  STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "auth upload product-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "auth update product-images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "auth delete product-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- ============================================================
--  SEED DATA
-- ============================================================

INSERT INTO categories (name, sort_order) VALUES
('Hot Coffees', 1),
('Iced Coffees', 2),
('Specialty Coffees', 3),
('Pastries', 4),
('Non-Coffee', 5);

INSERT INTO products (category_id, name, description, price, stock, is_available, is_featured) VALUES
(1, 'Americano', 'Bold espresso with hot water for a smooth, rich cup.', 95.00, 50, 1, 1),
(1, 'Cappuccino', 'Espresso topped with steamed milk and thick foam.', 110.00, 50, 1, 1),
(1, 'Latte', 'Smooth espresso with silky steamed milk.', 115.00, 50, 1, 0),
(1, 'Flat White', 'Velvety microfoam over a double ristretto shot.', 120.00, 40, 1, 0),
(2, 'Iced Americano', 'Chilled espresso over ice — clean and refreshing.', 105.00, 50, 1, 1),
(2, 'Iced Latte', 'Espresso and cold milk over ice.', 125.00, 50, 1, 1),
(2, 'Cold Brew', '12-hour steeped cold brew, smooth and bold.', 135.00, 30, 1, 1),
(2, 'Iced Caramel Macchiato', 'Layered espresso with caramel and cold milk.', 140.00, 40, 1, 0),
(3, 'Spanish Latte', 'Espresso with condensed milk and fresh milk.', 145.00, 40, 1, 1),
(3, 'Dalgona Coffee', 'Whipped coffee cream over your choice of milk.', 140.00, 30, 1, 0),
(3, 'Salted Caramel Latte', 'Sweet caramel with a hint of sea salt.', 150.00, 30, 1, 0),
(4, 'Croissant', 'Buttery, flaky classic French croissant.', 75.00, 20, 1, 0),
(4, 'Blueberry Muffin', 'Moist muffin bursting with fresh blueberries.', 85.00, 15, 1, 0),
(4, 'Chocolate Chip Cookie', 'Warm, gooey cookie loaded with chocolate chips.', 65.00, 25, 1, 0),
(5, 'Matcha Latte', 'Premium matcha with steamed milk.', 135.00, 35, 1, 1),
(5, 'Chocolate Milk', 'Rich, creamy chocolate milk.', 90.00, 30, 1, 0),
(5, 'Strawberry Smoothie', 'Fresh strawberries blended to perfection.', 120.00, 20, 1, 0);

INSERT INTO shop_settings (day_of_week, is_open, open_time, close_time) VALUES
('monday',    1, '07:00:00', '21:00:00'),
('tuesday',   1, '07:00:00', '21:00:00'),
('wednesday', 1, '07:00:00', '21:00:00'),
('thursday',  1, '07:00:00', '21:00:00'),
('friday',    1, '07:00:00', '22:00:00'),
('saturday',  1, '08:00:00', '22:00:00'),
('sunday',    1, '08:00:00', '20:00:00');

INSERT INTO staff (full_name, email, phone, role) VALUES
('RJ Admin',     'rj@rjscafe.ph',    '09171234567', 'admin'),
('Maria Santos', 'maria@rjscafe.ph', '09181234567', 'staff');
