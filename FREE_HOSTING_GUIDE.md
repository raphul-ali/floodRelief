# 100% Free Deployment & Database Guide for Flood Relief Portal

This guide explains how to deploy the **Flood Relief Portal** with zero monthly fees using industry-standard free tiers:

- **Free Hosting & Domain**: Vercel or Netlify (Global CDN, SSL certificate, `.vercel.app` domain)
- **Free Live Cloud Database**: Supabase (Free Tier: 500MB PostgreSQL, Auth, Realtime)

---

## 🚀 Step 1: Code is Pushed to GitHub

Your code is already pushed to GitHub repository:
`https://github.com/raphul-ali/floodRelief.git`

---

## 🌐 Step 2: Deploy Free Hosting on Vercel

1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **"Add New..." -> "Project"**.
3. Import the `floodRelief` repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **Deploy**.

Within 30 seconds, your site is live with a free custom SSL domain:
`https://flood-relief.vercel.app`

---

## 🗄️ Step 3: Connect Free Supabase Cloud Database

To sync data across all users and devices in real-time:

1. Create a free account at [Supabase](https://supabase.com).
2. Click **"New Project"** and name it `flood-relief`.
3. In the Supabase Dashboard, go to **SQL Editor -> New Query**.
4. Paste and run the complete SQL script below:

```sql
-- 1. Victim SOS Requests Table
CREATE TABLE IF NOT EXISTS victim_requests (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  people_count INT DEFAULT 1,
  males_count INT DEFAULT 1,
  females_count INT DEFAULT 1,
  children_count INT DEFAULT 0,
  district TEXT,
  village_name TEXT,
  pin_code TEXT,
  landmark TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_urgent_rescue BOOLEAN DEFAULT true,
  needs TEXT[] DEFAULT '{}',
  details TEXT,
  status TEXT DEFAULT 'Pending Verification',
  assigned_ngo TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT
);

-- 2. Relief Delivery Audit Logs Table
CREATE TABLE IF NOT EXISTS delivery_logs (
  log_id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES victim_requests(id) ON DELETE CASCADE,
  recipient_name TEXT,
  district TEXT,
  delivered_by TEXT NOT NULL,
  volunteer_phone TEXT NOT NULL,
  items_delivered TEXT NOT NULL,
  delivery_notes TEXT,
  status_update TEXT DEFAULT 'In Progress',
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. NGOs Table
CREATE TABLE IF NOT EXISTS ngos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT UNIQUE,
  password TEXT,
  operating_zones TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  address TEXT,
  verified BOOLEAN DEFAULT false,
  active_teams INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  district TEXT,
  social_link TEXT,
  followers_count TEXT,
  offerings TEXT,
  available_status TEXT DEFAULT 'Active Now',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE victim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on victim_requests" ON victim_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on delivery_logs" ON delivery_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on ngos" ON ngos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on volunteers" ON volunteers FOR ALL USING (true) WITH CHECK (true);
```

5. Go to **Project Settings -> API** in Supabase to copy your `Project URL` and `anon public key`.
6. Set these environment variables in your Vercel Dashboard (**Settings -> Environment Variables**):
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJKV1Qi...`

---

## ⚡ Fallback Architecture Included
- **Hybrid Cloud + LocalStorage**: If Supabase environment variables are set, the app connects directly to PostgreSQL. If offline or not configured, it seamlessly uses browser LocalStorage with zero setup required!
