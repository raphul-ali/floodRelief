import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, MessageSquare, Phone, CheckCircle2, XCircle, 
  Search, RefreshCw, Lock, Key, Clock, Package, HeartHandshake, UserCheck, AlertTriangle, ExternalLink, Bell
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';

export default function AdminDashboard({ onDataUpdated }) {
  const [activeQueueTab, setActiveQueueTab] = useState('sos'); // 'sos' | 'deliveries' | 'ngos' | 'volunteers' | 'recovery'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [pendingRecovery, setPendingRecovery] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = () => {
    setPendingRequests(storageService.getPendingVictimRequests());
    setPendingDeliveries(storageService.getPendingDeliveryLogs());
    setPendingNgos(storageService.getPendingNGOs());
    setPendingVolunteers(storageService.getPendingVolunteers());
    setPendingRecovery(storageService.getAccountRecoveryRequests(true));
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

    let text = `Hello ${name || 'User'}, this is Super Admin from Assam Flood Relief Portal. Regarding your ${reqType === 'FORGOT_PASSWORD' ? 'Forgot Password' : 'Forgot Email'} request for your ${role} account:`;
    if (matchedAccount) {
      text += `\n\n📌 Registered Account Details:\n• Name: ${matchedAccount.name}\n• Email: ${matchedAccount.email}\n• Password: ${matchedAccount.password || '(Demo Standard Password)'}\n• Status: ${matchedAccount.verified ? 'Verified ✅' : 'Pending Admin Verification ⚠️'}`;
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

  // Filter pending SOS
  const filteredSos = pendingRequests.filter(req => {
    const matchesDistrict = selectedDistrict === 'ALL' || req.district === selectedDistrict;
    const matchesQuery = !searchQuery || req.name.toLowerCase().includes(searchQuery.toLowerCase()) || req.id.toLowerCase().includes(searchQuery.toLowerCase()) || req.phone.includes(searchQuery);
    return matchesDistrict && matchesQuery;
  });

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

          {/* Pending Notification Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 bg-red-950/90 border border-red-500/50 rounded-xl text-red-200 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span>{totalPendingCount} PENDING VERIFICATIONS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Queue Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pb-2 border-b border-slate-800 text-xs font-black">
        
        {/* Tab 1: Pending SOS */}
        <button
          onClick={() => setActiveQueueTab('sos')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap min-h-[44px] ${
            activeQueueTab === 'sos'
              ? 'bg-red-600 text-white font-black shadow-lg border border-red-400'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-300 shrink-0" />
          <span>Pending SOS Requests</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            pendingRequests.length > 0 ? 'bg-white text-red-600 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {pendingRequests.length}
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
          <span>Delivery Logs</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            pendingDeliveries.length > 0 ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {pendingDeliveries.length}
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
          <span>Pending NGOs</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            pendingNgos.length > 0 ? 'bg-blue-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {pendingNgos.length}
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
          <span>Volunteers</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            pendingVolunteers.length > 0 ? 'bg-purple-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            {pendingVolunteers.length}
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

      </div>

      {/* QUEUE 1: PENDING SOS REQUESTS */}
      {activeQueueTab === 'sos' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, phone..."
                className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full min-h-[36px]"
              />
            </div>
            
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none w-full sm:w-auto min-h-[36px]"
            >
              <option value="ALL">All Districts ({pendingRequests.length})</option>
              {ASSAM_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {filteredSos.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending SOS Requests</h3>
              <p className="text-xs text-slate-400">All incoming distress signals have been verified & published live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSos.map(req => (
                <div key={req.id} className="bg-slate-900 border border-red-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500/40 rounded-md">
                          {req.isUrgentRescue ? '🚨 BOAT RESCUE' : '📦 RELIEF SUPPLY'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{req.id}</span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">{req.name}</h3>
                      <p className="text-xs text-amber-300 font-bold">📍 {req.district}: {req.locationName || req.villageName}</p>
                    </div>
                  </div>

                  {/* Requested By Badge */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold">Requested by:</span>
                    {req.requestedByRole === 'NGO' ? (
                      <span className="px-2 py-0.5 rounded-md font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        🏛️ NGO: {req.requestedByName}
                      </span>
                    ) : req.requestedByRole === 'VOLUNTEER' ? (
                      <span className="px-2 py-0.5 rounded-md font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        🚚 Volunteer: {req.requestedByName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md font-extrabold bg-slate-900 text-amber-300 border border-slate-700 flex items-center gap-1">
                        👤 Individual Citizen: {req.requestedByName || req.name}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300"><strong className="text-white">People Trapped:</strong> {req.peopleCount || 1} Total</p>
                    <p className="text-slate-300"><strong className="text-white">Phone:</strong> {req.phone}</p>
                    {req.details && <p className="text-slate-400 italic">"{req.details}"</p>}
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
                      href={`tel:${req.phone.replace(/[^0-9]/g, '')}`}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-1 border border-slate-700 min-h-[44px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Victim</span>
                    </a>

                    <button
                      onClick={() => handleApproveSos(req.id)}
                      className="col-span-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✓ APPROVE & PUBLISH LIVE</span>
                    </button>

                    <button
                      onClick={() => handleRejectSos(req.id)}
                      className="col-span-2 py-2 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[38px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject & Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 2: PENDING DELIVERY LOGS */}
      {activeQueueTab === 'deliveries' && (
        <div className="space-y-4">
          {pendingDeliveries.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending Delivery Logs</h3>
              <p className="text-xs text-slate-400">All relief dispatches have been audited and verified.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDeliveries.map(log => (
                <div key={log.logId} className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">
                        DISPATCH LOG #{log.logId}
                      </span>
                      <h3 className="text-base font-black text-white mt-1">Delivered by: {log.deliveredBy}</h3>
                      <p className="text-xs text-slate-300">Items: <strong className="text-amber-300">{log.itemsDelivered}</strong></p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300"><strong className="text-white">Volunteer Phone:</strong> {log.volunteerPhone}</p>
                    {log.deliveryNotes && <p className="text-slate-400 italic">"{log.deliveryNotes}"</p>}
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

                    <button
                      onClick={() => handleApproveDelivery(log.logId)}
                      className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Log</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 3: PENDING NGOS */}
      {activeQueueTab === 'ngos' && (
        <div className="space-y-4">
          {pendingNgos.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending NGO Registrations</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNgos.map(ngo => (
                <div key={ngo.id} className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div>
                    <h3 className="text-base font-black text-white">{ngo.name}</h3>
                    <p className="text-xs text-slate-300">Contact: <strong>{ngo.contactPerson}</strong> ({ngo.phone})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApproveNgo(ngo.id)}
                      className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve NGO</span>
                    </button>

                    <button
                      onClick={() => handleRejectNgo(ngo.id)}
                      className="py-2.5 px-3 bg-red-950 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEUE 4: PENDING VOLUNTEERS */}
      {activeQueueTab === 'volunteers' && (
        <div className="space-y-4">
          {pendingVolunteers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending Volunteer Profiles</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVolunteers.map(vol => (
                <div key={vol.id} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl space-y-3">
                  <div>
                    <h3 className="text-base font-black text-white">{vol.name}</h3>
                    <p className="text-xs text-purple-300 font-bold">{vol.roleType} - {vol.phone}</p>
                    {vol.offerings && <p className="text-xs text-slate-300 mt-1">"{vol.offerings}"</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApproveVol(vol.id)}
                      className="py-2.5 px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Volunteer</span>
                    </button>

                    <button
                      onClick={() => handleRejectVol(vol.id)}
                      className="py-2.5 px-3 bg-red-950 text-red-300 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200">Account Recovery Queue ({pendingRecovery.length} Total)</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email, ID..."
                className="bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 rounded-lg px-3 py-1.5 focus:outline-none w-full sm:w-48 min-h-[36px]"
              />
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
                            {isPasswordReq ? '🔑 FORGOT PASSWORD' : '📧 FORGOT EMAIL'}
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
                            <span className="text-slate-400 font-medium block mb-0.5">User Verification Note:</span>
                            <p className="text-slate-300 italic text-[11px]">"{req.details}"</p>
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
                              {matchedAccount.verified ? 'Verified ✅' : 'Unverified ⚠️'}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-slate-200 bg-slate-950/80 p-2 rounded-lg font-mono">
                            <p><strong>Registered Email:</strong> <span className="text-cyan-300">{matchedAccount.email}</span></p>
                            <p><strong>Password:</strong> <span className="text-amber-300">{matchedAccount.password || '(Standard Demo Pass)'}</span></p>
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
                          ⚠️ No exact matching registered record found automatically. Use phone/email to verify with user.
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

    </div>
  );
}
