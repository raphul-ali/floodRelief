-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS delivery_logs CASCADE;
DROP TABLE IF EXISTS victim_requests CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;

-- 1. Create Victim SOS Requests Table
CREATE TABLE victim_requests (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    alt_phone TEXT,
    people_count INT,
    males_count INT,
    females_count INT,
    children_count INT,
    district TEXT,
    village_name TEXT,
    pin_code TEXT,
    landmark TEXT,
    location_name TEXT,
    latitude FLOAT,
    longitude FLOAT,
    is_urgent_rescue BOOLEAN,
    needs JSONB,
    details TEXT,
    status TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    requested_by_role TEXT,
    requested_by_name TEXT,
    requested_by_phone TEXT
);

-- 2. Create NGOs Table
CREATE TABLE ngos (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    password TEXT,
    logo_url TEXT,
    operating_zones JSONB,
    services JSONB,
    address TEXT,
    verified BOOLEAN DEFAULT FALSE,
    active_teams INT DEFAULT 1,
    verified_at TIMESTAMPTZ,
    verified_by TEXT
);

-- 3. Create Volunteers Table
CREATE TABLE volunteers (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    role_type TEXT,
    phone TEXT,
    email TEXT,
    password TEXT,
    district TEXT,
    offerings JSONB,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by TEXT
);

-- 4. Create Delivery Logs Table
CREATE TABLE delivery_logs (
    log_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    request_id TEXT REFERENCES victim_requests(id) ON DELETE CASCADE,
    recipient_name TEXT,
    district TEXT,
    delivered_by TEXT,
    volunteer_phone TEXT,
    items_delivered TEXT,
    people_impacted INT,
    delivery_notes TEXT,
    status_update TEXT,
    verified BOOLEAN DEFAULT FALSE
);

-- Ensure RLS is enabled so we can apply secure open policies
ALTER TABLE victim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- Safely allow the frontend (anon key) to freely insert, read, update, and delete
CREATE POLICY "Allow public all on victim_requests" ON victim_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on ngos" ON ngos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on volunteers" ON volunteers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on delivery_logs" ON delivery_logs FOR ALL TO anon USING (true) WITH CHECK (true);
