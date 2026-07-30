import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Building2, Globe, Info, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function ASDMAHelplines() {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);

  const [expanded, setExpanded] = useState(false);

  const districtHelplines = [
    { district: "Sivasagar", phone: "8471864355", tollFree: "1077" },
    { district: "Jorhat", phone: "0376-2300124", tollFree: "1077" },
    { district: "Charaideo", phone: "9085412180", tollFree: "1077" },
    { district: "Golaghat", phone: "9394985421", tollFree: "1077" },
    { district: "Lakhimpur", phone: "03752-222217", tollFree: "1077" },
    { district: "Dhemaji", phone: "03753-224128", tollFree: "1077" },
    { district: "Majuli Island", phone: "03775-274411", tollFree: "1077" },
    { district: "Dibrugarh", phone: "0373-2301525", tollFree: "1077" },
    { district: "Barpeta", phone: "03665-252125", tollFree: "1077" },
    { district: "Cachar (Silchar)", phone: "03842-245866", tollFree: "1077" },
    { district: "Dhubri", phone: "03662-230050", tollFree: "1077" },
    { district: "Nagaon", phone: "03672-233185", tollFree: "1077" }
  ];

  const stateControlNumbers = [
    { label: "State Toll-Free", number: "1070", isPrimary: true },
    { label: "Emergency Call", number: "112", isPrimary: true },
    { label: "Disaster Cell", number: "1079", isPrimary: false },
    { label: "Control Room 1", number: "03612-237219", isPrimary: false },
    { label: "Control Room 2", number: "09401044617", isPrimary: false },
  ];

  return (
    <div className="bg-slate-800 sm:bg-slate-800/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-app-card space-y-3 active:scale-[0.995] sm:active:scale-100 transition-all">
      
      {/* Compact Header Bar */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-red-600/20 border border-red-500/40 text-red-400 rounded-xl sm:rounded-2xl shrink-0 shadow-sm">
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
              <span>ASDMA Govt Emergency Helplines</span>
              <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full shadow-sm">
                1070 / 112
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 font-semibold">
              Assam State Disaster Management Control Numbers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full xs:w-auto">
          <a
            href="tel:1070"
            className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs sm:text-xs rounded-xl shadow-md border border-red-400/40 active:scale-95 transition-all min-h-[44px] sm:min-h-[38px]"
          >
            <PhoneCall className="w-4 h-4 text-amber-300" />
            <span>CALL 1070</span>
          </a>

          {/* Prominent Expand / Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 xs:flex-none px-3.5 py-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 active:scale-95 transition-all min-h-[44px] sm:min-h-[38px] cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 text-amber-400" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-amber-400" />
                <span>More ({districtHelplines.length} Districts)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content Section */}
      {expanded && (
        <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
          
          {/* District Control Rooms Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>District Control Rooms (Toll Free 1077 / 112)</span>
              </h3>
              <span className="text-[10px] text-slate-400">{districtHelplines.length} Districts Loaded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {districtHelplines.map((item) => (
                <div 
                  key={item.district}
                  className="bg-slate-950 border border-slate-800/90 p-3 sm:p-2.5 rounded-2xl sm:rounded-xl space-y-1.5 text-xs active:scale-[0.98] transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs sm:text-[11px] truncate">{item.district}</span>
                    <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold">1077</span>
                  </div>
                  <a
                    href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center justify-center gap-1.5 text-xs sm:text-[11px] font-black text-amber-300 hover:text-white bg-slate-900 py-2 sm:py-1 rounded-xl border border-slate-800 active:scale-95 transition-all min-h-[40px] sm:min-h-[32px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* State Control Room Numbers */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State Emergency Lines:</span>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-1.5">
              {stateControlNumbers.map((num, idx) => (
                <a
                  key={idx}
                  href={`tel:${num.number.replace(/[^0-9]/g, '')}`}
                  className={`px-3 py-2 sm:py-1 rounded-xl sm:rounded-lg text-xs sm:text-[11px] font-bold flex items-center justify-center sm:justify-start gap-1.5 border active:scale-95 transition-all min-h-[40px] sm:min-h-[32px] ${
                    num.isPrimary
                      ? 'bg-red-600 text-white border-red-400 shadow-md'
                      : 'bg-slate-950 text-amber-300 border-slate-800'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{num.label}: <strong className="font-mono">{num.number}</strong></span>
                </a>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
