import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Phone, Download, Search, Filter, CheckCircle2, 
  Clock, MapPin, Users, AlertTriangle, MessageSquare, ExternalLink, Trash2, Heart, Sparkles, Activity, Package, Siren, Navigation, ShieldCheck, History, Plus
} from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';
import { authService } from '../services/authService';
import DeliveryLogModal from './DeliveryLogModal';

export default function NGODashboard({ victimRequests = [], ngos = [] }) {
  const [queueTab, setQueueTab] = useState('CRITICAL_RESCUE'); // 'CRITICAL_RESCUE', 'SUPPLY_REQUESTS', 'ALL'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');   // ALL, Pending, In Progress, Rescued
  const [filterDistrict, setFilterDistrict] = useState('ALL');

  // Modal for logging relief delivery
  const [activeLogRequest, setActiveLogRequest] = useState(null);

  // Delivery logs state
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [expandedTimelines, setExpandedTimelines] = useState({}); // { [requestId]: boolean }

  const loadLogs = () => {
    setDeliveryLogs(storageService.getDeliveryLogs());
  };

  useEffect(() => {
    loadLogs();
    const handleDataChanged = () => loadLogs();
    window.addEventListener('flood_data_changed', handleDataChanged);
    return () => window.removeEventListener('flood_data_changed', handleDataChanged);
  }, []);

  const toggleTimeline = (requestId) => {
    setExpandedTimelines(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  // Separate critical rescue vs supply requests
  const criticalRequests = victimRequests.filter(r => r.isUrgentRescue);
  const supplyRequests = victimRequests.filter(r => !r.isUrgentRescue);

  // Active list based on sub-tab choice
  const targetRequests = 
    queueTab === 'CRITICAL_RESCUE' 
      ? criticalRequests 
      : queueTab === 'SUPPLY_REQUESTS' 
      ? supplyRequests 
      : victimRequests;

  // Filter computation
  const filteredRequests = targetRequests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (req.name && req.name.toLowerCase().includes(searchLower)) ||
      (req.phone && req.phone.includes(searchLower)) ||
      (req.locationName && req.locationName.toLowerCase().includes(searchLower)) ||
      (req.id && req.id.toLowerCase().includes(searchLower));

    const matchesStatus = 
      filterStatus === 'ALL' || req.status === filterStatus;

    const matchesDistrict = 
      filterDistrict === 'ALL' || req.district === filterDistrict;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const urgentCount = criticalRequests.filter(r => r.status !== 'Rescued').length;
  const supplyCount = supplyRequests.filter(r => r.status !== 'Rescued').length;

  const handleStatusChange = (requestId, newStatus, ngoName = '') => {
    storageService.updateRequestStatus(requestId, newStatus, ngoName);
  };

  const handleDelete = (requestId) => {
    if (window.confirm("Are you sure you want to remove this distress record from the active queue?")) {
      storageService.deleteVictimRequest(requestId);
    }
  };

  const handleDownloadSinglePDF = (victim) => {
    pdfService.downloadVictimPDF(victim);
  };

  const handleDownloadBulkPDF = () => {
    if (filteredRequests.length === 0) {
      alert("No requests match your current filters to generate PDF.");
      return;
    }
    const reportTitle = queueTab === 'CRITICAL_RESCUE' 
      ? `Assam Critical Boat Rescue Report (${filteredRequests.length} Cases)`
      : queueTab === 'SUPPLY_REQUESTS'
      ? `Assam Food & Supply Relief Report (${filteredRequests.length} Cases)`
      : `Assam Flood Relief Dispatch Report (${filteredRequests.length} Cases)`;

    pdfService.downloadBulkReportPDF(filteredRequests, reportTitle);
  };

  const getGoogleMapsUrl = (req) => {
    if (req.latitude && req.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`;
    }
    const query = `${req.locationName || req.villageName || ''}, ${req.district}, Assam, India`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-r from-slate-950 via-red-950/60 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
              <Activity className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Assam Flood Situation • Verified Relief Dispatch</span>
            </div>

            {authService.getCurrentUser().role === 'NGO' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-200 border border-emerald-500/50 text-xs font-bold shadow-lg">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Verified Source Active: <strong className="text-amber-300 font-black">{authService.getCurrentUser().user?.name}</strong> (Auto-Publish Enabled)</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              RESCUE & RELIEF CONTROL: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-400">EMERGENCY RESCUES & SUPPLY QUEUE</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Connecting stranded citizens with rescue motorboats and allowing NGOs to log transparent relief supply deliveries with admin verification.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900/80 border border-red-500/40 p-3 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Critical Boat Rescues</div>
              <div className="text-lg font-black text-red-400">{urgentCount} Urgent Cases</div>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 p-3 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Food & Supply Requests</div>
              <div className="text-lg font-black text-amber-300">{supplyCount} Active Demands</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Verified Delivery Logs</div>
              <div className="text-lg font-black text-emerald-400">{deliveryLogs.length} Logged Dispatches</div>
            </div>
          </div>

        </div>
      </div>

      {/* SEPARATED SECTION SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        
        {/* Section Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setQueueTab('CRITICAL_RESCUE')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap border ${
                queueTab === 'CRITICAL_RESCUE'
                  ? 'bg-red-600 text-white border-red-400 shadow-xl shadow-red-950/80'
                  : 'bg-slate-950 text-red-300 border-red-900/40 hover:bg-red-950/40'
              }`}
            >
              <Siren className="w-5 h-5 animate-pulse text-amber-300" />
              <span>🚨 EMERGENCY BOAT RESCUES ({criticalRequests.length})</span>
            </button>

            <button
              onClick={() => setQueueTab('SUPPLY_REQUESTS')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap border ${
                queueTab === 'SUPPLY_REQUESTS'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-xl shadow-amber-950/80'
                  : 'bg-slate-950 text-amber-300 border-amber-900/40 hover:bg-amber-950/40'
              }`}
            >
              <Package className="w-5 h-5 text-slate-950 fill-amber-300" />
              <span>📦 FOOD & SUPPLY REQUESTS ({supplyRequests.length})</span>
            </button>

            <button
              onClick={() => setQueueTab('ALL')}
              className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap border ${
                queueTab === 'ALL'
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>View All ({victimRequests.length})</span>
            </button>
          </div>

          <button
            onClick={handleDownloadBulkPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 shadow-lg transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>EXPORT DISPATCH PDF</span>
          </button>

        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search victim name, phone, village, PIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">⏳ Pending Response</option>
            <option value="In Progress">🚁 Team Dispatched</option>
            <option value="Rescued">✅ Safely Rescued / Relieved</option>
          </select>

          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
          >
            <option value="ALL">All Districts</option>
            {ASSAM_DISTRICTS.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Requests Found in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try switching sub-tabs above or resetting filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isUrgent = req.isUrgentRescue;
            const males = req.malesCount !== undefined ? req.malesCount : Math.max(1, Math.floor((req.peopleCount || 1) / 2));
            const females = req.femalesCount !== undefined ? req.femalesCount : Math.max(0, (req.peopleCount || 1) - males - (req.childrenCount || 0));

            // Find logs for this specific request
            const reqLogs = deliveryLogs.filter(log => log.requestId === req.id);
            const isTimelineOpen = expandedTimelines[req.id];

            return (
              <div 
                key={req.id} 
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                  isUrgent 
                    ? 'bg-slate-900/90 border-red-500/60 hover:border-red-400 shadow-red-950/40' 
                    : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400 shadow-amber-950/20'
                }`}
              >
                <div>
                  {/* Status Header */}
                  <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold ${
                    isUrgent 
                      ? 'bg-red-950/70 border-red-500/40 text-red-300' 
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isUrgent ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="font-black uppercase text-red-300">🚨 EMERGENCY BOAT RESCUE</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-amber-300">📦 FOOD & RELIEF DEMAND</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {req.verified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="Verified by Admin Control Room">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                        req.status === 'Rescued'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : req.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-4 space-y-3">
                    
                    {/* Victim Name */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-2">
                          <span>{req.name}</span>
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {req.peopleCount || (males + females + (req.childrenCount || 0))} Total (👨 {males} Males, 👩 {females} Females, 👶 {req.childrenCount || 0} Children)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {req.id}
                      </span>
                    </div>

                    {/* Location Badge */}
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-start gap-2 text-xs text-slate-200">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-amber-400">{req.district}: </span>
                          <span>{req.locationName || req.villageName}</span>
                          {req.pinCode && (
                            <span className="ml-1 px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded font-mono text-[10px]">
                              PIN: {req.pinCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {req.latitude && req.longitude && (
                        <div className="text-[10px] font-mono text-emerald-400 pl-6 flex items-center gap-1">
                          <span>GPS: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}</span>
                        </div>
                      )}

                      <a
                        href={getGoogleMapsUrl(req)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <span>Navigate in Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    </div>

                    {/* Needed Items */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplies / Help Needed:</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(req.needs) && req.needs.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    {req.details && (
                      <div className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        "{req.details}"
                      </div>
                    )}

                    {/* Contact & Log Relief Delivery Bar */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${req.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {req.phone}</span>
                          </a>

                          {req.phone && (
                            <a
                              href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(req.name)},%20this%20is%20Flood%20NGO%20Relief%20Team.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 rounded-lg text-xs font-bold transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => handleDownloadSinglePDF(req)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
                          title="Download Rescue PDF Slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>

                      {/* Log Delivery Action Button */}
                      <button
                        onClick={() => setActiveLogRequest(req)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>📦 LOG RELIEF DELIVERY FOR THIS AREA</span>
                      </button>
                    </div>

                    {/* Relief Delivery History Timeline Section */}
                    {reqLogs.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <button
                          onClick={() => toggleTimeline(req.id)}
                          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 hover:text-amber-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-amber-400" />
                            <span>Relief Timeline ({reqLogs.length} Delivered)</span>
                          </span>
                          <span className="text-[10px] text-amber-400 font-extrabold">
                            {isTimelineOpen ? "Hide Log ▲" : "View Log ▼"}
                          </span>
                        </button>

                        {isTimelineOpen && (
                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-3.5 text-xs">
                            {reqLogs.map((log) => (
                              <div key={log.logId} className="border-l-2 border-amber-500 pl-3 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-black text-amber-300">{log.deliveredBy}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-200">
                                  📦 <span className="text-amber-200">{log.itemsDelivered}</span>
                                </p>
                                {log.deliveryNotes && (
                                  <p className="text-[10px] text-slate-400 italic">
                                    "{log.deliveryNotes}"
                                  </p>
                                )}
                                <div className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Verified by {log.verifiedBy || "Admin Control Room"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Status controls */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold">Update:</span>
                    <button
                      onClick={() => handleStatusChange(req.id, 'In Progress', 'Assigned Team')}
                      className={`px-2 py-1 rounded font-bold text-[10px] transition-colors ${
                        req.status === 'In Progress' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Dispatched
                    </button>
                    <button
                      onClick={() => handleStatusChange(req.id, 'Rescued', 'Assigned Team')}
                      className={`px-2 py-1 rounded font-bold text-[10px] transition-colors ${
                        req.status === 'Rescued' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Fulfilled
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(req.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Logging Delivery */}
      {activeLogRequest && (
        <DeliveryLogModal
          request={activeLogRequest}
          ngos={ngos}
          onClose={() => setActiveLogRequest(null)}
          onSubmitted={() => loadLogs()}
        />
      )}

    </div>
  );
}
