import React, { useState } from 'react';
import { 
  HeartHandshake, Phone, MessageSquare, Mail, MapPin, ShieldCheck, Plus, X, Users, CheckCircle, 
  Sparkles, Megaphone, Anchor, Stethoscope, Building2, ExternalLink, Car, Truck, Navigation
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS, VOLUNTEER_ROLES } from '../services/storageService';

export default function NGODirectory({ ngos = [], volunteers = [], openLoginModal }) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'NGOS' | 'VOLUNTEERS' | 'BOATS_CARS'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const cleanQuery = searchQuery.toLowerCase().trim();

  const filteredNgos = ngos.filter(n => 
    !cleanQuery || 
    n.name.toLowerCase().includes(cleanQuery) || 
    n.contactPerson?.toLowerCase().includes(cleanQuery) ||
    n.address?.toLowerCase().includes(cleanQuery)
  );

  const filteredVolunteers = volunteers.filter(v => {
    const matchesQuery = !cleanQuery || 
      v.name.toLowerCase().includes(cleanQuery) || 
      v.roleType?.toLowerCase().includes(cleanQuery) ||
      v.district?.toLowerCase().includes(cleanQuery) ||
      v.offerings?.toLowerCase().includes(cleanQuery);
    
    if (activeCategory === 'BOATS_CARS') {
      return matchesQuery && (
        v.roleType?.includes('Boat') || 
        v.roleType?.includes('Car') || 
        v.roleType?.includes('Truck') ||
        v.offerings?.toLowerCase().includes('boat') ||
        v.offerings?.toLowerCase().includes('car')
      );
    }
    return matchesQuery;
  });

  const getRoleBadge = (roleType = '') => {
    if (roleType.includes('Boat')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full inline-flex items-center gap-1">
        <Anchor className="w-3 h-3 text-blue-400" /> FREE RESCUE BOAT
      </span>
    );
    if (roleType.includes('Car') || roleType.includes('SUV')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full inline-flex items-center gap-1">
        <Car className="w-3 h-3 text-amber-400" /> FREE CAR / SUV TRANSPORT
      </span>
    );
    if (roleType.includes('Truck')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full inline-flex items-center gap-1">
        <Truck className="w-3 h-3 text-emerald-400" /> FREE GOODS TRUCK
      </span>
    );
    if (roleType.includes('Medical')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full inline-flex items-center gap-1">
        <Stethoscope className="w-3 h-3 text-rose-400" /> MEDICAL VOLUNTEER
      </span>
    );
    return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full inline-flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-purple-400" /> CITIZEN VOLUNTEER
      </span>
    );
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider mb-2">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>DIRECT RESCUE & RELIEF PARTNERS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              NGOs, FREE BOATS & VEHICLE RELIEF DIRECTORY
            </h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Direct contact directory for NGOs, free rescue boat owners, 4x4 cars/trucks for relief transport, and medical volunteers across Assam.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => openLoginModal?.('REGISTER', 'NGO')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg active:scale-95 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>+ REGISTER NGO</span>
            </button>

            <button
              onClick={() => openLoginModal?.('REGISTER', 'VOLUNTEER')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg active:scale-95 transition-all"
            >
              <Anchor className="w-4 h-4 text-cyan-300" />
              <span>+ OFFER FREE BOAT / CAR / VOLUNTEER</span>
            </button>
          </div>
        </div>

        {/* Category Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({ngos.length + volunteers.length})
            </button>

            <button
              onClick={() => setActiveCategory('NGOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeCategory === 'NGOS'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 NGOs ({ngos.length})
            </button>

            <button
              onClick={() => setActiveCategory('BOATS_CARS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeCategory === 'BOATS_CARS'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-300 hover:text-white'
              }`}
            >
              🚤 🚗 BOATS & CARS
            </button>

            <button
              onClick={() => setActiveCategory('VOLUNTEERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeCategory === 'VOLUNTEERS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🙋 ALL VOLUNTEERS ({volunteers.length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Search boat, car, name, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* NGO CARDS */}
        {(activeCategory === 'ALL' || activeCategory === 'NGOS') && filteredNgos.map((ngo) => (
          <div key={ngo.id} className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {ngo.logoUrl ? (
                    <img src={ngo.logoUrl} alt={ngo.name} className="w-11 h-11 rounded-xl object-cover border border-amber-400/60 shrink-0 shadow-md" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" /> REGISTERED NGO
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{ngo.name}</h3>
                    <p className="text-xs text-slate-400">Contact: <strong className="text-slate-200">{ngo.contactPerson}</strong></p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coverage:</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(ngo.operatingZones) && ngo.operatingZones.map((zone, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-md">
                      📍 {zone}
                    </span>
                  ))}
                </div>
              </div>

              {ngo.services && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Services Offered:</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(ngo.services) ? ngo.services.map((srv, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded font-semibold">
                        {srv}
                      </span>
                    )) : (
                      <span className="text-xs text-slate-300">{ngo.services}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Call Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <a
                href={`tel:${ngo.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call NGO</span>
              </a>

              <a
                href={`https://wa.me/91${(ngo.whatsapp || ngo.phone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ngo.name)},%20we%20need%20flood%20relief%20support.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ))}

        {/* VOLUNTEER CARDS (BOATS, CARS, DOCTORS) */}
        {(activeCategory === 'ALL' || activeCategory === 'VOLUNTEERS' || activeCategory === 'BOATS_CARS') && filteredVolunteers.map((vol) => (
          <div key={vol.id} className="bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {getRoleBadge(vol.roleType)}
                  <h3 className="text-base font-black text-white mt-1.5">{vol.name}</h3>
                  <p className="text-xs text-purple-300 font-bold">{vol.roleType}</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">District / Operating Location:</span>
                <span className="text-xs font-bold text-amber-300">📍 {vol.district || 'Assam'}</span>
              </div>

              {vol.offerings && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Free Transport / Assistance Details:</span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {vol.offerings}
                  </p>
                </div>
              )}
            </div>

            {/* Call & WhatsApp Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <a
                href={`tel:${vol.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Volunteer</span>
              </a>

              <a
                href={`https://wa.me/91${(vol.whatsapp || vol.phone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(vol.name)},%20we%20need%20flood%20relief%20boat/car%20support.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
