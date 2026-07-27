import React from 'react';
import { Server, Database, Globe, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Code2 } from 'lucide-react';

export default function FreeHostingGuide() {
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
          This portal is engineered to run completely free forever using top-tier developer platforms without entering a credit card.
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
          <div className="text-xs text-amber-400 font-bold">Vercel / Netlify / Render</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Unlimited static & dynamic website deployments</li>
            <li>Automatic HTTPS/SSL Certificate included</li>
            <li>Continuous auto-deploy from GitHub</li>
            <li>Global Edge CDN for fast load on mobile</li>
          </ul>
        </div>

        {/* Pillar 2: Free Database */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">2. FREE DATABASE</h3>
          <div className="text-xs text-amber-400 font-bold">Supabase (PostgreSQL)</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>500MB Free PostgreSQL Database</li>
            <li>1GB Free Media Storage (Photo uploads)</li>
            <li>Real-time WebSocket updates across NGOs</li>
            <li>RESTful auto-generated API endpoints</li>
          </ul>
        </div>

        {/* Pillar 3: Free Domain */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">3. FREE DOMAIN</h3>
          <div className="text-xs text-amber-400 font-bold">Custom Subdomains</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li>Free <code className="text-emerald-400">your-flood-portal.vercel.app</code></li>
            <li>Free <code className="text-emerald-400">your-relief.netlify.app</code></li>
            <li>Free <code className="text-emerald-400">yourname.github.io</code></li>
            <li>Optional free TLDs from FreeDNS / Freenom</li>
          </ul>
        </div>

      </div>

      {/* Step by Step Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <span>Step-by-Step Deployment Instructions</span>
        </h3>

        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            1
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-white">Upload Code to GitHub (Free)</h4>
            <p>Create a free GitHub account, initialize a repository, and push this codebase:</p>
            <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-amber-300 border border-slate-800 space-y-1">
              <div>git init</div>
              <div>git add .</div>
              <div>git commit -m "Initial Flood Relief Portal"</div>
              <div>git remote add origin https://github.com/your-username/flood-relief-portal.git</div>
              <div>git push -u origin main</div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            2
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-white">Deploy to Vercel (Free Hosting & Domain)</h4>
            <p>1. Visit <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com</a> and sign in with GitHub.</p>
            <p>2. Click <strong>"Add New Project"</strong> → Select your <code className="text-amber-300">flood-relief-portal</code> repository.</p>
            <p>3. Click <strong>"Deploy"</strong>. In 30 seconds, your site will be live with full SSL on a custom free domain like <code className="text-amber-300">https://flood-relief.vercel.app</code>.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            3
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-white">Connect Free Supabase Backend (Optional Live Backend)</h4>
            <p>1. Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com</a> and create a free project.</p>
            <p>2. In Supabase Table Editor, run the SQL script included in <code className="text-amber-300">FREE_HOSTING_GUIDE.md</code> to create <code className="text-amber-300">victim_requests</code> and <code className="text-amber-300">ngos</code> tables.</p>
            <p>3. Set your <code className="text-amber-300">VITE_SUPABASE_URL</code> and <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code> in Vercel Environment Variables.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
