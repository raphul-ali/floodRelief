import React from 'react';
import { 
  HeartHandshake, Siren, Home, FileText, Package
} from 'lucide-react';
import { i18nService } from '../services/i18nService';

export default function MobileBottomDock({
  activeTab,
  setActiveTab,
  requestsCount = 0,
  currentAuth = { role: 'GUEST' }
}) {
  const isDashboardActive = activeTab === 'dashboard' || (activeTab === 'ngos' && currentAuth.role === 'GUEST');
  const isRequestsActive = activeTab === 'public_requests';
  const isNgosActive = activeTab === 'ngos' && currentAuth.role !== 'GUEST';
  const isEmergencyActive = activeTab === 'emergency';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-950/98 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.9)] pb-safe">
      <div className="grid grid-cols-4 items-center justify-between h-16 px-1.5 py-1.5">
        
        {/* Tab 1: Dashboard / Home */}
        <button
          onClick={() => setActiveTab(currentAuth.role === 'GUEST' ? 'ngos' : 'dashboard')}
          className="flex flex-col items-center justify-center transition-all active:scale-90 min-h-[48px]"
        >
          <div className={`w-full py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            isDashboardActive
              ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}>
            {currentAuth.role !== 'GUEST' ? (
              <Package className={`w-5 h-5 ${isDashboardActive ? 'text-blue-300' : 'text-slate-400'}`} />
            ) : (
              <Home className={`w-5 h-5 ${isDashboardActive ? 'text-blue-300' : 'text-slate-400'}`} />
            )}
            <span className="text-[10px] font-black mt-0.5 tracking-tight truncate max-w-full">
              {currentAuth.role !== 'GUEST' ? i18nService.t('dashboard', 'Dashboard') : i18nService.t('home', 'Home')}
            </span>
          </div>
        </button>

        {/* Tab 2: Check Public Requests */}
        <button
          onClick={() => setActiveTab('public_requests')}
          className="flex flex-col items-center justify-center transition-all active:scale-90 min-h-[48px]"
        >
          <div className={`w-full py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
            isRequestsActive
              ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}>
            <div className="relative">
              <FileText className={`w-5 h-5 ${isRequestsActive ? 'text-blue-300' : 'text-slate-400'}`} />
              {requestsCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-red-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-slate-950 shadow-md">
                  {requestsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black mt-0.5 tracking-tight truncate max-w-full">
              {i18nService.t('checkRequests', 'Requests')}
            </span>
          </div>
        </button>

        {/* Tab 3: NGO & Volunteer Directory */}
        <button
          onClick={() => setActiveTab('ngos')}
          className="flex flex-col items-center justify-center transition-all active:scale-90 min-h-[48px]"
        >
          <div className={`w-full py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            isNgosActive
              ? 'bg-slate-700 text-white font-black shadow-md border border-slate-500 ring-1 ring-slate-400'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}>
            <HeartHandshake className={`w-5 h-5 ${isNgosActive ? 'text-blue-300' : 'text-slate-400'}`} />
            <span className="text-[10px] font-black mt-0.5 tracking-tight truncate max-w-full">
              {i18nService.t('ngosAndVolunteers', 'NGOs')}
            </span>
          </div>
        </button>

        {/* Tab 4: Emergency Services */}
        <button
          onClick={() => setActiveTab('emergency')}
          className="flex flex-col items-center justify-center transition-all active:scale-90 min-h-[48px]"
        >
          <div className={`w-full py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            isEmergencyActive
              ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/30 ring-1 ring-red-500'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}>
            <Siren className={`w-5 h-5 ${isEmergencyActive ? 'text-white' : 'text-red-400'}`} />
            <span className="text-[10px] font-black mt-0.5 tracking-tight truncate max-w-full">
              {i18nService.t('emergencyServices', 'Emergency')}
            </span>
          </div>
        </button>

      </div>
    </div>
  );
}
