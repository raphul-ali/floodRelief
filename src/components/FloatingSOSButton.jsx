import React from 'react';
import { ShieldAlert, Package } from 'lucide-react';

export default function FloatingSOSButton({ openModal, openSupplyModal }) {
  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 sm:hidden flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl p-2 rounded-2xl border border-red-500/40 shadow-2xl shadow-slate-950">
      <button
        onClick={openModal}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-tight shadow-lg active:scale-95 transition-all border border-red-400/40"
      >
        <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
        <span>🚨 RESCUE SOS</span>
      </button>

      <button
        onClick={openSupplyModal}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-tight shadow-md active:scale-95 transition-all border border-amber-300/40"
      >
        <Package className="w-4 h-4 text-slate-950" />
        <span>📦 RELIEF FORM</span>
      </button>
    </div>
  );
}
