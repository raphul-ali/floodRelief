import React, { useState, useEffect } from 'react';
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
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { RefreshCw, Lock, Key, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('NGO_LOGIN'); // 'NGO_LOGIN' | 'VOLUNTEER_LOGIN' | 'REGISTER'
  const [loginModalRegRole, setLoginModalRegRole] = useState('NGO'); // 'NGO' | 'VOLUNTEER'
  const [modalUrgentMode, setModalUrgentMode] = useState(true);
  
  const [victimRequests, setVictimRequests] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [currentAuth, setCurrentAuth] = useState(authService.getCurrentUser());

  // Secret /raphul-admin route detection
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

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
    setPendingCount(pendingReqs + pendingLogs + pendingNgos + pendingVols);
  };

  useEffect(() => {
    checkPath();
    loadData();

    const handleDataChanged = () => loadData();
    const handleAuthChanged = () => {
      const auth = authService.getCurrentUser();
      setCurrentAuth(auth);
    };

    const handlePopState = () => checkPath();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('flood_data_changed', handleDataChanged);
    window.addEventListener('flood_auth_changed', handleAuthChanged);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('flood_data_changed', handleDataChanged);
      window.removeEventListener('flood_auth_changed', handleAuthChanged);
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
                className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-xl text-xs font-black border border-red-500/40 shrink-0 min-h-[38px] flex items-center justify-center"
              >
                Logout Super Admin
              </button>
            </div>

            <AdminDashboard onDataUpdated={() => loadData()} />
          </div>
        ) : (
          /* Secret Mobile-Optimized Admin Login Screen */
          <div className="w-[94vw] max-w-md mx-auto my-4 sm:my-12 bg-slate-900 border border-red-900/60 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5">
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
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    required
                  />
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
  const mainContentRef = useRef(null);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setTimeout(() => {
      if (mainContentRef.current) {
        const yOffset = -80; // Offset for sticky header
        const y = mainContentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Fixed Header Bar (Zero Admin Buttons) */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openRescueModal={openRescueModal}
        openSupplyModal={openSupplyModal}
        urgentCount={urgentCount}
        pendingCount={pendingCount}
        currentAuth={currentAuth}
        openLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Official ASDMA Emergency Helplines Notice */}
        <ASDMAHelplines />

        {/* Scroll Target Element */}
        <div ref={mainContentRef} className="scroll-mt-24" />

        {/* NGO Rescue Queue */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <NGODashboard 
              victimRequests={victimRequests} 
              ngos={ngos} 
            />
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

        {activeTab === 'ngos' && (
          <NGODirectory 
            ngos={ngos} 
            volunteers={volunteers}
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

      {/* Public Footer (Zero Admin Links) */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-2 pb-20 sm:pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <button onClick={() => storageService.resetToDefaultSeed()} className="hover:text-amber-400 font-semibold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Sample Data
          </button>
          <span>|</span>
          <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-amber-400 font-semibold flex items-center gap-1">
            🤝 Partner Portal Login
          </button>
          <span>|</span>
          <span>Open-Source Assam Flood Relief Network</span>
        </div>
        <p>© 2026 Assam Flood Victims & NGO Portal. Independent Community Network.</p>
      </footer>

    </div>
  );
}
