import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function FloatingSOSButton({ openModal }) {
  return (
    <div className="fixed bottom-6 right-5 z-50 sm:hidden">
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-red-950/80 border-2 border-white/60 active:scale-95 transition-all animate-urgent-pulse"
      >
        <ShieldAlert className="w-5 h-5 animate-pulse text-amber-300" />
        <span>🚨 REQUEST RESCUE</span>
      </button>
    </div>
  );
}
