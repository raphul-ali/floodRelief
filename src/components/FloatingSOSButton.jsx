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
    <div className="fixed bottom-20 sm:bottom-8 right-3 sm:right-8 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      
      {/* Floating Rescue SOS Button */}
      <button
        onClick={openModal}
        className="pointer-events-auto flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-app-card border border-red-500/80 active:scale-[0.94] transition-all duration-150 cursor-pointer"
      >
        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
        <span>{i18nService.t('requestRescue', 'REQUEST RESCUE')}</span>
      </button>

      {/* Floating Relief Form Button */}
      <button
        onClick={openSupplyModal}
        className="pointer-events-auto flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-app-card border border-slate-700/80 active:scale-[0.94] transition-all duration-150 cursor-pointer"
      >
        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
        <span>{i18nService.t('reliefForm', 'RELIEF FORM')}</span>
      </button>

    </div>
  );
}
