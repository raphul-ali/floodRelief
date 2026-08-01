import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MapPin, HeartHandshake, FileText, PhoneCall, 
  PlusCircle, Sparkles, Stethoscope, Siren, UserCheck, Zap, Building2, ShieldCheck, Package, Info, Lock, LogOut, User, Home, Globe
} from 'lucide-react';
import { i18nService, LANGUAGES } from '../services/i18nService';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  openRescueModal, 
  openSupplyModal, 
  urgentCount = 0, 
  pendingCount = 0,
  requestsCount = 0,
  currentAuth = { role: 'GUEST', user: null },
  openLoginModal,
  onLogout,
  openDevModal
}) {
  const [currentLang, setCurrentLang] = useState(i18nService.getLanguage());
  const isAdmin = currentAuth.role === 'ADMIN';

  useEffect(() => {
    const handleLangChange = () => setCurrentLang(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl w-full max-w-full overflow-x-hidden">
      
      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between min-h-[52px] sm:h-16 py-1 gap-2">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink min-w-0"
          >
            <div className="relative shrink-0">
              <img 
                src="/helpaxom_badge.png" 
                alt="HELP AXOM Emblem" 
                className="w-10 h-10 sm:w-13 sm:h-13 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors uppercase leading-none">
                  HELP AXOM
                </h1>
                {urgentCount > 0 && (
                  <span className="px-2 py-0.5 text-[9px] sm:text-xs font-black bg-red-600 text-white rounded-full border border-red-400 shrink-0 animate-pulse">
                    {urgentCount} SOS
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] font-black text-cyan-400 tracking-wider uppercase mt-1 leading-none">
                UNITY. RELIEF. REBUILD.
              </p>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Desktop-Visible Relief & Rescue Buttons */}
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <button
                onClick={openSupplyModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] sm:min-h-[42px] rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all uppercase tracking-wider cursor-pointer"
                title="Submit Relief Support Form"
              >
                <Package className="w-4 h-4 text-slate-950 shrink-0" />
                <span>{i18nService.t('reliefForm', 'REQUEST RELIEF')}</span>
              </button>

              <button
                onClick={openRescueModal}
                style={{ backgroundColor: '#dc2626', opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] rounded-xl text-xs font-black bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white border-2 border-red-400 shadow-md active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                title="Request Emergency Rescue"
              >
                <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                <span>{i18nService.t('requestRescue', 'REQUEST RESCUE')}</span>
              </button>
            </div>

            {/* Home Button in Top Header */}
            <button
              onClick={() => setActiveTab(currentAuth.role === 'GUEST' ? 'ngos' : 'dashboard')}
              className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[42px] rounded-xl text-[11px] sm:text-xs font-extrabold border transition-all duration-150 active:scale-95 shadow-sm ${
                (activeTab === 'dashboard' || activeTab === 'ngos')
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-950/50'
                  : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border-slate-700'
              }`}
              title="Home"
            >
              <Home className="w-4 h-4 text-indigo-300 shrink-0" />
              <span className="hidden sm:inline">{i18nService.t('home')}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-slate-800/90 px-1.5 py-0.5 rounded-lg border border-slate-700/80 shrink-0 h-7 sm:h-8">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => i18nService.setLanguage(e.target.value)}
                className="bg-transparent text-cyan-300 text-[10px] sm:text-[11px] font-bold focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white font-semibold text-xs">
                    {l.code === 'en' ? 'EN' : l.native}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Session Button */}
            {currentAuth.role === 'GUEST' ? (
              <button
                onClick={openLoginModal}
                className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[42px] rounded-xl text-[11px] sm:text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border border-indigo-500 shadow-sm active:scale-95 transition-all duration-150"
                title="Login"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-200" />
                <span className="hidden sm:inline">{i18nService.t('login')}</span>
              </button>
            ) : currentAuth.role !== 'GUEST' ? (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-1 py-1 shadow-md shrink-0">
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-slate-300 truncate max-w-[120px]">
                    {currentAuth.role === 'ADMIN' ? 'Super Admin' : (currentAuth.user?.name || 'User')}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-black bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 active:scale-95 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="hidden sm:inline">{i18nService.t('logout')}</span>
                </button>
              </div>
            ) : null}

          </div>

        </div>

        {/* Navigation Bar (Desktop/Tablet) */}
        <nav className="hidden sm:flex flex-col sm:flex-row items-center gap-1.5 py-1.5 border-t border-slate-800/80 text-[11px] sm:text-xs font-black w-full max-w-full">

          <div className="flex items-center gap-1.5 w-full sm:w-auto sm:flex-1">
            {currentAuth.role !== 'GUEST' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all truncate text-center min-h-[38px] ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500'
                    : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold'
                }`}
              >
                <Package className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'dashboard' ? 'text-blue-300' : 'text-slate-400'}`} />
                <span className="truncate">{i18nService.t('dashboard')}</span>
              </button>
            )}

            {currentAuth.role === 'GUEST' && (
              <button
                onClick={() => setActiveTab('public_requests')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all truncate text-center min-h-[38px] ${
                  activeTab === 'public_requests'
                    ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500'
                    : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'public_requests' ? 'text-blue-300' : 'text-slate-400'}`} />
                <span className="truncate">{i18nService.t('checkRequests')}</span>
                {requestsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full border shadow-sm bg-red-600 text-white border-red-500">
                    {requestsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('ngos')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all truncate text-center min-h-[38px] ${
                activeTab === 'ngos'
                  ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold'
              }`}
            >
              <HeartHandshake className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'ngos' ? 'text-blue-300' : 'text-slate-400'}`} />
              <span className="truncate">{i18nService.t('ngosAndVolunteers')}</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all text-center min-h-[38px] ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white font-black shadow-md border border-red-500'
                : 'text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 font-semibold'
            }`}
          >
            <Siren className="w-4 h-4 shrink-0 text-red-400" />
            <span className="uppercase tracking-tight">{i18nService.t('emergencyServices')}</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
