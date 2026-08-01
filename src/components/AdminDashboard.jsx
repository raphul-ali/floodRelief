import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, MessageSquare, Phone, CheckCircle2, XCircle, 
  Search, RefreshCw, Lock, Key, Clock, Package, HeartHandshake, UserCheck, AlertTriangle, ExternalLink, Bell, Edit2, Save, X,
  User, Users, ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import ExpandableNotes from './ExpandableNotes';

export default function AdminDashboard({ onDataUpdated }) {
  const [activeQueueTab, setActiveQueueTab] = useState('sos'); // 'sos' | 'deliveries' | 'ngos' | 'volunteers' | 'recovery' | 'users'
  const [viewMode, setViewMode] = useState('PENDING'); // 'PENDING' | 'ALL_LIVE'
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [pendingRecovery, setPendingRecovery] = useState([]);

  // All live network records state
  const [allRequests, setAllRequests] = useState([]);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [allNgos, setAllNgos] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // User Directory Pagination & Filter State
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(5);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'NGO' | 'VOLUNTEER'
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'PENDING'
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingSosId, setEditingSosId] = useState(null);
  const [editSosData, setEditSosData] = useState({});

  const loadAdminData = () => {
    setPendingRequests(storageService.getPendingVictimRequests());
    setPendingDeliveries(storageService.getPendingDeliveryLogs());
    setPendingNgos(storageService.getPendingNGOs());
    setPendingVolunteers(storageService.getPendingVolunteers());
    setPendingRecovery(storageService.getAccountRecoveryRequests(true));

    setAllRequests(storageService.getVictimRequests(true));
    setAllDeliveries(storageService.getDeliveryLogs(true));
    setAllNgos(storageService.getNGOs(true));
    setAllVolunteers(storageService.getVolunteers(true));
    setAllUsers(storageService.getAllUsers());
  };

  useEffect(() => {
    loadAdminData();
    const handleDataChanged = () => loadAdminData();
    window.addEventListener('flood_data_changed', handleDataChanged);
    return () => window.removeEventListener('flood_data_changed', handleDataChanged);
  }, []);

  const handleApproveSos = (id) => {
    storageService.verifyVictimRequest(id, "Super Admin");
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleRejectSos = (id) => {
    if (window.confirm("Are you sure you want to reject and delete this SOS request?")) {
      storageService.rejectVictimRequest(id);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  const handleEditSos = (req) => {
    setEditingSosId(req.id);
    setEditSosData({
      ...req,
      malesCount: req.malesCount || 0,
      femalesCount: req.femalesCount || 0,
      childrenCount: req.childrenCount || 0,
      familiesCount: req.familiesCount || 0,
    });
  };

  const handleSaveSos = (e) => {
    e.preventDefault();
    
    // Recalculate total people
    const totalPeople = (parseInt(editSosData.malesCount) || 0) + 
                       (parseInt(editSosData.femalesCount) || 0) + 
                       (parseInt(editSosData.childrenCount) || 0);
                       
    const payload = {
      ...editSosData,
      peopleCount: totalPeople,
    };
    
    storageService.editVictimRequest(editingSosId, payload);
    setEditingSosId(null);
    setEditSosData({});
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleApproveDelivery = (logId) => {
    storageService.verifyDeliveryLog(logId, "Super Admin");
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleRejectDelivery = (logId) => {
    if (window.confirm("Are you sure you want to reject this delivery log?")) {
      storageService.rejectDeliveryLog(logId);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  const handleApproveNgo = (id) => {
    storageService.verifyNGO(id);
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleRejectNgo = (id) => {
    if (window.confirm("Reject this NGO registration?")) {
      storageService.rejectNGO(id);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  const handleApproveVol = (id) => {
    storageService.verifyVolunteer(id);
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleRejectVol = (id) => {
    if (window.confirm("Reject this volunteer registration?")) {
      storageService.rejectVolunteer(id);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  const handleResolveRecovery = (id) => {
    storageService.resolveAccountRecoveryRequest(id, "Resolved by Super Admin");
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleDeleteRecovery = (id) => {
    if (window.confirm("Are you sure you want to delete this recovery request?")) {
      storageService.deleteAccountRecoveryRequest(id);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  const getWhatsAppRecoveryUrl = (phone, name, reqType, role, matchedAccount) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let text = `Hello ${name || 'User'}, this is Super Admin from Help Axom. Regarding your ${reqType === 'FORGOT_PASSWORD' ? 'Forgot Password' : 'Forgot Email'} request for your ${role} account:`;
    if (matchedAccount) {
      text += `\n\nRegistered Account Details:\n• Name: ${matchedAccount.name}\n• Email: ${matchedAccount.email}\n• Password: ${matchedAccount.password || 'Standard Password'}\n• Status: ${matchedAccount.verified ? 'Verified' : 'Pending Admin Verification'}`;
    } else {
      text += `\n\nPlease confirm your registered name and contact details so we can assist you.`;
    }

    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  // Pre-fill WhatsApp Verification Message
  const getWhatsAppVerifyUrl = (phone, name, reqId, type = "SOS") => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    let text = "";
    if (type === "SOS") {
      text = encodeURIComponent(
        `Hello ${name}, this is Super Admin verifying your emergency SOS request (${reqId}). Please send your exact location & geotagged photos/videos via WhatsApp to verify and publish to our live map.`
      );
    } else if (type === "DELIVERY") {
      text = encodeURIComponent(
        `Hello, this is Super Admin regarding your relief delivery log for request ${reqId}. Please share geotagged photo proof of the delivered items so we can approve your timeline log.`
      );
    } else {
      text = encodeURIComponent(
        `Hello ${name}, this is Super Admin verifying your registration (${reqId}). Please confirm your contact details.`
      );
    }

    return `https://wa.me/${formatted}?text=${text}`;
  };

  const pendingRecoveryCount = pendingRecovery.filter(r => r.status === 'PENDING').length;
  const totalPendingCount = pendingRequests.length + pendingDeliveries.length + pendingNgos.length + pendingVolunteers.length + pendingRecoveryCount;

  // Active dataset depending on viewMode
  const targetRequests = viewMode === 'ALL_LIVE' ? allRequests : pendingRequests;
  const targetDeliveries = viewMode === 'ALL_LIVE' ? allDeliveries : pendingDeliveries;
  const targetNgos = viewMode === 'ALL_LIVE' ? allNgos : pendingNgos;
  const targetVolunteers = viewMode === 'ALL_LIVE' ? allVolunteers : pendingVolunteers;

  // Filter SOS Requests
  const filteredSos = targetRequests.filter(req => {
    const matchesDistrict = selectedDistrict === 'ALL' || req.district === selectedDistrict;
    const matchesQuery = !searchQuery || 
      (req.name && req.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (req.id && req.id.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (req.phone && req.phone.includes(searchQuery));
    return matchesDistrict && matchesQuery;
  });

  // Filter Deliveries
  const filteredDeliveries = targetDeliveries.filter(log => {
    const matchesQuery = !searchQuery || 
      (log.deliveredBy && log.deliveredBy.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (log.itemsDelivered && log.itemsDelivered.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (log.logId && log.logId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  // Filter NGOs
  const filteredNgos = targetNgos.filter(ngo => {
    const matchesQuery = !searchQuery || 
      (ngo.name && ngo.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (ngo.phone && ngo.phone.includes(searchQuery)) || 
      (ngo.contactPerson && ngo.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  // Filter Volunteers
  const filteredVolunteers = targetVolunteers.filter(vol => {
    const matchesQuery = !searchQuery || 
      (vol.name && vol.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (vol.phone && vol.phone.includes(searchQuery)) || 
      (vol.roleType && vol.roleType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  // Filter All Users
  const filteredUsers = allUsers.filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.userType === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || 
      (userStatusFilter === 'VERIFIED' && u.verified) || 
      (userStatusFilter === 'PENDING' && !u.verified);
    const matchesDistrict = selectedDistrict === 'ALL' || u.district === selectedDistrict;
    const matchesQuery = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.phone && u.phone.includes(searchQuery)) || 
      (u.id && u.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesStatus && matchesDistrict && matchesQuery;
  });

  // User Pagination calculation
  const totalUserPages = Math.ceil(filteredUsers.length / userItemsPerPage) || 1;
  const safeUserCurrentPage = Math.min(Math.max(1, userCurrentPage), totalUserPages);
  const userStartIndex = (safeUserCurrentPage - 1) * userItemsPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + userItemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-3.5 sm:p-5 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/40 shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">SUPER ADMIN CONTROL ROOM</h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-semibold mt-0.5">
                Verify incoming distress signals, relief logs, NGO/Volunteer registrations & account recovery requests.
              </p>
            </div>
          </div>

          {/* View Mode Toggle Pill Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode('PENDING')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 min-h-[40px] ${
                viewMode === 'PENDING'
                  ? 'bg-red-600 text-white shadow-lg border border-red-400 animate-pulse'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>PENDING QUEUE ({totalPendingCount})</span>
            </button>

            <button
              onClick={() => setViewMode('ALL_LIVE')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 min-h-[40px] ${
                viewMode === 'ALL_LIVE'
                  ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ALL LIVE RECORDS ({allRequests.length} Requests | {allNgos.length} NGOs)</span>
            </button>
          </div>
        </div>

        {/* Supabase Cloud Connection Status Indicator */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-2 rounded-xl w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span>Supabase Cloud Database: <strong className="text-emerald-300">CONNECTED & LIVE</strong> (Global real-time sync active across all IPs & devices)</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl w-full">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>Offline Local Storage Mode: Supabase Database Not Connected.</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to hosting platform</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Queue Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pb-2 border-b border-slate-800 text-xs font-black">
        
        {/* Tab 1: SOS Requests */}
        <button
          onClick={() => setActiveQueueTab('sos')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'sos'
              ? 'bg-red-600 text-white font-black shadow-lg border border-red-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-300 shrink-0" />
          <span>{viewMode === 'ALL_LIVE' ? 'All SOS Requests' : 'Pending SOS Requests'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            targetRequests.length > 0 ? (viewMode === 'PENDING' ? 'bg-white text-red-600 animate-pulse' : 'bg-red-950 text-red-300 border border-red-800') : 'bg-slate-800 text-slate-400'
          }`}>
            {targetRequests.length}
          </span>
        </button>

        {/* Tab 2: Delivery Logs */}
        <button
          onClick={() => setActiveQueueTab('deliveries')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'deliveries'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg border border-amber-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{viewMode === 'ALL_LIVE' ? 'All Delivery Logs' : 'Pending Delivery Logs'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            targetDeliveries.length > 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
          }`}>
            {targetDeliveries.length}
          </span>
        </button>

        {/* Tab 3: NGOs */}
        <button
          onClick={() => setActiveQueueTab('ngos')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'ngos'
              ? 'bg-blue-600 text-white font-black shadow-lg border border-blue-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{viewMode === 'ALL_LIVE' ? 'Registered NGOs' : 'Pending NGOs'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            targetNgos.length > 0 ? 'bg-blue-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
          }`}>
            {targetNgos.length}
          </span>
        </button>

        {/* Tab 4: Volunteers */}
        <button
          onClick={() => setActiveQueueTab('volunteers')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'volunteers'
              ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{viewMode === 'ALL_LIVE' ? 'All Volunteers' : 'Pending Volunteers'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            targetVolunteers.length > 0 ? 'bg-purple-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
          }`}>
            {targetVolunteers.length}
          </span>
        </button>

        {/* Tab 5: Account Recovery Requests */}
        <button
          onClick={() => setActiveQueueTab('recovery')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'recovery'
              ? 'bg-cyan-600 text-white font-black shadow-lg border border-cyan-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Account Recovery</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            pendingRecoveryCount > 0 ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {pendingRecoveryCount}
          </span>
        </button>

        {/* Tab 6: User Directory with Pagination */}
        <button
          onClick={() => setActiveQueueTab('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'users'
              ? 'bg-emerald-600 text-white font-black shadow-lg border border-emerald-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Directory</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {allUsers.length}
          </span>
        </button>

      </div>

      {/* Global Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, district..."
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full min-h-[36px]"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none w-full sm:w-auto min-h-[36px]"
          >
            <option value="ALL">All Districts</option>
            {ASSAM_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg border border-slate-700 transition-colors flex items-center justify-center min-h-[36px]"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUEUE 1: PENDING SOS REQUESTS */}
      {activeQueueTab === 'sos' && (
        <div className="space-y-4">

          {filteredSos.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {viewMode === 'ALL_LIVE' ? 'No SOS Requests Match Search' : 'No Pending SOS Requests'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewMode === 'ALL_LIVE' 
                  ? 'Try adjusting district or search query filters.' 
                  : 'All incoming distress signals have been verified & published live.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSos.map(req => (
                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500/40 rounded-md">
                          {req.isUrgentRescue ? 'BOAT RESCUE' : 'RELIEF SUPPLY'}
                        </span>
                        {req.verified ? (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                            PUBLISHED LIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md animate-pulse">
                            PENDING VERIFICATION
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">{req.id}</span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">{req.name}</h3>
                      <p className="text-xs text-amber-300 font-bold">{req.district}: {req.locationName || req.villageName}</p>
                    </div>
                  </div>


                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300"><strong className="text-white">Affected:</strong> {req.familiesCount > 0 ? `${req.familiesCount} Families` : `${req.peopleCount || 1} People`}</p>
                    <p className="text-slate-300"><strong className="text-white">Phone:</strong> {req.phone}</p>
                    {req.details && <ExpandableNotes text={req.details} dark={true} className="mt-1" />}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={getWhatsAppVerifyUrl(req.phone, req.name, req.id, "SOS")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Geotag</span>
                    </a>

                    <a
                      href={`tel:${(req.phone || '').replace(/[^0-9]/g, '')}`}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-1 border border-slate-700 min-h-[44px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Victim</span>
                    </a>
                    {!req.verified && (
                      <button
                        onClick={() => handleApproveSos(req.id)}
                        className="col-span-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ APPROVE & PUBLISH LIVE</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditSos(req)}
                      className="py-2 px-3 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleRejectSos(req.id)}
                      className="py-2 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{req.verified ? "Delete" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 2: DELIVERY LOGS */}
      {activeQueueTab === 'deliveries' && (
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {viewMode === 'ALL_LIVE' ? 'No Delivery Logs Match Search' : 'No Pending Delivery Logs'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewMode === 'ALL_LIVE' ? 'Try adjusting your search terms.' : 'All relief dispatches have been audited and verified.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDeliveries.map(log => (
                <div key={log.logId} className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">
                          DISPATCH LOG #{log.logId}
                        </span>
                        {log.verified ? (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                            VERIFIED DISPATCH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md animate-pulse">
                            PENDING AUDIT
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white mt-1">Delivered by: {log.deliveredBy}</h3>
                      <p className="text-xs text-slate-300">Items: <strong className="text-amber-300">{log.itemsDelivered}</strong></p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300"><strong className="text-white">Volunteer Phone:</strong> {log.volunteerPhone}</p>
                    {log.peopleImpacted && <p className="text-slate-300"><strong className="text-white">People Impacted:</strong> {log.peopleImpacted}</p>}
                    {log.deliveryNotes && <ExpandableNotes text={log.deliveryNotes} dark={true} className="mt-1" />}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={getWhatsAppVerifyUrl(log.volunteerPhone, log.deliveredBy, log.requestId || log.logId, "DELIVERY")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Photo Proof</span>
                    </a>

                    {!log.verified ? (
                      <button
                        onClick={() => handleApproveDelivery(log.logId)}
                        className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Log</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRejectDelivery(log.logId)}
                        className="py-2.5 px-3 bg-red-950 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Remove Log</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 3: NGOS DIRECTORY */}
      {activeQueueTab === 'ngos' && (
        <div className="space-y-4">
          {filteredNgos.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {viewMode === 'ALL_LIVE' ? 'No Registered NGOs Match Search' : 'No Pending NGO Registrations'}
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNgos.map(ngo => (
                <div key={ngo.id} className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ngo.verified ? (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                            VERIFIED NGO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md animate-pulse">
                            PENDING VERIFICATION
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">{ngo.id}</span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">{ngo.name}</h3>
                      <p className="text-xs text-slate-300">Contact: <strong>{ngo.contactPerson || 'Official NGO'}</strong> ({ngo.phone})</p>
                      {ngo.email && <p className="text-xs text-amber-300 font-mono mt-0.5">{ngo.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {!ngo.verified ? (
                      <button
                        onClick={() => handleApproveNgo(ngo.id)}
                        className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve NGO</span>
                      </button>
                    ) : (
                      <a
                        href={`tel:${(ngo.phone || '').replace(/[^0-9]/g, '')}`}
                        className="py-2.5 px-3 bg-slate-800 text-emerald-300 border border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call NGO</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleRejectNgo(ngo.id)}
                      className="py-2.5 px-3 bg-red-950 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{ngo.verified ? "Revoke / Delete" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 4: VOLUNTEERS DIRECTORY */}
      {activeQueueTab === 'volunteers' && (
        <div className="space-y-4">
          {filteredVolunteers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {viewMode === 'ALL_LIVE' ? 'No Volunteer Profiles Match Search' : 'No Pending Volunteer Profiles'}
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVolunteers.map(vol => (
                <div key={vol.id} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {vol.verified ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-md">
                          ACTIVE VOLUNTEER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md animate-pulse">
                          PENDING VERIFICATION
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400">{vol.id}</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">{vol.name}</h3>
                    <p className="text-xs text-purple-300 font-bold">{vol.roleType} - {vol.phone}</p>
                    {vol.offerings && <p className="text-xs text-slate-300 mt-1">"{vol.offerings}"</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {!vol.verified ? (
                      <button
                        onClick={() => handleApproveVol(vol.id)}
                        className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Volunteer</span>
                      </button>
                    ) : (
                      <a
                        href={`tel:${(vol.phone || '').replace(/[^0-9]/g, '')}`}
                        className="py-2.5 px-3 bg-slate-800 text-purple-300 border border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Volunteer</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleRejectVol(vol.id)}
                      className="py-2.5 px-3 bg-red-950 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{vol.verified ? "Remove Volunteer" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 5: ACCOUNT RECOVERY REQUESTS */}
      {activeQueueTab === 'recovery' && (
        <div className="space-y-4">
          {/* Header & Info */}
          <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200">Account Recovery Queue ({pendingRecovery.length} Total)</span>
            </div>
          </div>

          {pendingRecovery.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Account Recovery Requests</h3>
              <p className="text-xs text-slate-400">All forgot password & forgot email requests have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRecovery
                .filter(req => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (req.name && req.name.toLowerCase().includes(q)) ||
                    (req.email && req.email.toLowerCase().includes(q)) ||
                    (req.phone && req.phone.includes(q)) ||
                    (req.id && req.id.toLowerCase().includes(q))
                  );
                })
                .map(req => {
                  const matchedAccount = storageService.findMatchingAccount(req.accountRole, req.email || req.phone || req.name);
                  const isPasswordReq = req.requestType === 'FORGOT_PASSWORD';

                  return (
                    <div key={req.id} className={`bg-slate-900 border rounded-2xl p-4 shadow-xl space-y-3 ${req.status === 'RESOLVED' ? 'border-emerald-500/30 opacity-75' : isPasswordReq ? 'border-amber-500/40' : 'border-cyan-500/40'}`}>
                      
                      {/* Request Header Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md border ${
                            isPasswordReq ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>
                            {isPasswordReq ? 'FORGOT PASSWORD' : 'FORGOT EMAIL'}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                            {req.accountRole}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{req.id}</span>
                        </div>

                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                          req.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      {/* Request Details */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Submitted Name:</span>
                          <span className="text-white font-bold">{req.name || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Contact Phone:</span>
                          <span className="text-amber-300 font-mono font-bold">{req.phone || 'N/A'}</span>
                        </div>
                        {req.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Entered Email:</span>
                            <span className="text-cyan-300 font-mono font-bold">{req.email}</span>
                          </div>
                        )}
                        {req.details && (
                          <div className="pt-1 border-t border-slate-800">
                            <ExpandableNotes text={req.details} dark={true} label="User Verification Note:" />
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 pt-1">
                          Requested: {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Matching System Account Lookup Result */}
                      {matchedAccount ? (
                        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-cyan-300 font-black flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>System Record Matched!</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {matchedAccount.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-slate-200 bg-slate-950/80 p-2 rounded-lg font-mono">
                            <p><strong>Registered Email:</strong> <span className="text-cyan-300">{matchedAccount.email}</span></p>
                            <p><strong>Password:</strong> <span className="text-amber-300">{matchedAccount.password || 'Standard Pass'}</span></p>
                            <p><strong>Registered Name:</strong> {matchedAccount.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`Email: ${matchedAccount.email} | Password: ${matchedAccount.password || 'Standard Password'}`);
                              alert("Copied user credentials to clipboard!");
                            }}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1"
                          >
                            <span>Copy Credentials</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-400">
                          No exact matching registered record found automatically. Use phone/email to verify with user.
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={getWhatsAppRecoveryUrl(req.phone, req.name, req.requestType, req.accountRole, matchedAccount)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Details</span>
                        </a>

                        {req.status === 'PENDING' ? (
                          <button
                            onClick={() => handleResolveRecovery(req.id)}
                            className="py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[44px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteRecovery(req.id)}
                            className="py-2.5 px-3 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 min-h-[44px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 6: USER DIRECTORY WITH PAGINATION */}
      {activeQueueTab === 'users' && (
        <div className="space-y-4">
          
          {/* Header & Controls Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">ALL REGISTERED USER ACCOUNTS</h3>
                  <p className="text-[11px] text-slate-400">Total {filteredUsers.length} users matching filters (Page {safeUserCurrentPage} of {totalUserPages})</p>
                </div>
              </div>

              {/* Filters for User Table */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none min-h-[38px]"
                >
                  <option value="ALL">All Roles ({allUsers.length})</option>
                  <option value="NGO">NGOs ({allUsers.filter(u=>u.userType==='NGO').length})</option>
                  <option value="VOLUNTEER">Volunteers ({allUsers.filter(u=>u.userType==='VOLUNTEER').length})</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => { setUserStatusFilter(e.target.value); setUserCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none min-h-[38px]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">Verified Only</option>
                  <option value="PENDING">Pending Only</option>
                </select>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                  <span className="font-semibold">Show:</span>
                  <select
                    value={userItemsPerPage}
                    onChange={(e) => { setUserItemsPerPage(Number(e.target.value)); setUserCurrentPage(1); }}
                    className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value={5} className="bg-slate-900 text-white">5 per page</option>
                    <option value={10} className="bg-slate-900 text-white">10 per page</option>
                    <option value={20} className="bg-slate-900 text-white">20 per page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* User Cards / List */}
          {filteredUsers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <Users className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Registered Users Found</h3>
              <p className="text-xs text-slate-400">No user accounts match your current filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedUsers.map(usr => (
                <div key={usr.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-3 transition-all">
                  
                  {/* Top Badge & Type */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl shrink-0 ${usr.userType === 'NGO' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'bg-purple-600/20 text-purple-400 border border-purple-500/40'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${usr.userType === 'NGO' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'}`}>
                            {usr.userType}
                          </span>
                          {usr.verified ? (
                            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md animate-pulse">
                              PENDING VERIFICATION
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-black text-white mt-1">{usr.name}</h4>
                        <p className="text-xs font-mono text-slate-400">ID: {usr.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details Box */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-semibold text-slate-400">Email Address:</span>
                      <span className="font-mono text-emerald-300 font-bold">{usr.email}</span>
                    </div>

                    {/* Password Credential Row (Viewable by Admin with Toggle) */}
                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" /> Password Credential:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border transition-all ${
                          visiblePasswords[usr.id] 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 tracking-widest'
                        }`}>
                          {visiblePasswords[usr.id] ? (usr.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(usr.id)}
                          className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded transition-colors"
                          title={visiblePasswords[usr.id] ? "Hide Password" : "View Password"}
                        >
                          {visiblePasswords[usr.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                      <span className="font-semibold text-slate-400">Phone Contact:</span>
                      <span className="font-semibold text-white">{usr.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                      <span className="font-semibold text-slate-400">District Zone:</span>
                      <span className="font-semibold text-amber-300">{usr.district}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!usr.verified ? (
                      <button
                        onClick={() => {
                          if (usr.userType === 'NGO') handleApproveNgo(usr.id);
                          else handleApproveVol(usr.id);
                        }}
                        className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 min-h-[42px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Account</span>
                      </button>
                    ) : (
                      <a
                        href={`tel:${(usr.phone || '').replace(/[^0-9]/g, '')}`}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 min-h-[42px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call User</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        if (usr.userType === 'NGO') handleRejectNgo(usr.id);
                        else handleRejectVol(usr.id);
                      }}
                      className="py-2.5 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[42px]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{usr.verified ? "Delete Account" : "Reject"}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls Bar */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs font-bold">
              <div className="text-slate-400">
                Showing <strong className="text-white">{userStartIndex + 1}</strong> to <strong className="text-white">{Math.min(userStartIndex + userItemsPerPage, filteredUsers.length)}</strong> of <strong className="text-emerald-400">{filteredUsers.length}</strong> registered users
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={safeUserCurrentPage <= 1}
                  onClick={() => setUserCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-white border border-slate-800 rounded-xl flex items-center gap-1 transition-all min-h-[38px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setUserCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl font-mono text-xs flex items-center justify-center transition-all ${
                        safeUserCurrentPage === page
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-lg border border-emerald-400 scale-105'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  disabled={safeUserCurrentPage >= totalUserPages}
                  onClick={() => setUserCurrentPage(prev => Math.min(totalUserPages, prev + 1))}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-white border border-slate-800 rounded-xl flex items-center gap-1 transition-all min-h-[38px]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Edit Request Modal */}
      {editingSosId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl rounded-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 bg-gradient-to-r from-amber-950 via-slate-950 to-slate-950 border-amber-800">
              <h3 className="text-sm sm:text-lg font-black text-white uppercase flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                Edit SOS Request: {editSosData.id}
              </h3>
              <button onClick={() => setEditingSosId(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSos} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Victim Name</label>
                  <input type="text" required value={editSosData.name || ''} onChange={e => setEditSosData({...editSosData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                  <input type="tel" required value={editSosData.phone || ''} onChange={e => setEditSosData({...editSosData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Village / Area</label>
                  <input type="text" required value={editSosData.villageName || ''} onChange={e => setEditSosData({...editSosData, villageName: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">District</label>
                  <select value={editSosData.district || ''} onChange={e => setEditSosData({...editSosData, district: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                    {ASSAM_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                {/* Demographics row */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Males Count</label>
                  <input type="number" min="0" value={editSosData.malesCount} onChange={e => setEditSosData({...editSosData, malesCount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Females Count</label>
                  <input type="number" min="0" value={editSosData.femalesCount} onChange={e => setEditSosData({...editSosData, femalesCount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Children Count</label>
                  <input type="number" min="0" value={editSosData.childrenCount} onChange={e => setEditSosData({...editSosData, childrenCount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Families Count</label>
                  <input type="number" min="0" value={editSosData.familiesCount} onChange={e => setEditSosData({...editSosData, familiesCount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Request Details</label>
                <textarea rows="3" value={editSosData.details || ''} onChange={e => setEditSosData({...editSosData, details: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingSosId(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-black flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
