import React, { useState, useEffect } from 'react';
import { ShieldAlert, Package } from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function FloatingSOSButton({ openModal, openSupplyModal }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-8 right-3 sm:right-8 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      
      {/* Floating Relief Form Button (Primary / High-Attention) */}
      <button
        onClick={openSupplyModal}
        className="pointer-events-auto flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(245,158,11,0.5)] border-2 border-amber-200 transition-all duration-150 cursor-pointer ring-2 ring-amber-400/40"
      >
        <Package className="w-5 h-5 text-slate-950 shrink-0" />
        <span>{i18nService.t('reliefForm', 'REQUEST RELIEF')}</span>
      </button>

      {/* Floating Rescue SOS Button (Secondary) */}
      <button
        onClick={openModal}
        className="pointer-events-auto flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-red-950/90 hover:bg-red-900 text-red-200 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-app-card border border-red-500/60 active:scale-95 transition-all duration-150 cursor-pointer"
      >
        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
        <span>{i18nService.t('requestRescue', 'REQUEST RESCUE')}</span>
      </button>

    </div>
  );
}
