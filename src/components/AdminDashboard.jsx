import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, MessageSquare, Phone, CheckCircle2, XCircle, 
  Search, RefreshCw, Lock, Key, Clock, Package, HeartHandshake, UserCheck, AlertTriangle, ExternalLink, Bell
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';

export default function AdminDashboard({ onDataUpdated }) {
  const [activeQueueTab, setActiveQueueTab] = useState('sos'); // 'sos' | 'deliveries' | 'ngos' | 'volunteers'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = () => {
    setPendingRequests(storageService.getPendingVictimRequests());
    setPendingDeliveries(storageService.getPendingDeliveryLogs());
    setPendingNgos(storageService.getPendingNGOs());
    setPendingVolunteers(storageService.getPendingVolunteers());
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

  const totalPendingCount = pendingRequests.length + pendingDeliveries.length + pendingNgos.length + pendingVolunteers.length;

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
                Verify incoming distress signals, relief logs, and registrations before live publishing.
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

      {/* Swipeable Notification Queue Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-black no-scrollbar touch-pan-x">
        
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

    </div>
  );
}
