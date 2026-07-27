import React from 'react';
import { Phone, ShieldAlert, PhoneCall, Building2, ExternalLink, Globe, Info } from 'lucide-react';

export default function ASDMAHelplines() {
  const districtHelplines = [
    { district: "Sivasagar ⭐", phone: "8471864355", tollFree: "1077" },
    { district: "Jorhat ⭐", phone: "0376-2300124", tollFree: "1077" },
    { district: "Charaideo", phone: "9085412180", tollFree: "1077" },
    { district: "Golaghat", phone: "9394985421", tollFree: "1077" },
  ];

  const stateControlNumbers = [
    { label: "State Toll-Free", number: "1070", isPrimary: true },
    { label: "Emergency Call", number: "112", isPrimary: true },
    { label: "Disaster Cell", number: "1079", isPrimary: false },
    { label: "Control Room 1", number: "03612-237219", isPrimary: false },
    { label: "Control Room 2", number: "09401044617", isPrimary: false },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
      
      {/* Community Directory Disclaimer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 text-red-400 rounded-2xl shrink-0">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Info className="w-3 h-3 text-amber-400" />
              <span>OFFICIAL EMERGENCY HELPLINE DIRECTORY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ASSAM FLOOD EMERGENCY HELPLINES (ASDMA & DISTRICTS)
            </h2>
            <p className="text-xs text-slate-300 font-semibold mt-0.5">
              Compiled official government emergency helpline numbers for citizens affected by floods.
            </p>
          </div>
        </div>

        <a
          href="tel:1070"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-xl shadow-red-950/60 border border-red-400/40 shrink-0"
        >
          <PhoneCall className="w-4 h-4 text-amber-300" />
          <span>CALL STATE TOLL FREE: 1070</span>
        </a>
      </div>

      {/* District Control Rooms */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>DISTRICT CONTROL ROOMS (TOLL FREE 1077 / 112)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {districtHelplines.map((item) => (
            <div 
              key={item.district}
              className="bg-slate-950 border border-slate-800 hover:border-amber-400/60 p-3.5 rounded-2xl space-y-2 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-white">{item.district}</span>
                <span className="text-[10px] bg-red-600/20 text-red-300 font-extrabold px-2 py-0.5 rounded border border-red-500/30">
                  Toll Free {item.tollFree}
                </span>
              </div>

              <div className="space-y-1">
                <a
                  href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-2 text-xs font-extrabold text-amber-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {item.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Control Room Numbers */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-amber-400" />
          <span>STATE CONTROL ROOM EMERGENCY NUMBERS</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {stateControlNumbers.map((num, idx) => (
            <a
              key={idx}
              href={`tel:${num.number.replace(/[^0-9]/g, '')}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                num.isPrimary
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-slate-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{num.label}: <strong>{num.number}</strong></span>
            </a>
          ))}
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Independent community portal providing public information for Assam Flood Relief. Not an official government website.</span>
        </div>
        <div className="flex items-center gap-3 font-bold text-amber-400">
          <a href="https://asdma.assam.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-400" /> Official ASDMA Govt Site: asdma.assam.gov.in
          </a>
        </div>
      </div>

    </div>
  );
}
