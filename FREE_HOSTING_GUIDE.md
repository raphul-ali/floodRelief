# 100% Free Deployment & Database Guide for Flood Relief Portal

This guide explains how to deploy the **Flood Relief Portal** with zero monthly fees using industry-standard free tiers:

- **Free Hosting & Domain**: Vercel or Netlify (Global CDN, SSL certificate, `.vercel.app` or `.netlify.app` domain)
- **Free Database & Realtime**: Supabase (Free Tier: 500MB PostgreSQL, 1GB Storage for photos, Auth, Realtime WS)

---

## 🚀 Step 1: Push Code to GitHub

1. Open your terminal in the project directory:
   ```bash
   cd "/Users/garnek_matrix_sol/flood releif"
   ```

2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Flood Relief Portal"
   ```

3. Create a new repository on [GitHub](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/flood-relief-portal.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Step 2: Deploy Free Hosting on Vercel

1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **"Add New..." -> "Project"**.
3. Import the `flood-relief-portal` repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **Deploy**.

Within 30 seconds, your site is live with a free custom SSL domain:
`https://your-flood-portal.vercel.app`

---

## 🗄️ Step 3: Setup Free Supabase Database & Media Storage

If you want to sync data across all users and store photo uploads in the cloud rather than local browser storage:

1. Create a free account at [Supabase](https://supabase.com).
2. Click **"New Project"**.
3. In the SQL Editor tab, paste and execute the table schema below:

```sql
-- Victim Requests Table
CREATE TABLE victim_requests (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  people_count INT DEFAULT 1,
  adults_count INT DEFAULT 1,
  children_count INT DEFAULT 0,
  district TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_urgent_rescue BOOLEAN DEFAULT true,
  needs TEXT[] DEFAULT '{}',
  details TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'Pending',
  assigned_ngo TEXT
);

-- NGO Directory Table
CREATE TABLE ngos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  operating_zones TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  address TEXT,
  verified BOOLEAN DEFAULT true,
  active_teams INT DEFAULT 1
);

-- Enable Public Access for Relief Operations
ALTER TABLE victim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write" ON victim_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write" ON ngos FOR ALL USING (true) WITH CHECK (true);
```

4. Go to **Project Settings -> API** in Supabase to copy your `Project URL` and `anon public key`.
5. Add these environment variables in your Vercel project dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 📱 Mobile Optimizations Included
- Native HTML5 Geolocation triggering for quick GPS acquisition.
- Direct camera capture support (`capture="environment"`) for photo uploads.
- Touch-friendly large SOS buttons for high-stress emergency conditions.
- Single-click phone dial (`tel:`) and WhatsApp messaging integration.
- Offline-resilient fallback using browser LocalStorage.
