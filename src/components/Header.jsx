import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, HeartHandshake, FileText,
  Siren, Package, Lock, LogOut, User, ChevronDown
} from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function Header({
  activeTab,
  setActiveTab,
  openRescueModal,
  openSupplyModal,
  urgentCount = 0,
  requestsCount = 0,
  currentAuth = { role: 'GUEST', user: null },
  openLoginModal,
  onLogout,
}) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const h = () => forceUpdate(n => n + 1);
    window.addEventListener('flood_lang_changed', h);
    return () => window.removeEventListener('flood_lang_changed', h);
  }, []);

  const tabs = [
    currentAuth.role !== 'GUEST'
      ? { key: 'dashboard',       label: 'Dashboard',         Icon: Package }
      : { key: 'public_requests', label: 'Requests',           Icon: FileText, count: requestsCount },
    { key: 'ngos',      label: 'NGOs & Volunteers', Icon: HeartHandshake },
    { key: 'emergency', label: 'Emergency',          Icon: Siren, danger: true },
  ];

  const userName = currentAuth.role === 'ADMIN'
    ? 'Admin'
    : currentAuth.user?.name || currentAuth.user?.email?.split('@')[0] || 'Partner';

  return (
    <header className="sticky top-0 z-50 bg-[#111827] border-b border-[#1f2937] w-full text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Brand + Actions bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

          {/* Logo */}
          <div
            onClick={() => setActiveTab(currentAuth.role === 'GUEST' ? 'public_requests' : 'dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <img
              src="/helpaxom_badge.png"
              alt="HELP AXOM"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black tracking-tight text-white uppercase">
                  HELP AXOM
                </span>
                {urgentCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {urgentCount} SOS
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-[10px] text-[#6b7280] font-medium tracking-[0.1em] uppercase mt-0.5">
                Unity · Relief · Rebuild
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Desktop: Request Relief + SOS */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button
                onClick={openSupplyModal}
                className="ripple-btn h-9 px-4 rounded-lg text-[13px] font-semibold bg-[#1e3a5f] hover:bg-[#1e40af] border border-[#1e40af]/60 text-blue-200 transition-all cursor-pointer"
              >
                {i18nService.t('reliefForm', 'Request Relief')}
              </button>
              <button
                onClick={openRescueModal}
                className="ripple-btn h-9 px-4 rounded-lg text-[13px] font-semibold bg-red-600 hover:bg-red-700 text-white border border-red-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {i18nService.t('requestRescue', 'SOS Rescue')}
              </button>
            </div>

            {/* Auth area */}
            {currentAuth.role === 'GUEST' ? (
              <button
                onClick={openLoginModal}
                className="ripple-btn h-9 px-4 rounded-lg text-[13px] font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              /* Logged-in user chip */
              <div className="flex items-center gap-2 h-9 bg-[#1f2937] border border-[#374151] rounded-lg px-3">
                <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-white uppercase">
                    {userName.charAt(0)}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-[#e5e7eb] max-w-[90px] truncate hidden sm:block">
                  {userName}
                </span>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="ripple-btn ml-1 text-[#6b7280] hover:text-[#e5e7eb] transition-colors cursor-pointer p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Nav tabs (desktop/tablet) ──────────────────────────────── */}
        <nav className="hidden sm:flex items-center gap-0 border-t border-[#1f2937]">
          {tabs.map(({ key, label, Icon, count, danger }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  ripple-btn relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium
                  transition-colors duration-150 cursor-pointer whitespace-nowrap
                  ${isActive
                    ? danger ? 'text-red-400' : 'text-white'
                    : danger ? 'text-red-600 hover:text-red-400' : 'text-[#6b7280] hover:text-[#d1d5db]'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
                {/* Active underline */}
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${danger ? 'bg-red-500' : 'bg-[#3b82f6]'}`} />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
