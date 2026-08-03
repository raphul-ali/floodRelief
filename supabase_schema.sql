-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS delivery_logs CASCADE;
DROP TABLE IF EXISTS victim_requests CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

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
    requested_by_phone TEXT,
    assigned_ngo TEXT,
    ground_condition TEXT DEFAULT 'SUBMERGED',
    urgency TEXT DEFAULT 'HIGH'
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
    social_link TEXT,
    offerings JSONB,
    available_status TEXT DEFAULT 'Active Now',
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
    verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    rescued_count INT,
    remaining_count INT
);

-- 5. Create Helpline Numbers Table
CREATE TABLE helpline_numbers (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Campaigns Table
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    date TEXT,
    status TEXT DEFAULT 'Active',
    image_url TEXT
);

-- Seed initial Helpline Numbers
INSERT INTO helpline_numbers (id, label, phone_number, sort_order, created_at)
VALUES 
    ('db17680f-3faa-43a9-8fd9-1581a6c19904', 'Sivasagar Control Room', '8471864355', 1, '2026-07-29T14:27:40.644789+00:00'),
    ('27d3de65-2b09-4b32-a14a-2d6d309617a8', 'Charaideo Control Room', '9085412180', 2, '2026-07-29T14:27:40.644789+00:00'),
    ('4cc0ca3a-7b75-4a2a-96f2-8cc657794a49', 'Jorhat Control Room', '0376-2300124', 3, '2026-07-29T14:27:40.644789+00:00'),
    ('89d88291-53e5-4454-89f2-7b2ed515b0d2', 'Toll free (all districts)', '1077', 4, '2026-07-29T14:27:40.644789+00:00')
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is enabled so we can apply secure open policies
ALTER TABLE victim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpline_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Safely allow the frontend (anon key) to freely insert, read, update, and delete
CREATE POLICY "Allow public all on victim_requests" ON victim_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on ngos" ON ngos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on volunteers" ON volunteers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on delivery_logs" ON delivery_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on helpline_numbers" ON helpline_numbers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on campaigns" ON campaigns FOR ALL TO anon USING (true) WITH CHECK (true);

