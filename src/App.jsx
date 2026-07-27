import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ASDMAHelplines from './components/ASDMAHelplines';
import NGODashboard from './components/NGODashboard';
import InteractiveMap from './components/InteractiveMap';
import NGODirectory from './components/NGODirectory';
import VolunteerDirectory from './components/VolunteerDirectory';
import NearestMedicals from './components/NearestMedicals';
import NearestResponders from './components/NearestResponders';
import FreeHostingGuide from './components/FreeHostingGuide';
import VictimRequestForm from './components/VictimRequestForm';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import FloatingSOSButton from './components/FloatingSOSButton';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalUrgentMode, setModalUrgentMode] = useState(true);
  
  const [victimRequests, setVictimRequests] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [currentAuth, setCurrentAuth] = useState(authService.getCurrentUser());

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
    loadData();

    const handleDataChanged = () => loadData();
    const handleAuthChanged = () => {
      const auth = authService.getCurrentUser();
      setCurrentAuth(auth);
      if (auth.role === 'ADMIN') {
        setActiveTab('admin');
      }
    };

    window.addEventListener('flood_data_changed', handleDataChanged);
    window.addEventListener('flood_auth_changed', handleAuthChanged);
    
    return () => {
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
    if (activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  };

  const urgentCount = victimRequests.filter(req => req.isUrgentRescue && req.status !== 'Rescued').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {/* Fixed Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

        {/* Admin Manual Verification Control Room (Visible ONLY when logged in as Admin) */}
        {activeTab === 'admin' && currentAuth.role === 'ADMIN' && (
          <AdminDashboard onDataUpdated={() => loadData()} />
        )}

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

        {activeTab === 'responders' && (
          <NearestResponders />
        )}

        {activeTab === 'medicals' && (
          <NearestMedicals />
        )}

        {activeTab === 'ngos' && (
          <NGODirectory 
            ngos={ngos} 
          />
        )}

        {activeTab === 'volunteers' && (
          <VolunteerDirectory 
            volunteers={volunteers} 
          />
        )}

        {activeTab === 'hosting-guide' && (
          <FreeHostingGuide />
        )}

      </main>

      {/* Mobile Floating SOS Button */}
      <FloatingSOSButton openModal={openRescueModal} />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
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

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-2 pb-20 sm:pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <button onClick={() => storageService.resetToDefaultSeed()} className="hover:text-amber-400 font-semibold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Sample Data
          </button>
          <span>|</span>
          <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-amber-400 font-semibold flex items-center gap-1">
            🔐 Officer & NGO Login Portal
          </button>
          <span>|</span>
          <span>Open-Source Assam Flood Relief Network</span>
        </div>
        <p>© 2026 Assam Flood Victims & NGO Portal. Independent Community Network.</p>
      </footer>

    </div>
  );
}
