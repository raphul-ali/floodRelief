import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ASDMAHelplines from './components/ASDMAHelplines';
import NGODashboard from './components/NGODashboard';
import InteractiveMap from './components/InteractiveMap';
import NGODirectory from './components/NGODirectory';
import VolunteerDirectory from './components/VolunteerDirectory';
import NearestMedicals from './components/NearestMedicals';
import FreeHostingGuide from './components/FreeHostingGuide';
import VictimRequestForm from './components/VictimRequestForm';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import FloatingSOSButton from './components/FloatingSOSButton';
import EmergencyServices from './components/EmergencyServices';
import PublicRequestsList from './components/PublicRequestsList';
import MobileBottomDock from './components/MobileBottomDock';
import DeveloperModal from './components/DeveloperModal';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { i18nService } from './services/i18nService';
import { RefreshCw, Lock, Key, Mail, ShieldCheck, AlertTriangle, Eye, EyeOff, LogOut, MapPin, Code, Github, Instagram } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(authService.getCurrentUser().role === 'GUEST' ? 'public_requests' : 'dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER'
  const [loginModalRegRole, setLoginModalRegRole] = useState('NGO'); // 'NGO' | 'VOLUNTEER'
  const [modalUrgentMode, setModalUrgentMode] = useState(true);
  
  const [victimRequests, setVictimRequests] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentAuth, setCurrentAuth] = useState(authService.getCurrentUser());

  // Secret /raphul-admin route detection
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const mainContentRef = useRef(null);

  const checkPath = () => {
    const isSecretPath = window.location.pathname === '/raphul-admin' || 
                         window.location.hash === '#/raphul-admin' || 
                         window.location.hash === '#raphul-admin';
    setIsAdminPath(isSecretPath);
  };

  const loadData = () => {
    setVictimRequests(storageService.getVictimRequests());
    setNgos(storageService.getNGOs());
    setVolunteers(storageService.getVolunteers());

    const pendingReqs = storageService.getPendingVictimRequests().length;
    const pendingLogs = storageService.getPendingDeliveryLogs().length;
    const pendingNgos = storageService.getPendingNGOs().length;
    const pendingVols = storageService.getPendingVolunteers().length;
    const pendingRecs = storageService.getPendingAccountRecoveryRequests().length;
    setPendingCount(pendingReqs + pendingLogs + pendingNgos + pendingVols + pendingRecs);
  };

  useEffect(() => {
    checkPath();
    loadData();

    // Trigger immediate Supabase Cloud Data Sync in parallel
    storageService.syncWithSupabase().finally(() => {
      setIsLoadingData(false);
    });

    const stopAutoRefresh = authService.startSessionAutoRefresh();

    const handleDataChanged = () => {
      loadData();
      setIsLoadingData(false);
    };
    const handleAuthChanged = () => {
      const user = authService.getCurrentUser();
      setCurrentAuth(user);
      if (user.role === 'GUEST') {
        setActiveTab('public_requests');
      }
    };
    const handleLangChanged = () => setLangState(i18nService.getLanguage());

    window.addEventListener('flood_data_changed', handleDataChanged);
    window.addEventListener('flood_auth_changed', handleAuthChanged);
    window.addEventListener('flood_lang_changed', handleLangChanged);
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    
    return () => {
      stopAutoRefresh();
      window.removeEventListener('flood_data_changed', handleDataChanged);
      window.removeEventListener('flood_auth_changed', handleAuthChanged);
      window.removeEventListener('flood_lang_changed', handleLangChanged);
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  const openRescueModal = () => {
    setModalUrgentMode(true);
    setIsRequestModalOpen(true);
  };

  const openSupplyModal = () => {
    setModalUrgentMode(false);
    setIsRequestModalOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setActiveTab('dashboard');
  };

  const handleSecretAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      authService.loginAdmin(adminEmail, adminPassword);
      setAdminPassword('');
      loadData();
    } catch (err) {
      setAdminLoginError(err.message || 'Invalid Email or Password');
    }
  };

  const urgentCount = victimRequests.filter(req => req.isUrgentRescue && req.status !== 'Rescued').length;

  // SECRET /raphul-admin ROUTE VIEW
  if (isAdminPath) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 space-y-6">
        
        {/* Private Top Bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-red-900/40 pb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-red-600 rounded-xl text-white shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xs sm:text-lg font-black text-white leading-tight">CONTROL ROOM (/raphul-admin)</h1>
              <p className="text-[10px] sm:text-xs text-red-300">Authorized Super Admin Access</p>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.pathname = '/';
              window.location.hash = '';
            }}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] sm:text-xs font-black border border-slate-800 shrink-0 min-h-[38px] flex items-center justify-center"
          >
            &larr; Public Site
          </a>
        </div>

        {/* If logged in as Super Admin */}
        {currentAuth.role === 'ADMIN' ? (
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-red-950/70 border border-red-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-xs font-bold text-red-200">
                  Super Admin: <strong className="text-amber-300 font-black">raphulali@gmail.com</strong>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs font-black border border-red-500/40 shrink-0 min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                title="Logout of Admin session"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Logout</span>
              </button>
            </div>

            <AdminDashboard onDataUpdated={() => loadData()} />
          </div>
        ) : (
          /* Secret Mobile-Optimized Admin Login Screen */
          <div className="w-[94vw] max-w-md mx-auto mt-4 mb-24 sm:my-12 bg-slate-900 border border-red-900/60 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-950">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Super Admin Portal</h2>
              <p className="text-xs text-slate-400">
                Authorized Login for <span className="text-amber-300 font-bold">Raphul Ali</span>
              </p>
            </div>

            {adminLoginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleSecretAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="raphulali@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Super Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
                    title={showAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Lock className="w-4 h-4" />
                <span>UNLOCK SUPER ADMIN CONTROL ROOM</span>
              </button>
            </form>
          </div>
        )}

      </div>
    );
  }

  // PUBLIC WEBSITE VIEW
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setTimeout(() => {
      if (tabName === 'ngos') {
        const ngoEl = document.getElementById('ngo-cards-list-container') || document.getElementById('ngo-directory-container');
        if (ngoEl) {
          const yOffset = -90; // Offset for sticky header
          const y = ngoEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else if (tabName === 'emergency') {
        const emergencyEl = document.getElementById('emergency-filters-section');
        if (emergencyEl) {
          const yOffset = -90; // Offset for sticky header
          const y = emergencyEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else if (mainContentRef.current) {
        const yOffset = -80; // Offset for sticky header
        const y = mainContentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Fixed Header Bar (Zero Admin Buttons) */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openRescueModal={openRescueModal}
        openSupplyModal={openSupplyModal}
        urgentCount={urgentCount}
        pendingCount={pendingCount}
        requestsCount={victimRequests.length}
        currentAuth={currentAuth}
        openLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        openDevModal={() => setIsDevModalOpen(true)}
      />

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 ${currentAuth.role !== 'GUEST' ? 'py-2 space-y-3' : 'py-6 space-y-6'}`}>
        
        {/* Official ASDMA Emergency Helplines Notice (Only shown for Guest citizens) */}
        {currentAuth.role === 'GUEST' && <ASDMAHelplines />}

        {/* Scroll Target Element */}
        <div ref={mainContentRef} className="scroll-mt-24" />

        {/* NGO Rescue Queue (Protected Route) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {currentAuth.role !== 'GUEST' ? (
              <NGODashboard 
                victimRequests={victimRequests} 
                ngos={ngos} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Lock className="w-12 h-12 text-slate-600 mb-2" />
                <h2 className="text-xl font-black text-slate-300">Authorized Personnel Only</h2>
                <p className="text-slate-500 max-w-sm">
                  The Relief Control Room is restricted to verified NGOs and registered Volunteers.
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  Partner Login
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <InteractiveMap 
            victimRequests={victimRequests} 
            ngos={ngos} 
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyServices />
        )}

        {activeTab === 'public_requests' && (
          <PublicRequestsList victimRequests={victimRequests} deliveryLogs={storageService.getDeliveryLogs()} isLoading={isLoadingData} />
        )}

        {activeTab === 'ngos' && (
          <NGODirectory 
            ngos={ngos} 
            volunteers={volunteers}
            currentAuth={currentAuth}
            openLoginModal={(mode = 'REGISTER', regRole = 'NGO') => {
              setLoginModalMode(mode);
              setLoginModalRegRole(regRole);
              setIsLoginModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Mobile Floating SOS Button */}
      <FloatingSOSButton openModal={openRescueModal} openSupplyModal={openSupplyModal} />

      {/* NGO & Volunteer Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          initialMode={loginModalMode}
          initialRegRole={loginModalRegRole}
          onClose={() => setIsLoginModalOpen(false)}
          onLoggedIn={() => {
            loadData();
            handleTabChange('dashboard');
          }}
        />
      )}

      {/* Emergency Request Popup Modal */}
      {isRequestModalOpen && (
        <VictimRequestForm
          initialUrgent={modalUrgentMode}
          onClose={() => setIsRequestModalOpen(false)}
          onRequestSubmitted={() => {
            loadData();
          }}
        />
      )}

      {/* Developer Profile Modal */}
      {isDevModalOpen && (
        <DeveloperModal onClose={() => setIsDevModalOpen(false)} />
      )}

      {/* Public Footer (Zero Admin Links) */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-400 space-y-5 pb-28 sm:pb-8 flex flex-col items-center justify-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <img 
            src="/helpaxom_badge.png" 
            alt="HELP AXOM Emblem" 
            className="w-12 h-12 object-contain drop-shadow-md" 
          />
          <div className="text-left">
            <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">HELP AXOM</h3>
            <p className="text-[11px] font-black text-cyan-400 tracking-wider uppercase mt-1 leading-none">UNITY. RELIEF. REBUILD.</p>
          </div>
        </div>

        {/* Developer Team Section */}
        <div className="flex flex-col items-center gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-sm w-full shadow-md">
          <div 
            onClick={() => setIsDevModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer group w-full"
          >
            <img 
              src="/developer.png" 
              alt="Raphul Ali" 
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 group-hover:scale-105 transition-transform shrink-0" 
            />
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">Raphul Ali</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase shrink-0">
                  Developer
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-300">Tinsukia, Assam</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full pt-2 border-t border-slate-800 text-xs">
            <a 
              href="https://github.com/raphul-ali" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-white flex items-center gap-1.5 font-bold underline transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              <span>GitHub</span>
            </a>
            <span className="text-slate-700">|</span>
            <a 
              href="https://www.instagram.com/r_aphul/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-pink-400 flex items-center gap-1.5 font-bold underline transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        <p className="text-slate-500 text-[11px]">{i18nService.t('copyright', '© 2026 HELP AXOM. Unity. Relief. Rebuild. Independent Community Network.')}</p>
      </footer>

      {/* Native Mobile Bottom Navigation Dock */}
      <MobileBottomDock
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openRescueModal={openRescueModal}
        openSupplyModal={openSupplyModal}
        urgentCount={pendingCount}
        requestsCount={victimRequests.length}
        currentAuth={currentAuth}
      />

    </div>
  );
}
