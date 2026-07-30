import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, MapPin, Search, MessageSquare, HeartHandshake, 
  Anchor, Car, Truck, Stethoscope, Users, UserPlus, Sparkles, Activity, ShieldCheck, Package, Megaphone
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS, VOLUNTEER_ROLES } from '../services/storageService';
import { i18nService } from '../services/i18nService';

export default function NGODirectory({ ngos = [], volunteers = [], openLoginModal, currentAuth = { role: 'GUEST' } }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);

  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'NGOS' | 'VOLUNTEERS' | 'BOATS_CARS'
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthorizedPartner = currentAuth.role === 'NGO' || currentAuth.role === 'VOLUNTEER' || currentAuth.role === 'ADMIN';

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

  const getCoordinatorBadge = (services = '') => {
    const srvStr = Array.isArray(services) ? services.join(' ') : (services || '');
    if (srvStr.includes('Individual') || srvStr.includes('Self Help')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full inline-flex items-center gap-1">
        <HeartHandshake className="w-3 h-3 text-emerald-400" /> INDIVIDUAL HELPER
      </span>
    );
    if (srvStr.includes('Food') || srvStr.includes('Donor')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full inline-flex items-center gap-1">
        <Package className="w-3 h-3 text-blue-400" /> RELIEF DONOR
      </span>
    );
    if (srvStr.includes('Influencer') || srvStr.includes('Social')) return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full inline-flex items-center gap-1">
        <Megaphone className="w-3 h-3 text-purple-400" /> COMMUNITY INFLUENCER
      </span>
    );
    
    // Default NGO badge
    return (
      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full inline-flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-amber-400" /> REGISTERED NGO
      </span>
    );
  };

  const getWhatsAppLink = (phone, text) => {
    if (!phone) return '#';
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.length === 10) formatted = '91' + formatted;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="ngo-directory-container" className="space-y-5">
      
      {/* Native Mobile App Header & Filter Shell */}
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-app-card space-y-4">
        
        {/* Top App Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-black text-slate-300 uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
              <span>DIRECT RESCUE & RELIEF PARTNERS</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              RELIEF COORDINATORS & SERVICE PROVIDERS DIRECTORY
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              Direct contact directory for NGOs, Coordinators, free rescue boat owners, 4x4 cars/trucks, and medical services.
            </p>
          </div>

          {/* Native Action Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openLoginModal?.('REGISTER', 'NGO')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-700 hover:bg-slate-600 active:scale-95 text-white shadow-md border border-slate-600 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>+ REGISTER NGO</span>
            </button>

            <button
              onClick={() => openLoginModal?.('REGISTER', 'VOLUNTEER')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 shadow-md border border-slate-700 transition-all cursor-pointer"
            >
              <Anchor className="w-4 h-4 text-cyan-300" />
              <span>+ OFFER BOAT / CAR</span>
            </button>
          </div>
        </div>

        {/* PhonePe-Style Native Mobile App Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-700/60">
          
          {/* Tile 1: ALL */}
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center min-h-[64px] ${
              activeCategory === 'ALL'
                ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400 scale-[1.02]'
                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-4 h-4 ${activeCategory === 'ALL' ? 'text-blue-300' : 'text-slate-400'}`} />
              <span className="text-xs font-black">{i18nService.t('allCategories', 'ALL')}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeCategory === 'ALL' ? 'bg-slate-800 text-slate-200 border border-slate-600' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
              {ngos.length + volunteers.length} Partners
            </span>
          </button>

          {/* Tile 2: NGOs */}
          <button
            onClick={() => setActiveCategory('NGOS')}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center min-h-[64px] ${
              activeCategory === 'NGOS'
                ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400 scale-[1.02]'
                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className={`w-4 h-4 ${activeCategory === 'NGOS' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="text-xs font-black">{i18nService.t('ngosCategory', 'NGOs & Helpers')}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeCategory === 'NGOS' ? 'bg-slate-800 text-slate-200 border border-slate-600' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
              {ngos.length} Registered
            </span>
          </button>

          {/* Tile 3: BOATS & CARS */}
          <button
            onClick={() => setActiveCategory('BOATS_CARS')}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center min-h-[64px] ${
              activeCategory === 'BOATS_CARS'
                ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400 scale-[1.02]'
                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Anchor className={`w-4 h-4 ${activeCategory === 'BOATS_CARS' ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span className="text-xs font-black">{i18nService.t('boatsCarsCategory', 'Boats & 4x4')}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeCategory === 'BOATS_CARS' ? 'bg-slate-800 text-slate-200 border border-slate-600' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
              Rescue Vehicles
            </span>
          </button>

          {/* Tile 4: LOGISTICS & SERVICES */}
          <button
            onClick={() => setActiveCategory('VOLUNTEERS')}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center min-h-[64px] ${
              activeCategory === 'VOLUNTEERS'
                ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400 scale-[1.02]'
                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Truck className={`w-4 h-4 ${activeCategory === 'VOLUNTEERS' ? 'text-emerald-300' : 'text-slate-400'}`} />
              <span className="text-xs font-black">{i18nService.t('logisticsCategory', 'Logistics')}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeCategory === 'VOLUNTEERS' ? 'bg-slate-800 text-slate-200 border border-slate-600' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
              {volunteers.length} Services
            </span>
          </button>

        </div>

        {/* Native Search Bar Input */}
        <div className="relative w-full pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[58%] -translate-y-1/2" />
          <input
            type="text"
            placeholder={i18nService.t('searchPlaceholder', 'Search boat, car, name, district...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-[58%] -translate-y-1/2 text-slate-400 hover:text-white text-xs font-black p-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div id="ngo-cards-list-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
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
                    {getCoordinatorBadge(ngo.services)}
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
                      {zone}
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
              {(ngo.showPhone !== false || isAuthorizedPartner) ? (
                <>
                  <a
                    href={`tel:${ngo.phone?.replace(/[^0-9]/g, '')}`}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call NGO</span>
                  </a>

                  <a
                    href={getWhatsAppLink(ngo.whatsapp || ngo.phone, `Hello ${ngo.name}, we need flood relief support.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <div className="flex-1 py-2 px-3 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px] italic" title="Number hidden from public guests. Log in as a registered NGO to view.">
                  <Phone className="w-3.5 h-3.5 opacity-50" />
                  <span>Number Protected (NGO Partners Only)</span>
                </div>
              )}
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
                <span className="text-xs font-bold text-amber-300">{vol.district || 'Assam'}</span>
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
              {vol.showPhone === true ? (
                <>
                  <a
                    href={`tel:${vol.phone?.replace(/[^0-9]/g, '')}`}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Volunteer</span>
                  </a>

                  <a
                    href={getWhatsAppLink(vol.whatsapp || vol.phone, `Hello ${vol.name}, we need flood relief boat/car support.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <div className="flex-1 py-2 px-3 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[40px] italic">
                  <Phone className="w-3.5 h-3.5 opacity-50" />
                  <span>Number Hidden</span>
                </div>
              )}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
