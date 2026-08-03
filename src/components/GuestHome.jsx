import React from 'react';
import { Activity, ShieldCheck, Megaphone, Anchor, Car } from 'lucide-react';
export default function GuestHome({ 
  victimRequests, 
  ngos, 
  volunteers, 
  setActiveTab 
}) {

  const requestsCount = victimRequests.length;
  const ngoVolCount = ngos.length + volunteers.length;
  
  // Volunteers can register offering these services, so we parse their offerings field
  const boatCount = volunteers.filter(v => v.offerings && v.offerings.toLowerCase().includes('boat')).length;
  const carCount = volunteers.filter(v => v.offerings && v.offerings.toLowerCase().includes('car')).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8 px-4">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assam Flood Relief Network</h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Fast and direct access to essential services and resources. Select an option below to find or provide help.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Requests */}
        <button 
          onClick={() => setActiveTab('public_requests')}
          className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-3xl p-6 flex items-center justify-between transition-all active:scale-95 group shadow-sm text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Relief Requests</h3>
              <p className="text-xs font-semibold text-slate-500">Live rescue & relief</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-red-600 font-black text-lg">
            {requestsCount}
          </div>
        </button>

        {/* NGOs / Volunteers */}
        <button 
          onClick={() => setActiveTab('ngos')}
          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-3xl p-6 flex items-center justify-between transition-all active:scale-95 group shadow-sm text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Ngos and helpers</h3>
              <p className="text-xs font-semibold text-slate-500">Verified helpers</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-emerald-600 font-black text-lg">
            {ngoVolCount}
          </div>
        </button>

        {/* Campaigns */}
        <button 
          onClick={() => setActiveTab('campaigns')}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-3xl p-6 flex items-center justify-between transition-all active:scale-95 group shadow-sm text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Campaigns</h3>
              <p className="text-xs font-semibold text-slate-500">Relief & Support</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-blue-600 font-black text-lg">
            &rarr;
          </div>
        </button>

        {/* Transport (Boat/Car) */}
        <button 
          onClick={() => setActiveTab('transport')}
          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-3xl p-6 flex items-center justify-between transition-all active:scale-95 group shadow-sm text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-col gap-1">
              <div className="flex items-center justify-center w-full h-full pb-1">
                <Anchor className="w-5 h-5 absolute -translate-x-2 translate-y-1" />
                <Car className="w-5 h-5 absolute translate-x-3 -translate-y-1" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Transport Help</h3>
              <p className="text-xs font-semibold text-slate-500">Boats & Cars</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[2.5rem]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Boat</span>
              <span className="text-amber-600 font-black text-sm">{boatCount}</span>
            </div>
            <div className="bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[2.5rem]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Car</span>
              <span className="text-amber-600 font-black text-sm">{carCount}</span>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}
