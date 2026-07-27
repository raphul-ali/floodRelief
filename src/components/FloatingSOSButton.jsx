import React from 'react';
import { ShieldAlert, Package } from 'lucide-react';

export default function FloatingSOSButton({ openModal, openSupplyModal }) {
  return (
    <div className="fixed bottom-2 inset-x-2 z-40 sm:hidden flex items-center gap-1.5 p-1.5 bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-red-500/40 shadow-2xl max-w-[calc(100vw-16px)] mx-auto box-border">
      <button
        onClick={openModal}
        className="flex-1 flex items-center justify-center gap-1 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[11px] uppercase tracking-tight shadow-md active:scale-95 transition-all border border-red-400/40 min-w-0"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
        <span className="truncate">🚨 RESCUE SOS</span>
      </button>

      <button
        onClick={openSupplyModal}
        className="flex-1 flex items-center justify-center gap-1 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[11px] uppercase tracking-tight shadow-md active:scale-95 transition-all border border-amber-300/40 min-w-0"
      >
        <Package className="w-4 h-4 text-slate-950 shrink-0" />
        <span className="truncate">📦 RELIEF FORM</span>
      </button>
    </div>
  );
}
