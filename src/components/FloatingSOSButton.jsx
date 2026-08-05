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
    <div className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-8 right-3 sm:right-8 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none">
      
      {/* Floating Relief Form Button (High Attention Amber Relief Button) */}
      <button
        onClick={openSupplyModal}
        className="pointer-events-auto btn-relief flex items-center gap-2.5 px-4.5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider shadow-md min-h-[46px] group"
      >
        <Package className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
        <span className="text-white">{i18nService.t('reliefForm', 'REQUEST RELIEF')}</span>
      </button>

      {/* Floating Rescue SOS Button (Urgent SOS Red Rescue Button) */}
      <button
        onClick={openModal}
        className="pointer-events-auto btn-sos flex items-center gap-2.5 px-4.5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider shadow-md min-h-[46px] group"
      >
        <ShieldAlert className="w-5 h-5 text-white shrink-0 group-hover:rotate-12 transition-transform" />
        <span className="text-white">{i18nService.t('requestRescue', 'REQUEST RESCUE')}</span>
      </button>

    </div>
  );
}
