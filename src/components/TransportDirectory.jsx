import React, { useState } from 'react';
import { Search, Anchor, Car, Phone, MapPin, User, ShieldCheck } from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function TransportDirectory({ volunteers, openLoginModal }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only volunteers who offer Boat or Car
  const transportVolunteers = volunteers.filter(v => {
    if (!v.offerings) return false;
    const off = v.offerings.toLowerCase();
    return off.includes('boat') || off.includes('car');
  });

  const filtered = transportVolunteers.filter(v => {
    const term = searchTerm.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(term)) ||
      (v.district && v.district.toLowerCase().includes(term)) ||
      (v.offerings && v.offerings.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="transport-directory-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 p-1.5 rounded-xl shrink-0">
                <Anchor className="w-5 h-5" />
              </span>
              Transport Help
            </h2>
            <button 
              onClick={() => openLoginModal && openLoginModal('REGISTER', 'VOLUNTEER')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Offer Car / Boat
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Find volunteers offering boats and vehicles for rescue and relief operations.
          </p>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={i18nService.t('search_ngo')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(vol => {
          const hasBoat = vol.offerings?.toLowerCase().includes('boat');
          const hasCar = vol.offerings?.toLowerCase().includes('car');
          
          return (
            <div key={vol.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-3xl"></div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">{vol.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Volunteer</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {hasBoat && (
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg" title="Offers Boat">
                      <Anchor className="w-4 h-4" />
                    </div>
                  )}
                  {hasCar && (
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg" title="Offers Car">
                      <Car className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex items-start gap-2 text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                  <span className="line-clamp-2">{vol.district}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600 font-medium">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5 w-4 text-center">SRV</span>
                  <span className="line-clamp-2 text-xs">{vol.offerings}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100">
                <a
                  href={`tel:${vol.phone}`}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {vol.phone}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <Anchor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No transport volunteers found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
