import React from 'react';
import { LifeBuoy, HeartHandshake, Megaphone, Anchor, Car, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function GuestHome({ 
  victimRequests, 
  ngos, 
  volunteers, 
  setActiveTab 
}) {

  const requestsCount = victimRequests.length;
  const ngoVolCount = ngos.length + volunteers.length;
  const boatCount = volunteers.filter(v => v.offerings && v.offerings.toLowerCase().includes('boat')).length;
  const carCount = volunteers.filter(v => v.offerings && v.offerings.toLowerCase().includes('car')).length;

  return (
    <div className="w-full pb-4 animate-in fade-in duration-300">
      
      {/* Compact Header */}
      <div className="pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assam Flood Relief Portal
          </h1>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live</span>
          </div>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-tight">
          Request immediate rescue operations or discover verified relief resources across all districts.
        </p>
      </div>

      {/* Uniform Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Button 1: Relief Requests */}
        <button 
          onClick={() => setActiveTab('public_requests')}
          className="group bg-white border border-slate-200 hover:border-red-300 rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded border border-red-100">
               <Activity className="w-3 h-3 text-red-500 animate-pulse" />
               <span className="text-red-700 font-bold text-xs">{requestsCount}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Emergency Requests</h3>
            <p className="text-xs text-slate-500 line-clamp-2">View live SOS requests and coordinate rescues.</p>
          </div>
        </button>

        {/* Button 2: NGOs & Helpers */}
        <button 
          onClick={() => setActiveTab('ngos')}
          className="group bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
               <ShieldCheck className="w-3 h-3 text-emerald-500" />
               <span className="text-emerald-700 font-bold text-xs">{ngoVolCount}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Verified Helpers</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Connect with NGOs and registered volunteers.</p>
          </div>
        </button>

        {/* Button 3: Transport */}
        <button 
          onClick={() => setActiveTab('transport')}
          className="group bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center relative shrink-0">
               <Anchor className="w-4 h-4 absolute -translate-x-1.5 translate-y-1" />
               <Car className="w-4 h-4 absolute translate-x-2 -translate-y-1" />
            </div>
            <div className="flex items-center gap-1.5">
               <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">{boatCount} Boats</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Transport & Logistics</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Find boats and vehicles for supply runs.</p>
          </div>
        </button>

        {/* Button 4: Campaigns */}
        <button 
          onClick={() => setActiveTab('campaigns')}
          className="group bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">Relief Campaigns</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Contribute to organized relief drives.</p>
          </div>
        </button>

      </div>
    </div>
  );
}
