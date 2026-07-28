import React from 'react';
import { 
  ShieldAlert, MapPin, HeartHandshake, FileText, PhoneCall, 
  PlusCircle, Sparkles, Stethoscope, Siren, UserCheck, Zap, Building2, ShieldCheck, Package, Info, Lock, LogOut, User, Home
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
  const isNgo = (currentAuth.role === 'NGO' || currentAuth.role === 'VOLUNTEER') && currentAuth.user;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-red-900/40 shadow-2xl w-full max-w-full overflow-x-hidden">
      
      {/* Top Disclaimer & Community Banner */}
      <div className="bg-slate-900 text-slate-200 text-[10px] sm:text-xs font-semibold px-3 py-1 flex items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 truncate">
          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-black text-[9px] sm:text-[10px] uppercase shrink-0">
            Private Initiative
          </span>
          <span className="text-slate-300 truncate">
            <strong>Notice:</strong> Independent community relief bridge. <span className="text-amber-300 font-bold">This is NOT an official government website.</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <a 
            href="tel:1070" 
            className="hover:underline flex items-center gap-1 font-extrabold bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-amber-300 text-[10px] sm:text-[11px]"
            title="Official Govt Emergency Helpline"
          >
            <PhoneCall className="w-3 h-3 text-amber-400" /> Govt Helpline: 1070
          </a>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between min-h-[52px] sm:h-16 py-1 gap-2">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink min-w-0"
          >
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 shadow-md group-hover:scale-105 transition-transform border border-red-400/40 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[11px] sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase leading-tight truncate">
                  <span className="hidden sm:inline">ASSAM FLOOD VICTIMS & NGO PORTAL</span>
                  <span className="sm:hidden font-black">ASSAM FLOOD RELIEF</span>
                </h1>
                {urgentCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] sm:text-xs font-black bg-red-600 text-white rounded-full animate-pulse border border-red-300 shrink-0">
                    {urgentCount} SOS
                  </span>
                )}
              </div>
              <p className="text-[10px] text-amber-300 font-bold hidden md:block tracking-wide">
                Direct Rescue Bridge Connecting Citizens with NGOs & Rescue Boats
              </p>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Home Button in Top Header */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[42px] rounded-xl text-[11px] sm:text-xs font-black border transition-all active:scale-95 shadow-md ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Home Dashboard"
            >
              <Home className="w-4 h-4 text-amber-400 shrink-0" />
              <span>HOME</span>
            </button>

            {/* Auth Session Button */}
            {currentAuth.role === 'GUEST' ? (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[42px] rounded-xl text-[11px] sm:text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-md active:scale-95 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>🔐 Login</span>
              </button>
            ) : currentAuth.role !== 'GUEST' ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] sm:min-h-[42px] rounded-xl text-xs font-black bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                title={`Logout ${currentAuth.user?.name || 'Session'}`}
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Logout</span>
              </button>
            ) : null}

            {/* Emergency SOS Button (Desktop/Tablet) */}
            <button
              onClick={openRescueModal}
              className="hidden sm:flex items-center gap-1 px-3.5 sm:px-4 py-2 min-h-[42px] rounded-xl font-black text-xs bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white shadow-lg active:scale-95 transition-all border border-red-400/40"
            >
              <ShieldAlert className="w-4 h-4 fill-white text-red-600 animate-pulse" />
              <span>🚨 REQUEST RESCUE</span>
            </button>

            {/* Relief Form Button */}
            <button
              onClick={openSupplyModal}
              className="hidden sm:flex items-center gap-1 px-3 sm:px-4 py-2 min-h-[42px] rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 shadow-md active:scale-95 transition-all border border-amber-300/40"
            >
              <Package className="w-4 h-4 text-slate-950 fill-amber-300" />
              <span>📦 RELIEF FORM</span>
            </button>

          </div>

        </div>

        {/* Navigation Bar */}
        <nav className="flex flex-col sm:flex-row items-center gap-1.5 py-1.5 border-t border-slate-800/80 text-[11px] sm:text-xs font-black w-full max-w-full">

          <div className="flex items-center gap-1.5 w-full sm:w-auto sm:flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all truncate text-center min-h-[38px] ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-400'
                  : 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-900/40'
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{currentAuth.role !== 'GUEST' ? 'CONTROL ROOM DASHBOARD' : 'RELIEF QUEUE'}</span>
            </button>

            {currentAuth.role === 'GUEST' && (
              <button
                onClick={() => setActiveTab('ngos')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all truncate text-center min-h-[38px] ${
                  activeTab === 'ngos'
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-md'
                    : 'text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">NGO & VOLUNTEERS</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all text-center min-h-[38px] ${
              activeTab === 'emergency'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-md border border-red-400 font-black'
                : 'text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 font-bold'
            }`}
          >
            <Siren className="w-4 h-4 shrink-0 animate-pulse" />
            <span className="uppercase tracking-tight">EMERGENCY SERVICES</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
