import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ASDMAHelplines from './components/ASDMAHelplines';
import NGODashboard from './components/NGODashboard';
import InteractiveMap from './components/InteractiveMap';
import NGODirectory from './components/NGODirectory';
import VolunteerDirectory from './components/VolunteerDirectory';
import NearestMedicals from './components/NearestMedicals';
import FreeHostingGuide from './components/FreeHostingGuide';
import TransportDirectory from './components/TransportDirectory';
import CampaignsList from './components/CampaignsList';
import VictimRequestForm from './components/VictimRequestForm';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import FloatingSOSButton from './components/FloatingSOSButton';
import EmergencyServices from './components/EmergencyServices';
import PublicRequestsList from './components/PublicRequestsList';
import MobileBottomDock from './components/MobileBottomDock';
import DeveloperModal from './components/DeveloperModal';
import GuestHome from './components/GuestHome';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { i18nService, LANGUAGES } from './services/i18nService';
import { RefreshCw, Lock, Key, Mail, ShieldCheck, AlertTriangle, Eye, EyeOff, LogOut, MapPin, Code, Github, Instagram } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(authService.getCurrentUser().role === 'GUEST' ? 'home' : 'dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER'
  const [loginModalRegRole, setLoginModalRegRole] = useState('NGO'); // 'NGO' | 'VOLUNTEER'
  const [modalUrgentMode, setModalUrgentMode] = useState(true);
  
  const [victimRequests, setVictimRequests] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
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

    if (!isSecretPath) {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'dashboard', 'map', 'emergency', 'public_requests', 'ngos', 'transport', 'campaigns'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash && authService.getCurrentUser().role === 'GUEST') {
        setActiveTab('home');
      }
    }
  };

  const loadData = () => {
    setVictimRequests(storageService.getVictimRequests());
    setDeliveryLogs(storageService.getDeliveryLogs());
    setNgos(storageService.getNGOs());
    setVolunteers(storageService.getVolunteers());
    setCampaigns(storageService.getCampaigns());

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
        setActiveTab('home');
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
    setActiveTab('public_requests');
  };

  const handleSecretAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      await authService.loginAdmin(adminEmail, adminPassword);
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
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-8 space-y-6">
        
        {/* Private Top Bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shrink-0 shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xs sm:text-lg font-black text-slate-900 leading-tight">CONTROL ROOM (/raphul-admin)</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Authorized Super Admin Access</p>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.pathname = '/';
              window.location.hash = '';
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] sm:text-xs font-bold border border-slate-200 shrink-0 min-h-[38px] flex items-center justify-center shadow-sm"
          >
            &larr; Public Site
          </a>
        </div>

        {/* If logged in as Super Admin */}
        {currentAuth.role === 'ADMIN' ? (
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-xs font-bold text-slate-700">
                  Super Admin Session: <strong className="text-blue-600 font-black">raphulali@gmail.com</strong>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 shrink-0 min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                title="Logout of Admin session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Logout</span>
              </button>
            </div>

            <AdminDashboard onDataUpdated={() => loadData()} />
          </div>
        ) : (
          /* Secret Mobile-Optimized Admin Login Screen */
          <div className="w-[94vw] max-w-md mx-auto mt-4 mb-24 sm:my-12 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Super Admin Portal</h2>
              <p className="text-xs text-slate-500">
                Authorized Login for <span className="text-blue-600 font-bold">Raphul Ali</span>
              </p>
            </div>

            {adminLoginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleSecretAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="raphulali@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Super Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 min-h-[44px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg focus:outline-none"
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
    window.location.hash = tabName;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 10);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
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
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-2 space-y-3`}>
        
        


        {/* Official ASDMA Emergency Helplines Notice (Only shown for Guest citizens) */}
        {currentAuth.role === 'GUEST' && activeTab === 'home' && <ASDMAHelplines />}

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

        {activeTab === 'home' && (
          <GuestHome 
            victimRequests={victimRequests} 
            ngos={ngos}
            volunteers={volunteers}
            campaigns={campaigns}
            setActiveTab={handleTabChange}
          />
        )}

        {activeTab === 'public_requests' && (
          <PublicRequestsList victimRequests={victimRequests} deliveryLogs={deliveryLogs} isLoading={isLoadingData} />
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

        {activeTab === 'transport' && (
          <TransportDirectory 
            volunteers={volunteers} 
            openLoginModal={(mode = 'REGISTER', regRole = 'VOLUNTEER') => {
              setLoginModalMode(mode);
              setLoginModalRegRole(regRole);
              setIsLoginModalOpen(true);
            }}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsList campaigns={campaigns} />
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

      {/* Footer — minimal (Only on homepage) */}
      {activeTab === 'home' && (
        <footer className="bg-[#111827] border-t border-[#1f2937] pb-24 sm:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
  
            {/* Brand & Copyright */}
            <div className="flex items-center gap-3">
              <img src="/helpaxom_badge.png" alt="HELP AXOM" className="w-5 h-5 object-contain opacity-80" />
              <p className="text-[10px] text-[#6b7280]">
                © 2026 HELP AXOM · Independent Community Network
              </p>
            </div>

            {/* Language & Socials */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => i18nService.setLanguage(l.code)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      i18nService.getLanguage() === l.code
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-[#374151] text-[#6b7280] hover:text-[#d1d5db]'
                    }`}
                  >
                    {l.code === 'en' ? 'EN' : l.native}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 border-l border-[#374151] pl-4">
                <a href="https://github.com/raphul-ali" target="_blank" rel="noopener noreferrer" className="text-[#6b7280] hover:text-white transition-colors">
                  <Github className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.instagram.com/r_aphul/" target="_blank" rel="noopener noreferrer" className="text-[#6b7280] hover:text-white transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </footer>
      )}



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
