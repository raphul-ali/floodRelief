import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Phone, Download, Search, Filter, CheckCircle2, 
  Clock, MapPin, Users, AlertTriangle, MessageSquare, ExternalLink, Trash2, Heart, Sparkles, Activity, Package, Siren, Navigation, ShieldCheck, History, Plus, Building2, UserCheck, Send, Truck, Car, Anchor, Stethoscope, Mail, Check, XCircle, ChevronDown, ChevronUp, Lock
} from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';
import { authService } from '../services/authService';
import DeliveryLogModal from './DeliveryLogModal';
import DeliveryUpdatesTreeModal from './DeliveryUpdatesTreeModal';

export default function NGODashboard({ victimRequests = [], ngos = [] }) {
  const currentUser = authService.getCurrentUser();
  const [queueTab, setQueueTab] = useState(currentUser.role === 'VOLUNTEER' ? 'COLLABORATIONS' : 'ALL'); // 'ALL' | 'CRITICAL_RESCUE' | 'SUPPLY_REQUESTS' | 'VOLUNTEERS' | 'COLLABORATIONS'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');   // ALL, Pending, In Progress, Rescued
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterVolRole, setFilterVolRole] = useState('ALL');

  // Modal for logging relief delivery & tree view
  const [activeLogRequest, setActiveLogRequest] = useState(null);
  const [activeTreeRequest, setActiveTreeRequest] = useState(null);

  // Modal for sending logistics request to volunteer
  const [targetVolForReq, setTargetVolForReq] = useState(null);
  const [selectedSosForVol, setSelectedSosForVol] = useState('');
  const [collabMessage, setCollabMessage] = useState('');
  const [collabSubmitSuccess, setCollabSubmitSuccess] = useState(false);

  // Collapsible NGO Profile info state
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Modal for managing NGO Operating Zones
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneModalMode, setZoneModalMode] = useState('WHOLE_ASSAM');
  const [zoneModalDistricts, setZoneModalDistricts] = useState([]);

  // Data states
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [collabRequests, setCollabRequests] = useState([]);
  const [expandedTimelines, setExpandedTimelines] = useState({});

  const isNgoUser = currentUser.role === 'NGO';
  const isVolunteerUser = currentUser.role === 'VOLUNTEER';
  const [volunteerStatus, setVolunteerStatus] = useState(currentUser.user?.availableStatus || 'Active Now');
  const isAuthorizedUser = currentUser && (currentUser.role === 'NGO' || currentUser.role === 'VOLUNTEER' || currentUser.role === 'ADMIN');
  const ngoUserDetail = currentUser.user || {
    id: 'ngo-demo',
    name: 'Assam Disaster Relief Network',
    contactPerson: 'Relief Coordinator',
    phone: '+91 98640 12345',
    email: 'contact@assamrelief.org',
    operatingZones: ['Whole Assam (All 35 Districts)']
  };

  const loadData = () => {
    setDeliveryLogs(storageService.getDeliveryLogs());
    setVolunteers(storageService.getVolunteers(true));
    setCollabRequests(storageService.getVolunteerCollabRequests());
  };

  const handleSaveOperatingZones = () => {
    const finalZones = zoneModalMode === 'WHOLE_ASSAM'
      ? ['Whole Assam (All 35 Districts)']
      : (zoneModalDistricts.length > 0 ? zoneModalDistricts : ['Whole Assam (All 35 Districts)']);

    if (ngoUserDetail.id) {
      storageService.updateNGOOperatingZones(ngoUserDetail.id, finalZones);
      authService.updateUserSessionZones(finalZones);
    }
    setIsZoneModalOpen(false);
  };

  useEffect(() => {
    loadData();
    const handleDataChanged = () => loadData();
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

  // Filter computation for SOS requests
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

  // Filter computation for Volunteers Directory
  const filteredVolunteers = volunteers.filter(vol => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (vol.name && vol.name.toLowerCase().includes(searchLower)) ||
      (vol.phone && vol.phone.includes(searchLower)) ||
      (vol.district && vol.district.toLowerCase().includes(searchLower));

    const matchesRole = 
      filterVolRole === 'ALL' || (vol.roleType && vol.roleType.includes(filterVolRole));

    const matchesDistrict = 
      filterDistrict === 'ALL' || vol.district === filterDistrict;

    return matchesSearch && matchesRole && matchesDistrict;
  });

  const urgentCount = criticalRequests.filter(r => r.status !== 'Rescued').length;
  const supplyCount = supplyRequests.filter(r => r.status !== 'Rescued').length;

  const handleStatusChange = (requestId, newStatus, ngoName = '') => {
    storageService.updateRequestStatus(requestId, newStatus, ngoName || ngoUserDetail.name);
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

  const handleSendVolRequestSubmit = (e) => {
    e.preventDefault();
    if (!targetVolForReq) return;

    try {
      const selectedSos = victimRequests.find(r => r.id === selectedSosForVol);

      storageService.addVolunteerCollabRequest({
        ngoId: ngoUserDetail.id || 'ngo-demo',
        ngoName: ngoUserDetail.name,
        ngoPhone: ngoUserDetail.phone,
        ngoEmail: ngoUserDetail.email,
        volId: targetVolForReq.id,
        volName: targetVolForReq.name,
        volRole: targetVolForReq.roleType || 'Logistics Volunteer',
        volPhone: targetVolForReq.phone,
        volDistrict: targetVolForReq.district,
        sosRequestId: selectedSosForVol,
        sosLocation: selectedSos ? `${selectedSos.district}: ${selectedSos.locationName || selectedSos.villageName}` : '',
        message: collabMessage
      });

      setCollabSubmitSuccess(true);
      setTimeout(() => {
        setTargetVolForReq(null);
        setCollabSubmitSuccess(false);
        setCollabMessage('');
        setSelectedSosForVol('');
      }, 1500);
    } catch (err) {
      alert(err.message || "Failed to send request.");
    }
  };

  const handleSimulateAccept = (reqId) => {
    storageService.acceptVolunteerCollabRequest(reqId);
  };

  const getGoogleMapsUrl = (req) => {
    if (req.latitude && req.longitude) {
      return `https://www.google.com/maps?q=${req.latitude},${req.longitude}`;
    }
    const query = `${req.locationName || req.villageName || ''}, ${req.district}, Assam, India`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getWhatsAppLink = (phone, text) => {
    if (!phone) return '#';
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.length === 10) formatted = '91' + formatted;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* --- TOP NGO PROFILE INFORMATION BANNER --- */}
      {isNgoUser && (
        <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* ALWAYS VISIBLE ULTRA-COMPACT TOP HEADER */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-slate-950 shadow-md shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                {ngoUserDetail.name}
              </h2>
            </div>

            {/* More Button */}
            <button
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all shrink-0 min-h-[38px]"
            >
              <span>{isProfileExpanded ? 'Less' : 'More'}</span>
              {isProfileExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
            </button>

          </div>

          {/* COLLAPSIBLE PERSONAL / CONTACT INFO BOX */}
          {isProfileExpanded && (
            <div className="relative z-10 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Contact Person / Relief Officer
                  </span>
                  <p className="font-black text-white text-sm">{ngoUserDetail.contactPerson || 'Relief Desk'}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Official Mobile Phone
                  </span>
                  <p className="font-mono font-bold text-amber-300 text-sm">{ngoUserDetail.phone}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Official Email Address
                  </span>
                  <p className="font-mono text-white text-xs truncate">{ngoUserDetail.email || 'N/A'}</p>
                </div>
              </div>

              {/* Operating Zones & Zone Configurer inside Collapsible Box */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Operating Zones:
                  </span>
                  {Array.isArray(ngoUserDetail.operatingZones) ? (
                    ngoUserDetail.operatingZones.map(zone => (
                      <span key={zone} className="px-2.5 py-0.5 bg-slate-900 text-amber-300 border border-slate-800 rounded-md font-bold text-[11px]">
                        📍 {zone}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-900 text-amber-300 border border-slate-800 rounded-md font-bold text-[11px]">
                      📍 Assam State Relief Corridor
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const currentZones = Array.isArray(ngoUserDetail.operatingZones) ? ngoUserDetail.operatingZones : [];
                    const isWhole = currentZones.some(z => z.includes('Whole Assam'));
                    setZoneModalMode(isWhole ? 'WHOLE_ASSAM' : 'CUSTOM_DISTRICTS');
                    setZoneModalDistricts(isWhole ? ['Jorhat', 'Sivasagar'] : currentZones);
                    setIsZoneModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 shrink-0"
                >
                  <span>✏️ Configure Zones</span>
                </button>
              </div>

            </div>
          )}

          {/* Direct Relief Desk Footer Indicator */}
          <div className="relative z-10 flex items-center justify-end text-[11px] text-emerald-400 font-bold gap-1 pt-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Verified NGO Relief Desk Active</span>
          </div>

        </div>
      )}

      {/* --- TOP VOLUNTEER SERVICE PROVIDER BANNER --- */}
      {isVolunteerUser && (
        <div className="relative rounded-2xl border border-purple-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-md shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                  {currentUser.user?.name || 'Service Provider'}
                </h2>
                <p className="text-[10px] sm:text-xs font-semibold text-purple-300 truncate">
                  {currentUser.user?.roleType || 'Logistics Service'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Your Status
                <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full lowercase tracking-normal">
                  (click to toggle)
                </span>
              </span>
              
              <button
                onClick={() => {
                  const newStatus = volunteerStatus === 'Active Now' ? 'Busy / Offline' : 'Active Now';
                  setVolunteerStatus(newStatus);
                  if (currentUser.user?.id) {
                    storageService.updateVolunteerStatus(currentUser.user.id, newStatus);
                    authService.updateUserSessionStatus(newStatus);
                    currentUser.user.availableStatus = newStatus;
                    window.dispatchEvent(new Event("flood_data_changed"));
                  }
                }}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  volunteerStatus === 'Active Now' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
                <span className="sr-only">Toggle Status</span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    volunteerStatus === 'Active Now' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              
              <span className={`text-[10px] font-black uppercase ${
                volunteerStatus === 'Active Now' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {volunteerStatus === 'Active Now' ? 'Available for Booking' : 'Booked'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION TABS SELECTOR --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Section Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          <div className="flex items-center gap-2 flex-wrap">
            
            {currentUser.role !== 'VOLUNTEER' && (
              <>
                {/* Tab 1: View All Requests (Default) */}
                <button
                  onClick={() => setQueueTab('ALL')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border min-h-[44px] ${
                    queueTab === 'ALL'
                      ? 'bg-slate-800 text-white border-slate-500 shadow-xl'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ALL REQUESTS ({victimRequests.length})</span>
                </button>

                {/* Tab 2: Emergency Boat Rescues */}
                <button
                  onClick={() => setQueueTab('CRITICAL_RESCUE')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border min-h-[44px] ${
                    queueTab === 'CRITICAL_RESCUE'
                      ? 'bg-red-600 text-white border-red-400 shadow-xl shadow-red-950/80'
                      : 'bg-slate-950 text-red-300 border-red-900/40 hover:bg-red-950/40'
                  }`}
                >
                  <Siren className="w-4 h-4 animate-pulse text-amber-300 shrink-0" />
                  <span>🚨 EMERGENCY RESCUES ({criticalRequests.length})</span>
                </button>

                {/* Tab 3: Food & Relief Requests */}
                <button
                  onClick={() => setQueueTab('SUPPLY_REQUESTS')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border min-h-[44px] ${
                    queueTab === 'SUPPLY_REQUESTS'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-xl shadow-amber-950/80'
                      : 'bg-slate-950 text-amber-300 border-amber-900/40 hover:bg-amber-950/40'
                  }`}
                >
                  <Package className="w-4 h-4 text-slate-950 fill-amber-300 shrink-0" />
                  <span>📦 FOOD & RELIEF DEMAND ({supplyRequests.length})</span>
                </button>

                {/* Tab 4: Transport & Logistics Volunteers */}
                <button
                  onClick={() => setQueueTab('VOLUNTEERS')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border min-h-[44px] ${
                    queueTab === 'VOLUNTEERS'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-950/80'
                      : 'bg-slate-950 text-purple-300 border-purple-900/40 hover:bg-purple-950/40'
                  }`}
                >
                  <Truck className="w-4 h-4 text-purple-300 shrink-0" />
                  <span>🚤 LOGISTICS VOLUNTEERS ({volunteers.length})</span>
                </button>
              </>
            )}

            {/* Tab 5: Mutual Contact Collaborations */}
            <button
              onClick={() => setQueueTab('COLLABORATIONS')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border min-h-[44px] ${
                queueTab === 'COLLABORATIONS'
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-xl shadow-cyan-950/80'
                  : 'bg-slate-950 text-cyan-300 border-cyan-900/40 hover:bg-cyan-950/40'
              }`}
            >
              <UserCheck className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>🤝 MUTUAL CONTACT EXCHANGE ({collabRequests.length})</span>
            </button>
          </div>

          {queueTab !== 'VOLUNTEERS' && queueTab !== 'COLLABORATIONS' && (
            <button
              onClick={handleDownloadBulkPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 shadow-lg transition-all shrink-0 min-h-[40px]"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>EXPORT DISPATCH PDF</span>
            </button>
          )}

        </div>

        {/* Filter Toolbar for SOS and Volunteers */}
        {queueTab !== 'COLLABORATIONS' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={queueTab === 'VOLUNTEERS' ? "Search volunteer name, vehicle, phone..." : "Search victim name, phone, village, PIN..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>

            {queueTab === 'VOLUNTEERS' ? (
              <select
                value={filterVolRole}
                onChange={(e) => setFilterVolRole(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 min-h-[40px]"
              >
                <option value="ALL">All Volunteer Capability Types</option>
                <option value="Rescue Boat">🚤 Rescue Motorboat</option>
                <option value="Transport Service">🚗 4x4 Transport Car / SUV</option>
                <option value="Truck">🚚 Goods Truck / Pickup</option>
                <option value="Medical">🩺 Medical Doctor / Paramedic</option>
                <option value="Supply Donor">📦 Food & Water Donor</option>
              </select>
            ) : (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 min-h-[40px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">⏳ Pending Response</option>
                <option value="In Progress">🚁 Team Dispatched</option>
                <option value="Rescued">✅ Safely Rescued / Relieved</option>
              </select>
            )}

            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300 min-h-[40px]"
            >
              <option value="ALL">All Districts</option>
              {ASSAM_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* --- PANEL 1 & 2: EMERGENCY SOS & FOOD RELIEF CARDS GRID --- */}
      {(queueTab === 'CRITICAL_RESCUE' || queueTab === 'SUPPLY_REQUESTS' || queueTab === 'ALL') && (
        <>
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
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="Verified by Platform Admin">
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
                                {(() => {
                                  const totalPeople = (req.peopleCount || 0) > 0 ? req.peopleCount : ((req.malesCount || 0) + (req.femalesCount || 0) + (req.childrenCount || 0));
                                  const showPeople = totalPeople > 0;
                                  const showFamilies = req.familiesCount > 0;
                                  
                                  if (!showPeople && !showFamilies) return 'Status Unknown';

                                  return (
                                    <>
                                      {showPeople && `${totalPeople} Total (👨 ${req.malesCount || 0} Males, 👩 ${req.femalesCount || 0} Females, 👶 ${req.childrenCount || 0} Children)`}
                                      {showPeople && showFamilies && ' & '}
                                      {showFamilies && `${req.familiesCount} Families`}
                                      {' Need Help'}
                                    </>
                                  );
                                })()}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {req.id}
                          </span>
                        </div>

                        {/* Requested By Identity Badge */}
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

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {isAuthorizedUser ? (
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
                                    href={getWhatsAppLink(req.phone, `Hello ${req.name}, this is ${ngoUserDetail.name} Relief Team.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-emerald-950 border border-emerald-700 text-emerald-400 hover:bg-emerald-900 rounded-lg text-xs font-bold transition-colors"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-amber-300">
                                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Phone: +91 ******{req.phone ? req.phone.slice(-4) : 'XXXX'} (Log in to view)</span>
                              </div>
                            )}

                            <button
                              onClick={() => handleDownloadSinglePDF(req)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
                              title="Download Rescue PDF Slip"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                            {isAuthorizedUser && (
                              <button
                                onClick={() => setActiveLogRequest(req)}
                                className="flex-1 w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                                <span>📦 LOG RELIEF DELIVERY</span>
                              </button>
                            )}

                            <button
                              onClick={() => setActiveTreeRequest(req)}
                              className="flex-1 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              <Activity className="w-4 h-4 text-emerald-400" />
                              <span>📜 SEE UPDATES & IMPACT TREE</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Status controls */}
                    <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-bold">Update:</span>
                        <button
                          onClick={() => handleStatusChange(req.id, 'In Progress')}
                          className={`px-2 py-1 rounded font-bold text-[10px] transition-colors ${
                            req.status === 'In Progress' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Dispatched
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'Rescued')}
                          className={`px-2 py-1 rounded font-bold text-[10px] transition-colors ${
                            req.status === 'Rescued' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Fulfilled
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* --- PANEL 3: TRANSPORT & LOGISTICS VOLUNTEERS DIRECTORY --- */}
      {queueTab === 'VOLUNTEERS' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Logistics & Transport Volunteers Directory</h3>
                <p className="text-xs text-slate-400">
                  Send dispatch requests to motorboats, 4x4 transport vehicles, goods trucks, or medical paramedics.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-purple-950 border border-purple-500/40 rounded-xl text-purple-300 text-xs font-black">
              {filteredVolunteers.length} Active Volunteers Available
            </div>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Logistics Volunteers Match Filters</h3>
              <p className="text-xs text-slate-400">Try changing capability role or district dropdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVolunteers.map(vol => {
                const roleLower = (vol.roleType || '').toLowerCase();
                const isBoat = roleLower.includes('boat');
                const isTruck = roleLower.includes('truck');
                const isCar = roleLower.includes('car') || roleLower.includes('suv');
                const isMedical = roleLower.includes('medical') || roleLower.includes('doctor');

                return (
                  <div key={vol.id} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 text-[10px] font-black bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-md">
                              {vol.roleType || 'Individual Helper'}
                            </span>
                            {vol.verified && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-white mt-1.5">{vol.name}</h3>
                          <p className="text-xs text-amber-300 font-bold">📍 {vol.district} District</p>
                        </div>
                      </div>

                      {vol.offerings && (
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                          "{vol.offerings}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Contact Info:</span>
                        <span className="text-purple-300 font-mono font-bold">Protected until request accepted</span>
                      </div>

                      <button
                        onClick={() => {
                          setTargetVolForReq(vol);
                          setCollabMessage(`Hello ${vol.name}, our NGO (${ngoUserDetail.name}) needs your ${vol.roleType || 'logistics support'} for active flood relief operations in ${vol.district}.`);
                        }}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>📩 REQUEST LOGISTICS ASSISTANCE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL 4: MUTUAL CONTACT INFORMATION EXCHANGE --- */}
      {queueTab === 'COLLABORATIONS' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Mutual Contact Information Exchange</h3>
                <p className="text-xs text-slate-400">
                  When a Volunteer accepts an NGO logistics request, mutual direct contact info (Phone & WhatsApp) unlocks for both parties.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-black">
              {collabRequests.length} Total Requests Sent
            </div>
          </div>

          {collabRequests.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Logistics Requests Sent Yet</h3>
              <p className="text-xs text-slate-400">
                Go to the "🚤 LOGISTICS VOLUNTEERS" tab to dispatch requests to Motorboats, 4x4 Cars, or Trucks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {collabRequests.map(req => {
                const isAccepted = req.status === 'ACCEPTED';

                return (
                  <div key={req.id} className={`bg-slate-900 border rounded-2xl p-4 shadow-xl space-y-4 ${
                    isAccepted ? 'border-emerald-500/60 shadow-emerald-950/40' : 'border-cyan-500/40'
                  }`}>
                    {/* Status Bar Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{req.id}</span>
                        <span className="text-xs font-black text-amber-300">{req.volRole}</span>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                        isAccepted 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                          : 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse'
                      }`}>
                        {isAccepted ? '✅ ACCEPTED & UNLOCKED' : '⏳ PENDING VOLUNTEER RESPONSE'}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <p className="text-white"><strong>Target Volunteer:</strong> {req.volName} ({req.volDistrict})</p>
                      {req.sosLocation && <p className="text-amber-300"><strong>Relief Zone:</strong> {req.sosLocation}</p>}
                      {req.message && <p className="text-slate-300 italic">"{req.message}"</p>}
                      <p className="text-[10px] text-slate-500 pt-1">Sent: {new Date(req.createdAt).toLocaleString()}</p>
                    </div>

                    {/* MUTUAL CONTACT DETAILS DISPLAY */}
                    {isAccepted ? (
                      <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>MUTUAL CONTACT UNLOCKED! DIRECT COMMUNICATION ENABLED</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Volunteer Unlocked Data */}
                          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-emerald-500/30 space-y-1">
                            <span className="text-[10px] font-black text-purple-400 uppercase">Volunteer Info</span>
                            <p className="font-bold text-white">{req.volName}</p>
                            <p className="font-mono text-amber-300">{req.volPhone}</p>
                            <p className="text-[10px] text-slate-400">{req.volRole}</p>
                          </div>

                          {/* NGO Unlocked Data */}
                          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-emerald-500/30 space-y-1">
                            <span className="text-[10px] font-black text-cyan-400 uppercase">NGO Direct Contact</span>
                            <p className="font-bold text-white">{req.ngoName}</p>
                            <p className="font-mono text-amber-300">{req.ngoPhone}</p>
                            <p className="text-[10px] text-slate-400">{req.ngoEmail}</p>
                          </div>
                        </div>

                        {/* Direct Communication Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={getWhatsAppLink(req.volPhone, `Hello ${req.volName}, this is ${req.ngoName} regarding our accepted logistics dispatch request (${req.id}).`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 min-h-[44px]"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>WhatsApp Volunteer</span>
                          </a>

                          <a
                            href={`tel:${req.volPhone.replace(/[^0-9]/g, '')}`}
                            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border border-slate-700 min-h-[44px]"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Phone</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-950 border border-dashed border-amber-500/30 rounded-xl text-xs text-slate-400 text-center">
                          ⏳ Waiting for volunteer to accept on their device. Contact details will unlock automatically upon acceptance.
                        </div>

                        {/* Demo Acceptance Simulator for Testing */}
                        <button
                          onClick={() => handleSimulateAccept(req.id)}
                          className="w-full py-2 bg-slate-800 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulate Volunteer Accepting Request (Demo Test)</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- MODAL: SEND LOGISTICS ASSISTANCE REQUEST TO VOLUNTEER --- */}
      {targetVolForReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Send Logistics Request</h3>
                  <p className="text-xs text-slate-400">To: <strong className="text-amber-300">{targetVolForReq.name}</strong> ({targetVolForReq.roleType})</p>
                </div>
              </div>
              <button
                onClick={() => setTargetVolForReq(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {collabSubmitSuccess ? (
              <div className="p-6 bg-slate-950 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-white">Request Dispatched to Volunteer!</h4>
                <p className="text-xs text-slate-300">
                  When {targetVolForReq.name} accepts, mutual direct contact details will unlock in your Mutual Contact Exchange panel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendVolRequestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Select Associated SOS Distress Case (Optional)
                  </label>
                  <select
                    value={selectedSosForVol}
                    onChange={(e) => setSelectedSosForVol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[44px]"
                  >
                    <option value="">Select an active distress signal location...</option>
                    {victimRequests.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.isUrgentRescue ? '🚨 BOAT' : '📦 FOOD'} - {r.district}: {r.name} ({r.locationName || r.villageName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Dispatch Instructions / Details for Volunteer *
                  </label>
                  <textarea
                    rows={3}
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Specify number of boats/trucks needed, exact riverbank location, or meeting point..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-[11px] text-purple-200">
                  🔒 <strong>Privacy Note:</strong> Contact numbers are kept private until the volunteer accepts your request.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetVolForReq(null)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Dispatch Request</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE NGO OPERATING ZONES */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Configure NGO Operating Zones</h3>
                  <p className="text-xs text-slate-400">Select where your organization operates in Assam.</p>
                </div>
              </div>
              <button
                onClick={() => setIsZoneModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setZoneModalMode('WHOLE_ASSAM')}
                  className={`flex-1 py-2.5 rounded-lg text-xs transition-all ${
                    zoneModalMode === 'WHOLE_ASSAM'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white font-bold'
                  }`}
                >
                  🌐 Whole Assam (All 35 Districts)
                </button>
                <button
                  type="button"
                  onClick={() => setZoneModalMode('CUSTOM_DISTRICTS')}
                  className={`flex-1 py-2.5 rounded-lg text-xs transition-all ${
                    zoneModalMode === 'CUSTOM_DISTRICTS'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white font-bold'
                  }`}
                >
                  📍 Specific Districts
                </button>
              </div>

              {zoneModalMode === 'CUSTOM_DISTRICTS' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-bold">Selected: {zoneModalDistricts.length} Districts</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setZoneModalDistricts(ASSAM_DISTRICTS)}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoneModalDistricts([])}
                        className="text-red-400 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 border border-slate-800 p-2.5 rounded-xl bg-slate-950 text-xs">
                    {ASSAM_DISTRICTS.map(dist => {
                      const isSelected = zoneModalDistricts.includes(dist);
                      return (
                        <label key={dist} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setZoneModalDistricts(prev => [...prev, dist]);
                              } else {
                                setZoneModalDistricts(prev => prev.filter(d => d !== dist));
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                          />
                          <span className={isSelected ? "text-amber-300 font-bold" : ""}>{dist}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOperatingZones}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Operating Zones</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal for Logging Delivery */}
      {activeLogRequest && (
        <DeliveryLogModal
          request={activeLogRequest}
          ngos={ngos}
          onClose={() => setActiveLogRequest(null)}
          onSubmitted={() => loadData()}
        />
      )}

      {/* Modal for Viewing Relief Delivery Updates Tree */}
      {activeTreeRequest && (
        <DeliveryUpdatesTreeModal
          request={activeTreeRequest}
          deliveryLogs={deliveryLogs}
          onClose={() => setActiveTreeRequest(null)}
        />
      )}

    </div>
  );
}
