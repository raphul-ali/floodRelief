import React, { useState } from 'react';
import { Server, Database, Globe, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Code2, Copy, Check } from 'lucide-react';

const SQL_SCRIPT = `-- 1. Victim SOS Requests Table
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
CREATE POLICY "Allow public all on volunteers" ON volunteers FOR ALL USING (true) WITH CHECK (true);`;

export default function FreeHostingGuide() {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>ZERO HOSTING COST BLUEPRINT</span>
        </div>
        <h2 className="text-2xl font-black text-white">
          100% FREE HOSTING, FREE DATABASE & FREE DOMAIN SETUP GUIDE
        </h2>
        <p className="text-sm text-slate-300">
          This portal runs completely free forever using Vercel + Supabase PostgreSQL without entering a credit card.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Free Hosting */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">1. FREE HOSTING</h3>
          <div className="text-xs text-amber-400 font-bold">Vercel / Netlify</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Unlimited static & dynamic website deployments</li>
            <li>Automatic HTTPS/SSL Certificate included</li>
            <li>Continuous auto-deploy from GitHub</li>
            <li>Global Edge CDN for fast mobile loading</li>
          </ul>
        </div>

        {/* Pillar 2: Free Database */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">2. FREE CLOUD DATABASE</h3>
          <div className="text-xs text-amber-400 font-bold">Supabase (PostgreSQL)</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>500MB Free PostgreSQL Database</li>
            <li>1GB Free Media Storage</li>
            <li>Real-time WebSocket updates across devices</li>
            <li>RESTful auto-generated API endpoints</li>
          </ul>
        </div>

        {/* Pillar 3: Free Domain */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">3. FREE DOMAIN</h3>
          <div className="text-xs text-amber-400 font-bold">Custom Subdomain</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Free <code className="text-emerald-400">flood-relief.vercel.app</code></li>
            <li>Free SSL certificate auto-renewed</li>
            <li>Custom domain support (.org / .in)</li>
          </ul>
        </div>

      </div>

      {/* Step by Step Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <span>Step-by-Step Supabase Cloud Setup</span>
        </h3>

        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            1
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-white">Create Free Project on Supabase</h4>
            <p>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold">supabase.com</a>, log in, and click <strong>"New Project"</strong>.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            2
          </div>
          <div className="space-y-2 text-xs text-slate-300 w-full">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Run SQL Script in Supabase SQL Editor</h4>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'Copied SQL Script!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p>In your Supabase Dashboard, navigate to <strong>SQL Editor &rarr; New Query</strong>, paste the script below, and click <strong>Run</strong>:</p>
            
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800 overflow-x-auto max-h-60">
              <pre>{SQL_SCRIPT}</pre>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            3
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-white">Set Environment Variables in Vercel</h4>
            <p>1. Copy your <code className="text-amber-300">Project URL</code> and <code className="text-amber-300">anon public key</code> from Supabase <strong>Project Settings &rarr; API</strong>.</p>
            <p>2. In Vercel Project Dashboard (<strong>Settings &rarr; Environment Variables</strong>), add:</p>
            <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-amber-300 border border-slate-800 space-y-1">
              <div>VITE_SUPABASE_URL = https://xxxx.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOiJKV1Qi...</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
