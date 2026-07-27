import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, MessageSquare, Phone, CheckCircle2, XCircle, 
  Search, RefreshCw, Lock, Key, Clock, Package, HeartHandshake, UserCheck, AlertTriangle, ExternalLink 
} from 'lucide-react';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';

export default function AdminDashboard({ onDataUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
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

  const handlePinSubmit = (e) => {
    e.preventDefault();
    // Accept default PIN 1070 or 1234 or any demo key
    if (pinInput.trim() === '1070' || pinInput.trim() === '1234' || pinInput.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleApproveSos = (id) => {
    storageService.verifyVictimRequest(id, "Control Room Officer");
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
    storageService.verifyDeliveryLog(logId, "Control Room Officer");
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
        `Hello ${name}, this is Assam Flood Relief Control Room verifying your emergency SOS request (${reqId}). Please send your exact location & geotagged photos/videos via WhatsApp to verify and publish to our live rescue boat map.`
      );
    } else if (type === "DELIVERY") {
      text = encodeURIComponent(
        `Hello, this is Assam Flood Relief Control Room regarding your relief delivery log for request ${reqId}. Please share geotagged photo proof of the delivered items so we can approve your timeline log.`
      );
    } else {
      text = encodeURIComponent(
        `Hello ${name}, this is Assam Flood Relief Control Room verifying your registration (${reqId}). Please confirm your contact details.`
      );
    }

    return `https://wa.me/${formatted}?text=${text}`;
  };

  const totalPendingCount = pendingRequests.length + pendingDeliveries.length + pendingNgos.length + pendingVolunteers.length;

  // PIN Unlock Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-900/40 border border-amber-400/30">
          <ShieldCheck className="w-8 h-8 text-slate-950" />
        </div>
        
        <div>
          <h2 className="text-xl font-black text-white">ADMIN CONTROL ROOM</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manual Data Verification & Moderation Dashboard
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Enter Admin Passcode / PIN
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: 1070)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            {pinError && (
              <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Incorrect PIN. Use <span className="font-bold underline">1070</span> for demo access.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>UNLOCK CONTROL ROOM</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              setPinInput('1070');
              setIsAuthenticated(true);
            }}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
          >
            <span>⚡ One-Tap Demo Access (PIN: 1070)</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter pending SOS
  const filteredSos = pendingRequests.filter(req => {
    const matchesDistrict = selectedDistrict === 'ALL' || req.district === selectedDistrict;
    const matchesQuery = !searchQuery || req.name.toLowerCase().includes(searchQuery.toLowerCase()) || req.id.toLowerCase().includes(searchQuery.toLowerCase()) || req.phone.includes(searchQuery);
    return matchesDistrict && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">MANUAL VERIFICATION CONTROL ROOM</h2>
              <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                {totalPendingCount} PENDING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verify incoming citizen requests & NGO delivery logs via WhatsApp geotag image check before publishing live.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" /> Lock Session
        </button>
      </div>

      {/* Queue Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 font-bold text-xs">
        
        <button
          onClick={() => setActiveQueueTab('sos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeQueueTab === 'sos'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Pending SOS Requests ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('deliveries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeQueueTab === 'deliveries'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Relief Delivery Logs ({pendingDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('ngos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeQueueTab === 'ngos'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Pending NGOs ({pendingNgos.length})</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeQueueTab === 'volunteers'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Pending Volunteers ({pendingVolunteers.length})</span>
        </button>

      </div>

      {/* QUEUE 1: PENDING SOS REQUESTS */}
      {activeQueueTab === 'sos' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or phone..."
                className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
            
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Districts ({pendingRequests.length})</option>
              {ASSAM_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {filteredSos.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">No Pending SOS Requests Requiring Verification</h3>
              <p className="text-xs text-slate-500">All submitted requests have been reviewed or published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSos.map(req => (
                <div 
                  key={req.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-lg relative ${
                    req.isUrgentRescue ? 'border-red-600/60 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-sm">{req.id}</span>
                        {req.isUrgentRescue ? (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded-full animate-pulse">
                            🚨 URGENT RESCUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                            📦 FOOD / RELIEF
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          • {req.district}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-black text-white">{req.name}</h4>
                      <p className="text-xs text-slate-300 font-semibold">{req.locationName}</p>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <p className="flex items-center gap-1 justify-end text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] font-bold text-amber-400 mt-0.5">
                        {req.peopleCount} People ({req.childrenCount} Children)
                      </p>
                    </div>
                  </div>

                  {/* Needs */}
                  <div className="flex flex-wrap gap-1.5">
                    {req.needs?.map((need, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-950 text-slate-200 rounded-lg border border-slate-800">
                        • {need}
                      </span>
                    ))}
                  </div>

                  {/* Details */}
                  {req.details && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      "{req.details}"
                    </p>
                  )}

                  {/* Verification Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Contact Buttons */}
                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppVerifyUrl(req.phone, req.name, req.id, "SOS")}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Verify via WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={`tel:${req.phone}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call ({req.phone})</span>
                      </a>
                    </div>

                    {/* Approve vs Reject */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectSos(req.id)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold border border-red-800 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => handleApproveSos(req.id)}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950" /> Approve & Publish Live
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* QUEUE 2: PENDING RELIEF DELIVERY LOGS */}
      {activeQueueTab === 'deliveries' && (
        <div className="space-y-4">
          {pendingDeliveries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">No Pending Relief Delivery Logs</h3>
              <p className="text-xs text-slate-500">NGOs and volunteers have not submitted unverified delivery updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingDeliveries.map(log => (
                <div key={log.logId} className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-sm">{log.logId}</span>
                        <span className="px-2 py-0.5 text-[10px] font-black bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          For SOS: {log.requestId}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1">
                        Delivery by: <span className="text-amber-300">{log.deliveredBy}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Recipient: <strong className="text-slate-200">{log.recipientName}</strong> ({log.district})
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <p className="flex items-center gap-1 justify-end text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                        Status Update: {log.statusUpdate}
                      </p>
                    </div>
                  </div>

                  {/* Delivered Items */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <p className="text-xs font-bold text-slate-300">Supplies Delivered:</p>
                    <p className="text-xs font-semibold text-amber-200">{log.itemsDelivered}</p>
                    {log.deliveryNotes && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                        "{log.deliveryNotes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={getWhatsAppVerifyUrl(log.volunteerPhone, log.deliveredBy, log.requestId, "DELIVERY")}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Photo Proof via WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectDelivery(log.logId)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold border border-red-800"
                      >
                        Reject Log
                      </button>

                      <button
                        onClick={() => handleApproveDelivery(log.logId)}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve & Add to Timeline
                      </button>
                    </div>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">No Pending NGO Registrations</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingNgos.map(ngo => (
                <div key={ngo.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black text-white">{ngo.name}</h4>
                      <p className="text-xs text-slate-400">{ngo.contactPerson} • {ngo.phone}</p>
                    </div>
                    <a
                      href={getWhatsAppVerifyUrl(ngo.phone, ngo.contactPerson, ngo.name, "NGO")}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                    <button onClick={() => handleRejectNgo(ngo.id)} className="px-3 py-1 bg-red-950 text-red-300 rounded-lg text-xs font-bold">Reject</button>
                    <button onClick={() => handleApproveNgo(ngo.id)} className="px-4 py-1 bg-emerald-500 text-slate-950 rounded-lg text-xs font-black">Approve NGO</button>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">No Pending Volunteer Registrations</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingVolunteers.map(vol => (
                <div key={vol.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black text-white">{vol.name}</h4>
                      <p className="text-xs text-amber-300 font-bold">{vol.roleType} • {vol.district}</p>
                      <p className="text-xs text-slate-400">Contact: {vol.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                    <button onClick={() => handleRejectVol(vol.id)} className="px-3 py-1 bg-red-950 text-red-300 rounded-lg text-xs font-bold">Reject</button>
                    <button onClick={() => handleApproveVol(vol.id)} className="px-4 py-1 bg-emerald-500 text-slate-950 rounded-lg text-xs font-black">Approve Volunteer</button>
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
