import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, MapPin, Search, MessageSquare, HeartHandshake, 
  Anchor, Car, Truck, Stethoscope, Users, UserPlus, Sparkles, Activity, ShieldCheck, Package, Megaphone
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS, VOLUNTEER_ROLES } from '../services/storageService';
import { i18nService } from '../services/i18nService';
import RippleButton from './ui/RippleButton';

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
      
      {/* Section header card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="status-chip status-chip-info text-[10px] sm:text-xs py-0.5 sm:py-1">
                <HeartHandshake className="w-3 h-3" />
                Partner Directory
              </span>
              <span className="status-chip status-chip-neutral text-[10px] sm:text-xs py-0.5 sm:py-1">
                {ngos.length + volunteers.length} Partners
              </span>
            </div>
            <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Relief Coordinators &amp; Partners
            </h2>
            <p className="hidden sm:block text-sm text-slate-500 max-w-xl">
              Direct contact directory for NGOs, rescue boat owners, 4×4 vehicles, trucks, and medical volunteers.
            </p>
          </div>

          {/* Register CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => openLoginModal?.('REGISTER', 'NGO')}
              className="bg-slate-800 hover:bg-slate-700 text-white transition-colors px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 min-h-[42px] shadow-sm"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Register NGO</span>
            </button>

            <button
              onClick={() => openLoginModal?.('REGISTER', 'VOLUNTEER')}
              className="bg-slate-800 hover:bg-slate-700 text-white transition-colors px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 min-h-[42px] shadow-sm"
            >
              <Anchor className="w-4 h-4 shrink-0" />
              <span>Offer Boat / Car</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="pt-1 sm:pt-3 sm:border-t sm:border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={i18nService.t('searchPlaceholder', 'Search by name, boat, car, district…')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-medium shadow-flat min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-black p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div id="ngo-cards-list-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* NGO CARDS */}
        {(activeCategory === 'ALL' || activeCategory === 'NGOS') && filteredNgos.map((ngo) => (
          <div key={ngo.id} className="card-surface card-accent-info rounded-2xl flex flex-col">
            {/* Card header */}
            <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
              {ngo.logoUrl ? (
                <img src={ngo.logoUrl} alt={ngo.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-flat" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5 text-indigo-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {getCoordinatorBadge(ngo.services)}
                <h3 className="text-sm font-black text-slate-900 mt-1 leading-tight truncate">{ngo.name}</h3>
                <p className="text-xs text-slate-500 truncate">Contact: <span className="font-semibold text-slate-700">{ngo.contactPerson}</span></p>
              </div>
            </div>

            {/* Card body */}
            <div className="flex-1 px-4 py-3 space-y-2.5">
              {Array.isArray(ngo.operatingZones) && ngo.operatingZones.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coverage</p>
                  <div className="flex flex-wrap gap-1">
                    {ngo.operatingZones.map((zone, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{zone}</span>
                    ))}
                  </div>
                </div>
              )}
              {ngo.services && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(ngo.services)
                      ? ngo.services.map((s, i) => <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-semibold">{s}</span>)
                      : <span className="text-xs text-slate-600">{ngo.services}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Call buttons */}
            <div className="px-4 pb-4 pt-3 border-t border-slate-100 flex gap-2">
              {(ngo.showPhone !== false || isAuthorizedPartner) ? (
                <>
                  <a href={`tel:${ngo.phone?.replace(/[^0-9]/g, '')}`}
                    className="ripple-btn btn-base btn-emerald flex-1 py-2.5 px-3 rounded-xl text-xs font-bold gap-1.5 min-h-[42px]">
                    <Phone className="w-4 h-4" /><span>Call NGO</span>
                  </a>
                  <a href={getWhatsAppLink(ngo.whatsapp || ngo.phone, `Hello ${ngo.name}, we need flood relief support.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="ripple-btn ripple-dark btn-base btn-glass flex-1 py-2.5 px-3 rounded-xl text-xs font-bold gap-1.5 min-h-[42px]">
                    <MessageSquare className="w-4 h-4 text-emerald-600" /><span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <div className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[42px] italic">
                  <Phone className="w-4 h-4 opacity-40" />
                  <span>NGO Partners Only</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* VOLUNTEER CARDS */}
        {(activeCategory === 'ALL' || activeCategory === 'VOLUNTEERS' || activeCategory === 'BOATS_CARS') && filteredVolunteers.map((vol) => (
          <div key={vol.id} className="card-surface card-accent-neutral rounded-2xl flex flex-col">
            {/* Card header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {getRoleBadge(vol.roleType)}
                  <h3 className="text-sm font-black text-slate-900 mt-1.5 leading-tight">{vol.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{vol.roleType}</p>
                </div>
                <span className="status-chip status-chip-neutral shrink-0">
                  <MapPin className="w-3 h-3" />
                  {vol.district || 'Assam'}
                </span>
              </div>
            </div>

            {/* Card body */}
            {vol.offerings && (
              <div className="flex-1 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assistance Details</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {vol.offerings}
                </p>
              </div>
            )}

            {/* Call buttons */}
            <div className="px-4 pb-4 pt-3 border-t border-slate-100 flex gap-2 mt-auto">
              {vol.showPhone === true ? (
                <>
                  <a href={`tel:${vol.phone?.replace(/[^0-9]/g, '')}`}
                    className="ripple-btn btn-base btn-indigo flex-1 py-2.5 px-3 rounded-xl text-xs font-bold gap-1.5 min-h-[42px]">
                    <Phone className="w-4 h-4" /><span>Call Volunteer</span>
                  </a>
                  <a href={getWhatsAppLink(vol.whatsapp || vol.phone, `Hello ${vol.name}, we need flood relief boat/car support.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="ripple-btn ripple-dark btn-base btn-glass flex-1 py-2.5 px-3 rounded-xl text-xs font-bold gap-1.5 min-h-[42px]">
                    <MessageSquare className="w-4 h-4 text-emerald-600" /><span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <div className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[42px] italic">
                  <Phone className="w-4 h-4 opacity-40" /><span>Number Hidden</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {((activeCategory === 'ALL' && filteredNgos.length === 0 && filteredVolunteers.length === 0) ||
          (activeCategory === 'NGOS' && filteredNgos.length === 0) ||
          ((activeCategory === 'BOATS_CARS' || activeCategory === 'VOLUNTEERS') && filteredVolunteers.length === 0)) && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 glass-card rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                No partners in this category
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery ? `No partners found for "${searchQuery}".` : 'No registered partners in this category yet.'} Are you an NGO or volunteer?
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(activeCategory !== 'ALL' || searchQuery) && (
                <RippleButton variant="relief" darkRipple={false}
                  onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold min-h-[42px]">
                  Show All
                </RippleButton>
              )}
              <RippleButton variant="glass" darkRipple
                onClick={() => openLoginModal?.('REGISTER', 'NGO')}
                className="px-4 py-2 rounded-xl text-xs font-bold min-h-[42px]">
                + Register NGO
              </RippleButton>
              <RippleButton variant="sos"
                onClick={() => openLoginModal?.('REGISTER', 'VOLUNTEER')}
                className="px-4 py-2 rounded-xl text-xs font-bold min-h-[42px]">
                + Offer Rescue
              </RippleButton>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
