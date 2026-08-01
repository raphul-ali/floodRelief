import React, { useState, useEffect } from 'react';
import { PhoneCall, Phone, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function ASDMAHelplines() {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);

  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const districtHelplines = [
    { district: "Sivasagar", phone: "8471864355" },
    { district: "Jorhat", phone: "0376-2300124" },
    { district: "Majuli Island", phone: "03775-274411" },
    { district: "Charaideo", phone: "9085412180" },
    { district: "Golaghat", phone: "9394985421" },
    { district: "Lakhimpur", phone: "03752-222217" },
    { district: "Dhemaji", phone: "03753-224128" },
    { district: "Dibrugarh", phone: "0373-2301525" },
    { district: "Barpeta", phone: "03665-252125" },
    { district: "Cachar (Silchar)", phone: "03842-245866" },
    { district: "Dhubri", phone: "03662-230050" },
    { district: "Nagaon", phone: "03672-233185" }
  ];

  const filteredDistricts = districtHelplines.filter(d => 
    d.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm)
  );

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
      
      {/* Compact Summarized Single Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white uppercase tracking-tight">ASDMA Govt Helplines</span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">24x7</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Assam Disaster Control Rooms</p>
          </div>
        </div>

        {/* Minimal Direct Call Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1070"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow border border-red-400/40 active:scale-95 transition-all min-h-[36px]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>1070</span>
          </a>

          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold text-xs rounded-xl border border-slate-600 active:scale-95 transition-all min-h-[36px]"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>112</span>
          </a>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 active:scale-95 transition-all min-h-[36px] cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
            <span>Districts ({districtHelplines.length})</span>
          </button>
        </div>
      </div>

      {/* Expandable District Control Rooms List */}
      {expanded && (
        <div className="pt-3 border-t border-slate-700/80 space-y-2.5 animate-fadeIn">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter district control room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredDistricts.map((item) => (
              <a
                key={item.district}
                href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                className="p-2 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between hover:border-amber-400/50 active:scale-95 transition-all"
              >
                <div className="truncate">
                  <span className="text-[11px] font-bold text-white block truncate">{item.district}</span>
                  <span className="text-[10px] font-mono text-amber-300 block">{item.phone}</span>
                </div>
                <Phone className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
