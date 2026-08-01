import React, { useState, useEffect } from 'react';
import { PhoneCall, Phone, ChevronDown, ChevronUp, Search, Radio } from 'lucide-react';
import { i18nService } from '../services/i18nService';
import RippleButton from './ui/RippleButton';

export default function ASDMAHelplines() {
  const [, setLangState] = useState(i18nService.getLanguage());
  const [expanded, setExpanded]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const h = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', h);
    return () => window.removeEventListener('flood_lang_changed', h);
  }, []);

  const districtHelplines = [
    { district: 'Sivasagar',         phone: '8471864355'    },
    { district: 'Jorhat',            phone: '0376-2300124'  },
    { district: 'Majuli Island',     phone: '03775-274411'  },
    { district: 'Charaideo',         phone: '9085412180'    },
    { district: 'Golaghat',          phone: '9394985421'    },
    { district: 'Lakhimpur',         phone: '03752-222217'  },
    { district: 'Dhemaji',           phone: '03753-224128'  },
    { district: 'Dibrugarh',         phone: '0373-2301525'  },
    { district: 'Barpeta',           phone: '03665-252125'  },
    { district: 'Cachar (Silchar)',   phone: '03842-245866'  },
    { district: 'Dhubri',            phone: '03662-230050'  },
    { district: 'Nagaon',            phone: '03672-233185'  },
  ];

  const filtered = districtHelplines.filter(d =>
    d.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-lifted">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600 rounded-xl text-white shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-red-900 tracking-tight">
                ASDMA Govt Helplines
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                24×7
              </span>
            </div>
            <p className="text-xs text-red-700 font-medium">
              Assam State Disaster Management Control Rooms
            </p>
          </div>
        </div>

        {/* Call CTAs + expand */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1070"
            className="ripple-btn btn-base btn-sos px-3.5 py-2 rounded-xl text-xs font-black gap-1.5 min-h-[38px]"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>1070</span>
          </a>

          <a
            href="tel:112"
            className="ripple-btn ripple-dark btn-base btn-glass px-3.5 py-2 rounded-xl text-xs font-bold gap-1.5 min-h-[38px]"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>112</span>
          </a>

          <RippleButton
            variant="glass"
            darkRipple
            onClick={() => setExpanded(!expanded)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold gap-1.5 min-h-[38px]"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Districts</span>
            <span className="font-black text-slate-600">({districtHelplines.length})</span>
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </RippleButton>
        </div>
      </div>

      {/* Expandable district list */}
      {expanded && (
        <div className="p-4 space-y-3 animate-slide-up bg-white">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search district or number…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-400 font-medium min-h-[38px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map(item => (
              <a
                key={item.district}
                href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                className="ripple-btn ripple-dark group p-2.5 bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="truncate">
                  <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-red-700 transition-colors">
                    {item.district}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block group-hover:text-red-600">
                    {item.phone}
                  </span>
                </div>
                <Phone className="w-3.5 h-3.5 text-emerald-500 group-hover:text-red-500 shrink-0 ml-2 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
