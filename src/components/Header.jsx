import React from 'react';
import { 
  ShieldAlert, MapPin, HeartHandshake, FileText, PhoneCall, Server, 
  PlusCircle, Sparkles, Stethoscope, Siren, UserCheck, Zap, Building2, ShieldCheck, Package, Info, Lock, LogOut, User
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  openRescueModal, 
  openSupplyModal, 
  urgentCount = 0, 
  pendingCount = 0,
  currentAuth = { role: 'GUEST', user: null },
  openLoginModal,
  onLogout
}) {
  const isAdmin = currentAuth.role === 'ADMIN';
  const isNgo = currentAuth.role === 'NGO' && currentAuth.user;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-red-900/40 shadow-2xl">
      
      {/* Community Ticker */}
      <div className="bg-gradient-to-r from-red-900 via-rose-800 to-red-900 text-white text-[11px] sm:text-xs font-semibold px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-red-500/30">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="uppercase tracking-wider font-extrabold text-amber-200">
            ASSAM FLOOD VICTIMS & NGO COMMUNITY NETWORK
          </span>
          <span className="hidden md:inline text-red-100">
            | Emergency Contacts: ASDMA 1070 | NDRF: 011-24363260 | Emergency: 112
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href="tel:1070" 
            className="hover:underline flex items-center gap-1 font-black bg-red-950/80 px-2.5 py-0.5 rounded border border-red-400/40 text-amber-200 text-[11px]"
          >
            <PhoneCall className="w-3 h-3 text-amber-400" /> ASDMA 1070
          </a>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform border border-red-400/40">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  ASSAM FLOOD VICTIMS & NGO PORTAL
                </h1>
                {urgentCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs font-black bg-red-600 text-white rounded-full animate-pulse border border-red-300">
                    {urgentCount} CRITICAL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-300 font-bold hidden sm:block tracking-wide">
                Direct Rescue Bridge Connecting Citizens with NGOs & Rescue Boats
              </p>
            </div>
          </div>

          {/* Primary Action Buttons + Login Session Pill */}
          <div className="flex items-center gap-2">
            
            {/* Auth Session Button */}
            {currentAuth.role === 'GUEST' ? (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-md active:scale-95 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>🔐 Login / NGO Portal</span>
              </button>
            ) : isNgo ? (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-black text-emerald-300 truncate max-w-[140px]" title={currentAuth.user.name}>
                    {currentAuth.user.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-400 ml-1 p-1"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/40 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span className="font-black text-red-200">Admin Control Active</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-400 ml-1 p-1"
                  title="Lock Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <button
              onClick={openRescueModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-900/60 active:scale-95 transition-all border border-red-400/40 animate-urgent-pulse"
            >
              <ShieldAlert className="w-4 h-4 fill-white text-red-600 animate-pulse" />
              <span>🚨 REQUEST RESCUE</span>
            </button>

            <button
              onClick={openSupplyModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md active:scale-95 transition-all border border-amber-300/40"
            >
              <Package className="w-4 h-4 fill-slate-950 text-amber-500" />
              <span>📦 RELIEF FORM</span>
            </button>

          </div>

        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar text-xs font-black">
          
          {/* Admin Control Center Tab (Visible ONLY when logged in as Admin) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap relative ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white font-black shadow-lg shadow-red-950/60 border border-red-400'
                  : 'bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>🛡️ ADMIN CONTROL ROOM</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-white text-red-600 rounded-full animate-pulse ml-1">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* NGO Directory */}
          <button
            onClick={() => setActiveTab('ngos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'ngos'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-md'
                : 'text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>🤝 NGO DIRECTORY</span>
          </button>

          {/* NGO Relief Queue */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/60 border border-amber-400'
                : 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-900/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 NGO RELIEF QUEUE</span>
          </button>

          <span className="text-slate-700 px-1 font-normal">|</span>

          {/* Emergency Responders & Hospitals */}
          <div className="flex items-center gap-1 bg-red-950/40 p-1 rounded-xl border border-red-900/40 shrink-0">
            <button
              onClick={() => setActiveTab('responders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'responders'
                  ? 'bg-red-600 text-white shadow-md border border-red-400'
                  : 'text-red-200 hover:bg-red-900/60'
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Fire & Police</span>
            </button>

            <button
              onClick={() => setActiveTab('medicals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'medicals'
                  ? 'bg-rose-600 text-white shadow-md border border-rose-400'
                  : 'text-rose-200 hover:bg-rose-900/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Hospitals (GPS)</span>
            </button>
          </div>

          <span className="text-slate-700 px-1 font-normal">|</span>

          {/* Map & Directories */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteers')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'volunteers'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:bg-purple-950/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Volunteers</span>
            </button>
          </div>

          <span className="text-slate-700 px-1 font-normal">|</span>

          {/* Setup */}
          <button
            onClick={() => setActiveTab('hosting-guide')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'hosting-guide'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Free Deploy Guide</span>
          </button>

        </nav>

      </div>
    </header>
  );
}
