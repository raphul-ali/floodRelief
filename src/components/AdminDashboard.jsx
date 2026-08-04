import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, MessageSquare, Phone, CheckCircle2, XCircle, 
  Search, RefreshCw, Lock, Key, Clock, Package, HeartHandshake, UserCheck, AlertTriangle, ExternalLink, Bell, Edit2, Save, X,
  User, Users, ChevronLeft, ChevronRight, Eye, EyeOff, Megaphone, Filter, MapPin, Building2, Check, Sparkles
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import ExpandableNotes from './ExpandableNotes';
import CampaignsAdmin from './CampaignsAdmin';

export default function AdminDashboard({ onDataUpdated }) {
  const [activeQueueTab, setActiveQueueTab] = useState('sos'); // 'overview' | 'sos' | 'deliveries' | 'ngos' | 'volunteers' | 'recovery' | 'users' | 'helplines' | 'campaigns'
  const [viewMode, setViewMode] = useState('PENDING'); // 'PENDING' | 'ALL_LIVE'
  
  // Section Filter Chips States
  const [sosChipFilter, setSosChipFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'BOAT' | 'SUPPLY' | 'PUBLISHED'
  const [deliveryChipFilter, setDeliveryChipFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'VERIFIED'
  const [ngoChipFilter, setNgoChipFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'NGO' | 'DONOR' | 'VERIFIED'
  const [volChipFilter, setVolChipFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'BOAT' | 'TRANSPORT' | 'MEDICAL' | 'VERIFIED'
  const [recoveryChipFilter, setRecoveryChipFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'PASSWORD' | 'EMAIL' | 'RESOLVED'
  const [helplineChipFilter, setHelplineChipFilter] = useState('ALL'); // 'ALL' | 'CONTROL_ROOM' | 'TOLL_FREE'

  // Data states
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [pendingRecovery, setPendingRecovery] = useState([]);

  const [allRequests, setAllRequests] = useState([]);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [allNgos, setAllNgos] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [helplinesList, setHelplinesList] = useState([]);

  // Helpline Form State
  const [newHelplineLabel, setNewHelplineLabel] = useState('');
  const [newHelplinePhone, setNewHelplinePhone] = useState('');
  const [newHelplineOrder, setNewHelplineOrder] = useState('');
  const [editingHelplineId, setEditingHelplineId] = useState(null);
  const [editHelplineLabel, setEditHelplineLabel] = useState('');
  const [editHelplinePhone, setEditHelplinePhone] = useState('');
  const [editHelplineOrder, setEditHelplineOrder] = useState('');

  // Pagination States for All Sections
  const [sosCurrentPage, setSosCurrentPage] = useState(1);
  const [sosItemsPerPage, setSosItemsPerPage] = useState(6);

  const [deliveryCurrentPage, setDeliveryCurrentPage] = useState(1);
  const [deliveryItemsPerPage, setDeliveryItemsPerPage] = useState(6);

  const [ngoCurrentPage, setNgoCurrentPage] = useState(1);
  const [ngoItemsPerPage, setNgoItemsPerPage] = useState(6);

  const [volCurrentPage, setVolCurrentPage] = useState(1);
  const [volItemsPerPage, setVolItemsPerPage] = useState(6);

  const [recoveryCurrentPage, setRecoveryCurrentPage] = useState(1);
  const [recoveryItemsPerPage, setRecoveryItemsPerPage] = useState(6);

  // User Directory Pagination & Filter State
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(6);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'NGO' | 'VOLUNTEER'
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'PENDING'
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingSosId, setEditingSosId] = useState(null);
  const [editSosData, setEditSosData] = useState({});

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const loadAdminData = () => {
    setPendingRequests(storageService.getPendingVictimRequests() || []);
    setPendingDeliveries(storageService.getPendingDeliveryLogs() || []);
    setPendingNgos(storageService.getPendingNGOs() || []);
    setPendingVolunteers(storageService.getPendingVolunteers() || []);
    setPendingRecovery(storageService.getAccountRecoveryRequests(true) || []);

    setAllRequests(storageService.getVictimRequests(true) || []);
    setAllDeliveries(storageService.getDeliveryLogs(true) || []);
    setAllNgos(storageService.getNGOs(true) || []);
    setAllVolunteers(storageService.getVolunteers(true) || []);
    setAllUsers(storageService.getAllUsers() || []);
    setHelplinesList(storageService.getHelplineNumbers() || []);
  };

  useEffect(() => {
    loadAdminData();
    const handleDataChanged = () => loadAdminData();
    window.addEventListener('flood_data_changed', handleDataChanged);
    return () => window.removeEventListener('flood_data_changed', handleDataChanged);
  }, []);

  // Handlers
  const handleAddHelpline = async (e) => {
    e.preventDefault();
    if (!newHelplineLabel.trim() || !newHelplinePhone.trim()) {
      alert("Please fill in both Control Room name and Phone Number.");
      return;
    }
    await storageService.addHelplineNumber({
      label: newHelplineLabel,
      phone_number: newHelplinePhone,
      sort_order: newHelplineOrder ? parseInt(newHelplineOrder) : helplinesList.length + 1
    });
    setNewHelplineLabel('');
    setNewHelplinePhone('');
    setNewHelplineOrder('');
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleStartEditHelpline = (item) => {
    setEditingHelplineId(item.id);
    setEditHelplineLabel(item.label || '');
    setEditHelplinePhone(item.phone_number || '');
    setEditHelplineOrder(item.sort_order ?? 0);
  };

  const handleSaveEditHelpline = async (e) => {
    e.preventDefault();
    if (!editingHelplineId) return;
    await storageService.updateHelplineNumber(editingHelplineId, {
      label: editHelplineLabel,
      phone_number: editHelplinePhone,
      sort_order: parseInt(editHelplineOrder) || 0
    });
    setEditingHelplineId(null);
    loadAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleDeleteHelpline = async (id, label) => {
    if (window.confirm(`Are you sure you want to delete helpline: "${label}"?`)) {
      await storageService.deleteHelplineNumber(id);
      loadAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

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
    const totalPeople = (parseInt(editSosData.malesCount) || 0) + 
                       (parseInt(editSosData.femalesCount) || 0) + 
                       (parseInt(editSosData.childrenCount) || 0);
    const payload = { ...editSosData, peopleCount: totalPeople };
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
    let text = `Hello ${name || 'User'}, this is Super Admin from Help Axom regarding your ${reqType === 'FORGOT_PASSWORD' ? 'Password Reset' : 'Email Recovery'} request:`;
    if (matchedAccount) {
      text += `\n\nRegistered Account:\n• Name: ${matchedAccount.name}\n• Email: ${matchedAccount.email}\n• Password: ${matchedAccount.password || 'Default'}`;
    } else {
      text += `\n\nPlease confirm your registered details so we can assist you.`;
    }
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppVerifyUrl = (phone, name, reqId, type = "SOS") => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    let text = type === "SOS" 
      ? `Hello ${name}, this is Super Admin verifying your emergency SOS request (${reqId}). Please reply with geotagged photo/location.`
      : `Hello ${name}, this is Super Admin verifying your registration. Please confirm your details.`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  const pendingRecoveryCount = (pendingRecovery || []).filter(r => r && r.status === 'PENDING').length;
  const totalPendingCount = (pendingRequests || []).length + (pendingDeliveries || []).length + (pendingNgos || []).length + (pendingVolunteers || []).length + pendingRecoveryCount;

  const targetRequests = (viewMode === 'ALL_LIVE' ? allRequests : pendingRequests) || [];
  const targetDeliveries = (viewMode === 'ALL_LIVE' ? allDeliveries : pendingDeliveries) || [];
  const targetNgos = (viewMode === 'ALL_LIVE' ? allNgos : pendingNgos) || [];
  const targetVolunteers = (viewMode === 'ALL_LIVE' ? allVolunteers : pendingVolunteers) || [];

  // Filtered Datasets
  const filteredSos = targetRequests.filter(req => {
    const matchesDistrict = selectedDistrict === 'ALL' || req.district === selectedDistrict;
    const matchesQuery = !searchQuery || 
      (req.name && req.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (req.id && req.id.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (req.phone && req.phone.includes(searchQuery));

    let matchesChip = true;
    if (sosChipFilter === 'PENDING') matchesChip = !req.verified;
    else if (sosChipFilter === 'PUBLISHED') matchesChip = req.verified;
    else if (sosChipFilter === 'BOAT') matchesChip = req.isUrgentRescue;
    else if (sosChipFilter === 'SUPPLY') matchesChip = !req.isUrgentRescue;

    return matchesDistrict && matchesQuery && matchesChip;
  });

  const filteredDeliveries = targetDeliveries.filter(log => {
    const matchesQuery = !searchQuery || 
      (log.deliveredBy && log.deliveredBy.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (log.itemsDelivered && log.itemsDelivered.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesChip = true;
    if (deliveryChipFilter === 'PENDING') matchesChip = !log.verified;
    else if (deliveryChipFilter === 'VERIFIED') matchesChip = log.verified;

    return matchesQuery && matchesChip;
  });

  const filteredNgos = targetNgos.filter(ngo => {
    const matchesQuery = !searchQuery || 
      (ngo.name && ngo.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (ngo.phone && ngo.phone.includes(searchQuery));

    let matchesChip = true;
    if (ngoChipFilter === 'PENDING') matchesChip = !ngo.verified;
    else if (ngoChipFilter === 'VERIFIED') matchesChip = ngo.verified;
    else if (ngoChipFilter === 'DONOR') matchesChip = ngo.ngoType && ngo.ngoType.includes('Donor');
    else if (ngoChipFilter === 'NGO') matchesChip = !ngo.ngoType || ngo.ngoType.includes('Registered NGO');

    return matchesQuery && matchesChip;
  });

  const filteredVolunteers = targetVolunteers.filter(vol => {
    const matchesQuery = !searchQuery || 
      (vol.name && vol.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (vol.phone && vol.phone.includes(searchQuery));

    let matchesChip = true;
    if (volChipFilter === 'PENDING') matchesChip = !vol.verified;
    else if (volChipFilter === 'VERIFIED') matchesChip = vol.verified;
    else if (volChipFilter === 'BOAT') matchesChip = vol.roleType && vol.roleType.toLowerCase().includes('boat');
    else if (volChipFilter === 'TRANSPORT') matchesChip = vol.roleType && (vol.roleType.toLowerCase().includes('car') || vol.roleType.toLowerCase().includes('transport'));
    else if (volChipFilter === 'MEDICAL') matchesChip = vol.roleType && vol.roleType.toLowerCase().includes('medical');

    return matchesQuery && matchesChip;
  });

  const filteredRecovery = (pendingRecovery || []).filter(r => {
    let matchesChip = true;
    if (recoveryChipFilter === 'PENDING') matchesChip = r.status === 'PENDING';
    else if (recoveryChipFilter === 'RESOLVED') matchesChip = r.status === 'RESOLVED';
    else if (recoveryChipFilter === 'PASSWORD') matchesChip = r.requestType === 'FORGOT_PASSWORD';
    else if (recoveryChipFilter === 'EMAIL') matchesChip = r.requestType === 'FORGOT_EMAIL';
    return matchesChip;
  });

  const filteredUsers = (allUsers || []).filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.userType === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || 
      (userStatusFilter === 'VERIFIED' && u.verified) || 
      (userStatusFilter === 'PENDING' && !u.verified);
    const matchesDistrict = selectedDistrict === 'ALL' || u.district === selectedDistrict;
    const matchesQuery = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.phone && u.phone.includes(searchQuery));
    return matchesRole && matchesStatus && matchesDistrict && matchesQuery;
  });

  // Pagination Computations
  const totalSosPages = Math.ceil(filteredSos.length / sosItemsPerPage) || 1;
  const safeSosPage = Math.min(Math.max(1, sosCurrentPage), totalSosPages);
  const paginatedSos = filteredSos.slice((safeSosPage - 1) * sosItemsPerPage, safeSosPage * sosItemsPerPage);

  const totalDeliveryPages = Math.ceil(filteredDeliveries.length / deliveryItemsPerPage) || 1;
  const safeDeliveryPage = Math.min(Math.max(1, deliveryCurrentPage), totalDeliveryPages);
  const paginatedDeliveries = filteredDeliveries.slice((safeDeliveryPage - 1) * deliveryItemsPerPage, safeDeliveryPage * deliveryItemsPerPage);

  const totalNgoPages = Math.ceil(filteredNgos.length / ngoItemsPerPage) || 1;
  const safeNgoPage = Math.min(Math.max(1, ngoCurrentPage), totalNgoPages);
  const paginatedNgos = filteredNgos.slice((safeNgoPage - 1) * ngoItemsPerPage, safeNgoPage * ngoItemsPerPage);

  const totalVolPages = Math.ceil(filteredVolunteers.length / volItemsPerPage) || 1;
  const safeVolPage = Math.min(Math.max(1, volCurrentPage), totalVolPages);
  const paginatedVolunteers = filteredVolunteers.slice((safeVolPage - 1) * volItemsPerPage, safeVolPage * volItemsPerPage);

  const totalRecoveryPages = Math.ceil(filteredRecovery.length / recoveryItemsPerPage) || 1;
  const safeRecoveryPage = Math.min(Math.max(1, recoveryCurrentPage), totalRecoveryPages);
  const paginatedRecovery = filteredRecovery.slice((safeRecoveryPage - 1) * recoveryItemsPerPage, safeRecoveryPage * recoveryItemsPerPage);

  const totalUserPages = Math.ceil(filteredUsers.length / userItemsPerPage) || 1;
  const safeUserCurrentPage = Math.min(Math.max(1, userCurrentPage), totalUserPages);
  const userStartIndex = (safeUserCurrentPage - 1) * userItemsPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + userItemsPerPage);

  const sidebarNavItems = [
    { id: 'sos', label: 'SOS Requests', icon: ShieldAlert, count: (pendingRequests || []).length, color: 'text-red-600 bg-red-50' },
    { id: 'deliveries', label: 'Relief Logs', icon: Package, count: (pendingDeliveries || []).length, color: 'text-amber-600 bg-amber-50' },
    { id: 'ngos', label: 'NGO Partners', icon: HeartHandshake, count: (pendingNgos || []).length, color: 'text-blue-600 bg-blue-50' },
    { id: 'volunteers', label: 'Relief Helpers', icon: UserCheck, count: (pendingVolunteers || []).length, color: 'text-purple-600 bg-purple-50' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: null },
    { id: 'recovery', label: 'Account Recovery', icon: Key, count: pendingRecoveryCount, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'users', label: 'User Directory', icon: Users, count: (allUsers || []).length, color: 'text-slate-600 bg-slate-100' },
    { id: 'helplines', label: 'Control Rooms', icon: Phone, count: (helplinesList || []).length, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[85vh] bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden shadow-xl text-slate-900 font-sans">
      
      {/* ── SIDEBAR NAVIGATION ────────────────────────────────────────── */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">Super Admin</h2>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-slate-500">CMS Control</span>
                </div>
              </div>
            </div>

            <button 
              onClick={loadAdminData}
              title="Refresh Data"
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('PENDING')}
              className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                viewMode === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Needs Action ({totalPendingCount})
            </button>
            <button
              onClick={() => setViewMode('ALL_LIVE')}
              className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                viewMode === 'ALL_LIVE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Directory
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">CMS Modules</p>
            {sidebarNavItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeQueueTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveQueueTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.color}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Connectivity Footer */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{isSupabaseConfigured ? 'Supabase Sync Active' : 'Local Storage Mode'}</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 p-4 sm:p-6 space-y-5 overflow-x-hidden">
        
        {/* Top Header Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 capitalize">{activeQueueTab.replace('_', ' ')} Management</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Live Control
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage, filter, verify, and publish relief data across districts.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSosCurrentPage(1); setNgoCurrentPage(1); setVolCurrentPage(1); }}
                placeholder="Search name, phone, district..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setSosCurrentPage(1); setNgoCurrentPage(1); setVolCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Districts ({ASSAM_DISTRICTS.length})</option>
              {ASSAM_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ══ MODULE 1: SOS REQUESTS ════════════════════════════════════ */}
        {activeQueueTab === 'sos' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>

              {[
                { id: 'ALL', label: `All SOS (${targetRequests.length})` },
                { id: 'PENDING', label: `⚠️ Pending Approval (${targetRequests.filter(r => !r.verified).length})` },
                { id: 'BOAT', label: `🚤 Boat Rescue (${targetRequests.filter(r => r.isUrgentRescue).length})` },
                { id: 'SUPPLY', label: `📦 Relief Supply (${targetRequests.filter(r => !r.isUrgentRescue).length})` },
                { id: 'PUBLISHED', label: `✓ Published Live (${targetRequests.filter(r => r.verified).length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => { setSosChipFilter(chip.id); setSosCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    sosChipFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* SOS CARDS GRID */}
            {filteredSos.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No SOS Requests Found</h3>
                <p className="text-xs text-slate-500">No requests match the selected chip or district filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedSos.map(req => (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            req.isUrgentRescue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {req.isUrgentRescue ? '🚤 Boat Rescue' : '📦 Supply Request'}
                          </span>

                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            req.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {req.verified ? '✓ Live' : '⏳ Pending'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">ID: {req.id}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900 leading-tight">{req.name}</h3>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{req.district}: {req.locationName || req.villageName}</span>
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <p className="text-slate-700"><strong className="text-slate-900">Impacted:</strong> {req.familiesCount > 0 ? `${req.familiesCount} Families` : `${req.peopleCount || 1} People`}</p>
                        <p className="text-slate-700"><strong className="text-slate-900">Phone:</strong> {req.phone}</p>
                        {req.details && <ExpandableNotes text={req.details} dark={false} className="mt-1" />}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <a
                          href={getWhatsAppVerifyUrl(req.phone, req.name, req.id, "SOS")}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${(req.phone || '').replace(/[^0-9]/g, '')}`}
                          className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={() => handleEditSos(req)}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleRejectSos(req.id)}
                          className="px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        {!req.verified && (
                          <button
                            onClick={() => handleApproveSos(req.id)}
                            className="col-span-2 sm:col-span-4 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Publish Live</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION CONTROL BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                  <span className="font-bold text-slate-700">
                    Page {safeSosPage} of {totalSosPages} ({filteredSos.length} Total Requests)
                  </span>
                  <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                    <button
                      disabled={safeSosPage <= 1}
                      onClick={() => setSosCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      disabled={safeSosPage >= totalSosPages}
                      onClick={() => setSosCurrentPage(prev => Math.min(totalSosPages, prev + 1))}
                      className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ══ MODULE 2: RELIEF DELIVERIES ═══════════════════════════════ */}
        {activeQueueTab === 'deliveries' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Deliveries (${targetDeliveries.length})` },
                { id: 'PENDING', label: `⏳ Pending Verification (${targetDeliveries.filter(d => !d.verified).length})` },
                { id: 'VERIFIED', label: `✓ Verified Logs (${targetDeliveries.filter(d => d.verified).length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => { setDeliveryChipFilter(chip.id); setDeliveryCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    deliveryChipFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* DELIVERY CARDS */}
            {filteredDeliveries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Delivery Logs Found</h3>
                <p className="text-xs text-slate-500">No delivery logs match the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedDeliveries.map(log => (
                    <div key={log.logId || log.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          log.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {log.verified ? '✓ Verified' : '⏳ Pending Proof'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Log #{log.logId || log.id}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{log.deliveredBy || log.recipientName}</h3>
                        <p className="text-xs text-slate-500">Items: {log.itemsDelivered}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        {!log.verified && (
                          <button
                            onClick={() => handleApproveDelivery(log.logId || log.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                          >
                            Approve Log
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectDelivery(log.logId || log.id)}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                  <span className="font-bold text-slate-700">Page {safeDeliveryPage} of {totalDeliveryPages} ({filteredDeliveries.length} Logs)</span>
                  <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                    <button disabled={safeDeliveryPage <= 1} onClick={() => setDeliveryCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Previous</button>
                    <button disabled={safeDeliveryPage >= totalDeliveryPages} onClick={() => setDeliveryCurrentPage(p => Math.min(totalDeliveryPages, p + 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MODULE 3: NGOS & ORGANIZATIONS ═══════════════════════════ */}
        {activeQueueTab === 'ngos' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Partners (${targetNgos.length})` },
                { id: 'PENDING', label: `⏳ Pending Approval (${targetNgos.filter(n => !n.verified).length})` },
                { id: 'NGO', label: `🏢 Registered NGOs (${targetNgos.filter(n => !n.ngoType || n.ngoType.includes('Registered NGO')).length})` },
                { id: 'DONOR', label: `🍲 Food Donors (${targetNgos.filter(n => n.ngoType && n.ngoType.includes('Donor')).length})` },
                { id: 'VERIFIED', label: `✓ Verified Partners (${targetNgos.filter(n => n.verified).length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => { setNgoChipFilter(chip.id); setNgoCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    ngoChipFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* NGO CARDS */}
            {filteredNgos.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No NGOs Found</h3>
                <p className="text-xs text-slate-500">No registered NGOs match the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedNgos.map(ngo => (
                    <div key={ngo.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          ngo.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ngo.verified ? '✓ Verified NGO' : '⏳ Pending Verification'}
                        </span>
                        <span className="text-xs text-slate-500">{ngo.ngoType || 'NGO'}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900">{ngo.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Contact: {ngo.contactPerson || 'N/A'} • {ngo.phone}</p>
                        <p className="text-xs text-slate-500">Email: {ngo.email || 'N/A'}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        {!ngo.verified && (
                          <button
                            onClick={() => handleApproveNgo(ngo.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                          >
                            Approve NGO
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectNgo(ngo.id)}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                  <span className="font-bold text-slate-700">Page {safeNgoPage} of {totalNgoPages} ({filteredNgos.length} Partners)</span>
                  <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                    <button disabled={safeNgoPage <= 1} onClick={() => setNgoCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Previous</button>
                    <button disabled={safeNgoPage >= totalNgoPages} onClick={() => setNgoCurrentPage(p => Math.min(totalNgoPages, p + 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MODULE 4: RELIEF VOLUNTEERS ═══════════════════════════════ */}
        {activeQueueTab === 'volunteers' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Helpers (${targetVolunteers.length})` },
                { id: 'PENDING', label: `⏳ Pending Roster (${targetVolunteers.filter(v => !v.verified).length})` },
                { id: 'BOAT', label: `🚤 Boat Service (${targetVolunteers.filter(v => v.roleType && v.roleType.toLowerCase().includes('boat')).length})` },
                { id: 'TRANSPORT', label: `🚙 4x4 / Transport (${targetVolunteers.filter(v => v.roleType && (v.roleType.toLowerCase().includes('car') || v.roleType.toLowerCase().includes('transport'))).length})` },
                { id: 'MEDICAL', label: `🩺 Medical (${targetVolunteers.filter(v => v.roleType && v.roleType.toLowerCase().includes('medical')).length})` },
                { id: 'VERIFIED', label: `✓ Verified (${targetVolunteers.filter(v => v.verified).length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => { setVolChipFilter(chip.id); setVolCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    volChipFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* VOLUNTEER CARDS */}
            {filteredVolunteers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Volunteers Found</h3>
                <p className="text-xs text-slate-500">No relief volunteers match the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedVolunteers.map(vol => (
                    <div key={vol.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          vol.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {vol.verified ? '✓ Verified Helper' : '⏳ Pending Roster'}
                        </span>
                        <span className="text-xs font-bold text-purple-600">{vol.roleType || 'Volunteer'}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900">{vol.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">District: {vol.district || 'N/A'} • Phone: {vol.phone}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        {!vol.verified && (
                          <button
                            onClick={() => handleApproveVol(vol.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                          >
                            Approve Helper
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectVol(vol.id)}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                  <span className="font-bold text-slate-700">Page {safeVolPage} of {totalVolPages} ({filteredVolunteers.length} Volunteers)</span>
                  <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                    <button disabled={safeVolPage <= 1} onClick={() => setVolCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Previous</button>
                    <button disabled={safeVolPage >= totalVolPages} onClick={() => setVolCurrentPage(p => Math.min(totalVolPages, p + 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MODULE 5: ACCOUNT RECOVERY ════════════════════════════════ */}
        {activeQueueTab === 'recovery' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Recoveries (${(pendingRecovery || []).length})` },
                { id: 'PENDING', label: `⏳ Pending Action (${(pendingRecovery || []).filter(r => r.status === 'PENDING').length})` },
                { id: 'PASSWORD', label: `🔑 Password Reset (${(pendingRecovery || []).filter(r => r.requestType === 'FORGOT_PASSWORD').length})` },
                { id: 'EMAIL', label: `✉️ Email Recovery (${(pendingRecovery || []).filter(r => r.requestType === 'FORGOT_EMAIL').length})` },
                { id: 'RESOLVED', label: `✓ Resolved (${(pendingRecovery || []).filter(r => r.status === 'RESOLVED').length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => { setRecoveryChipFilter(chip.id); setRecoveryCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    recoveryChipFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* RECOVERY CARDS */}
            {filteredRecovery.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Key className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Account Recovery Requests</h3>
                <p className="text-xs text-slate-500">No pending recovery requests match the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedRecovery.map(req => {
                    const matchedAccount = storageService.findMatchedAccount(req.accountRole, req.email, req.name, req.phone);
                    return (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {req.status === 'PENDING' ? '⏳ Action Required' : '✓ Resolved'}
                          </span>
                          <span className="text-xs font-bold text-cyan-600">{req.requestType === 'FORGOT_PASSWORD' ? 'Password Reset' : 'Email Lookup'}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900">{req.name || 'User'} ({req.accountRole})</h3>
                          <p className="text-xs text-slate-500">Registered Email: {req.email || 'N/A'} • Phone: {req.phone}</p>
                          {matchedAccount && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                              Matched Record: {matchedAccount.name} ({matchedAccount.email})
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <a
                            href={getWhatsAppRecoveryUrl(req.phone, req.name, req.requestType, req.accountRole, matchedAccount)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Recovery Info</span>
                          </a>

                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleResolveRecovery(req.id)}
                              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION BAR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                  <span className="font-bold text-slate-700">Page {safeRecoveryPage} of {totalRecoveryPages} ({filteredRecovery.length} Recovery Requests)</span>
                  <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                    <button disabled={safeRecoveryPage <= 1} onClick={() => setRecoveryCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Previous</button>
                    <button disabled={safeRecoveryPage >= totalRecoveryPages} onClick={() => setRecoveryCurrentPage(p => Math.min(totalRecoveryPages, p + 1))} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MODULE 6: USER DIRECTORY ══════════════════════════════════ */}
        {activeQueueTab === 'users' && (
          <div className="space-y-4">
            
            {/* SECTION CHIPS FILTER BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Accounts (${(allUsers || []).length})` },
                { id: 'NGO', label: `🏢 NGO Accounts (${(allUsers || []).filter(u => u.userType === 'NGO').length})` },
                { id: 'VOLUNTEER', label: `🤝 Volunteer Accounts (${(allUsers || []).filter(u => u.userType === 'VOLUNTEER').length})` },
                { id: 'VERIFIED', label: `✓ Verified (${(allUsers || []).filter(u => u.verified).length})` },
                { id: 'PENDING', label: `⏳ Pending (${(allUsers || []).filter(u => !u.verified).length})` },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setUserCurrentPage(1);
                    if (chip.id === 'ALL') { setUserRoleFilter('ALL'); setUserStatusFilter('ALL'); }
                    else if (chip.id === 'NGO' || chip.id === 'VOLUNTEER') { setUserRoleFilter(chip.id); }
                    else if (chip.id === 'VERIFIED' || chip.id === 'PENDING') { setUserStatusFilter(chip.id); }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    (userRoleFilter === chip.id || userStatusFilter === chip.id || (chip.id === 'ALL' && userRoleFilter === 'ALL' && userStatusFilter === 'ALL'))
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* USER TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Account Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Password</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            u.userType === 'NGO' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {u.userType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.email || 'N/A'}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{u.phone}</td>
                        <td className="px-4 py-3 text-slate-600">{u.district || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>{visiblePasswords[u.id] ? (u.password || 'N/A') : '••••••••'}</span>
                            <button
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-700"
                            >
                              {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {u.verified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                <span className="text-slate-500 font-medium">
                  Page {safeUserCurrentPage} of {totalUserPages} ({filteredUsers.length} Users)
                </span>
                <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                  <button
                    disabled={safeUserCurrentPage <= 1}
                    onClick={() => setUserCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={safeUserCurrentPage >= totalUserPages}
                    onClick={() => setUserCurrentPage(prev => Math.min(totalUserPages, prev + 1))}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODULE 7: GOVT HELPLINES ═════════════════════════════════ */}
        {activeQueueTab === 'helplines' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Add New Control Room Helpline
              </h3>
              <form onSubmit={handleAddHelpline} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Control Room / Label (e.g. Jorhat Control Room)"
                  value={newHelplineLabel}
                  onChange={(e) => setNewHelplineLabel(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number (e.g. 0376-2300124)"
                  value={newHelplinePhone}
                  onChange={(e) => setNewHelplinePhone(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  + Add Helpline
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helplinesList.map(h => (
                <div key={h.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{h.label}</h4>
                    <p className="text-xs font-mono text-blue-600 mt-0.5">{h.phone_number}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteHelpline(h.id, h.label)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
                    title="Delete Helpline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MODULE 8: CAMPAIGNS ══════════════════════════════════════ */}
        {activeQueueTab === 'campaigns' && (
          <CampaignsAdmin />
        )}

      </main>
    </div>
  );
}
