import React from 'react';
import { LifeBuoy, HeartHandshake, Megaphone, Anchor, Car } from 'lucide-react';
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
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Relief Requests</h3>
              <p className="text-xs font-medium text-slate-500">Live rescue & relief</p>
            </div>
          </div>
          <div className="bg-red-50 px-3 py-1.5 rounded-lg text-red-700 font-bold text-sm">
            {requestsCount}
          </div>
        </button>

        {/* NGOs / Volunteers */}
        <button 
          onClick={() => setActiveTab('ngos')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ngos and helpers</h3>
              <p className="text-xs font-medium text-slate-500">Verified helpers</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-700 font-bold text-sm">
            {ngoVolCount}
          </div>
        </button>

        {/* Campaigns */}
        <button 
          onClick={() => setActiveTab('campaigns')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campaigns</h3>
              <p className="text-xs font-medium text-slate-500">Relief & Support</p>
            </div>
          </div>
          <div className="text-slate-300 group-hover:text-blue-600 font-bold transition-colors">
            &rarr;
          </div>
        </button>

        {/* Transport (Boat/Car) */}
        <button 
          onClick={() => setActiveTab('transport')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors flex-col gap-1">
              <div className="flex items-center justify-center w-full h-full pb-1">
                <Anchor className="w-4 h-4 absolute -translate-x-1.5 translate-y-1" />
                <Car className="w-4 h-4 absolute translate-x-2.5 -translate-y-1" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Transport Help</h3>
              <p className="text-xs font-medium text-slate-500">Boats & Cars</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-amber-50 px-2 py-1 rounded-lg flex flex-col items-center justify-center min-w-[2rem]">
              <span className="text-[9px] font-bold text-amber-700/60 uppercase tracking-wider">Boat</span>
              <span className="text-amber-700 font-bold text-xs">{boatCount}</span>
            </div>
            <div className="bg-amber-50 px-2 py-1 rounded-lg flex flex-col items-center justify-center min-w-[2rem]">
              <span className="text-[9px] font-bold text-amber-700/60 uppercase tracking-wider">Car</span>
              <span className="text-amber-700 font-bold text-xs">{carCount}</span>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}
