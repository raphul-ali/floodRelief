import React from 'react';
import { HeartHandshake, Siren, Home, FileText, Package } from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function MobileBottomDock({
  activeTab,
  setActiveTab,
  requestsCount = 0,
  currentAuth = { role: 'GUEST' },
}) {
  const isGuest = currentAuth.role === 'GUEST';

  const tabs = [
    {
      key:      isGuest ? 'home' : 'dashboard',
      label:    isGuest ? 'Home' : 'Dashboard',
      Icon:     isGuest ? Home : Package,
      isActive: isGuest ? activeTab === 'home' : activeTab === 'dashboard',
      danger:   false,
    },
    {
      key:      'public_requests',
      label:    'Requests',
      Icon:     FileText,
      isActive: activeTab === 'public_requests',
      badge:    requestsCount > 0 ? requestsCount : null,
      danger:   false,
    },
    {
      key:      'ngos',
      label:    'NGOs',
      Icon:     HeartHandshake,
      isActive: activeTab === 'ngos',
      danger:   false,
    },
    {
      key:      'emergency',
      label:    'Emergency',
      Icon:     Siren,
      isActive: activeTab === 'emergency',
      danger:   true,
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-gray-200 pb-safe"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.10)' }}
    >
      <div className="grid grid-cols-4 h-[58px]">
        {tabs.map(({ key, label, Icon, isActive, danger, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${
                isActive ? (danger ? 'bg-red-50' : 'bg-blue-50') : ''
              }`}>
                <Icon className={`w-[22px] h-[22px] transition-colors ${
                  isActive
                    ? danger ? 'text-red-600' : 'text-blue-600'
                    : 'text-gray-400'
                }`} />
              </div>
              {badge && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold leading-none transition-colors ${
              isActive ? (danger ? 'text-red-600' : 'text-blue-600') : 'text-gray-400'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
