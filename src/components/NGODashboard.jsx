import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Phone, Download, Search, Filter, CheckCircle2, 
  Clock, MapPin, Users, AlertTriangle, MessageSquare, ExternalLink, Trash2, Heart, Sparkles, Activity, Package, Siren, Navigation, ShieldCheck, History, Plus, Building2, UserCheck, Send, Truck, Car, Anchor, Stethoscope, Mail, Check, XCircle, ChevronDown, ChevronUp, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { storageService, ASSAM_DISTRICTS } from '../services/storageService';
import { authService } from '../services/authService';
import DeliveryLogModal from './DeliveryLogModal';
import DeliveryUpdatesTreeModal from './DeliveryUpdatesTreeModal';
import { parseNeedsTags } from '../utils/helpers';
import ExpandableNotes from './ExpandableNotes';

export default function NGODashboard({ victimRequests = [], ngos = [] }) {
  const currentUser = authService.getCurrentUser();
  const [queueTab, setQueueTab] = useState(currentUser.role === 'VOLUNTEER' ? 'COLLABORATIONS' : 'ALL'); // 'ALL' | 'CRITICAL_RESCUE' | 'SUPPLY_REQUESTS' | 'VOLUNTEERS' | 'COLLABORATIONS'
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');   // ALL, Pending, In Progress, Rescued
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterVolRole, setFilterVolRole] = useState('ALL');
  const [filterUrgency, setFilterUrgency] = useState('ALL'); // ALL, CRITICAL, HIGH, NORMAL
  const [filterVerification, setFilterVerification] = useState('ALL'); // ALL, VERIFIED, UNVERIFIED

  // Pagination states
  const [reqCurrentPage, setReqCurrentPage] = useState(1);
  const [reqItemsPerPage, setReqItemsPerPage] = useState(6);
  
  const [volCurrentPage, setVolCurrentPage] = useState(1);
  const [volItemsPerPage, setVolItemsPerPage] = useState(6);

  const [collabCurrentPage, setCollabCurrentPage] = useState(1);
  const [collabItemsPerPage, setCollabItemsPerPage] = useState(6);

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

    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesDistrict = filterDistrict === 'ALL' || req.district === filterDistrict;

    const matchesUrgency = filterUrgency === 'ALL' || 
      (filterUrgency === 'CRITICAL' && req.isUrgentRescue) ||
      (filterUrgency === 'HIGH' && !req.isUrgentRescue && req.urgency === 'HIGH') ||
      (filterUrgency === 'NORMAL' && !req.isUrgentRescue && req.urgency !== 'HIGH');

    const matchesVerification = filterVerification === 'ALL' ||
      (filterVerification === 'VERIFIED' && req.verified) ||
      (filterVerification === 'UNVERIFIED' && !req.verified);

    return matchesSearch && matchesStatus && matchesDistrict && matchesUrgency && matchesVerification;
  });

  // Filter computation for Volunteers Directory
  const filteredVolunteers = volunteers.filter(vol => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (vol.name && vol.name.toLowerCase().includes(searchLower)) ||
      (vol.phone && vol.phone.includes(searchLower)) ||
      (vol.district && vol.district.toLowerCase().includes(searchLower));

    const matchesRole = filterVolRole === 'ALL' || (vol.roleType && vol.roleType.includes(filterVolRole));
    const matchesDistrict = filterDistrict === 'ALL' || vol.district === filterDistrict;

    const matchesVerification = filterVerification === 'ALL' ||
      (filterVerification === 'VERIFIED' && vol.verified) ||
      (filterVerification === 'UNVERIFIED' && !vol.verified);

    return matchesSearch && matchesRole && matchesDistrict && matchesVerification;
  });

  // Requests Pagination Calculation
  const totalReqPages = Math.ceil(filteredRequests.length / reqItemsPerPage) || 1;
  const safeReqPage = Math.min(Math.max(1, reqCurrentPage), totalReqPages);
  const paginatedRequests = filteredRequests.slice((safeReqPage - 1) * reqItemsPerPage, safeReqPage * reqItemsPerPage);

  // Volunteers Pagination Calculation
  const totalVolPages = Math.ceil(filteredVolunteers.length / volItemsPerPage) || 1;
  const safeVolPage = Math.min(Math.max(1, volCurrentPage), totalVolPages);
  const paginatedVolunteers = filteredVolunteers.slice((safeVolPage - 1) * volItemsPerPage, safeVolPage * volItemsPerPage);

  // Collabs Pagination Calculation
  const totalCollabPages = Math.ceil(collabRequests.length / collabItemsPerPage) || 1;
  const safeCollabPage = Math.min(Math.max(1, collabCurrentPage), totalCollabPages);
  const paginatedCollabs = collabRequests.slice((safeCollabPage - 1) * collabItemsPerPage, safeCollabPage * collabItemsPerPage);

  const handleStatusChange = (requestId, newStatus, ngoName = '') => {
    storageService.updateRequestStatus(requestId, newStatus, ngoName || ngoUserDetail.name);
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

  const getGoogleMapsUrl = (req) => {
    if (req && req.latitude && req.longitude) {
      return `https://www.google.com/maps?q=${req.latitude},${req.longitude}`;
    }
    return null;
  };

  const getWhatsAppLink = (phone, text) => {
    if (!phone) return '#';
    let formatted = phone.replace(/[^0-9]/g, '');
    if (formatted.length === 10) formatted = '91' + formatted;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 bg-slate-50 p-2 sm:p-4 rounded-3xl min-h-[85vh]">
      
      {/* ── TOP NGO PROFILE HEADER ─────────────────────────────────────── */}
      {isNgoUser && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/20 shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                  {ngoUserDetail.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Verified Relief Partner
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>{isProfileExpanded ? 'Collapse Profile' : 'View Contact & Zones'}</span>
              {isProfileExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {/* COLLAPSIBLE DETAILS */}
          {isProfileExpanded && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Relief Officer
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{ngoUserDetail.contactPerson || 'Relief Desk'}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Official Contact Phone
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{ngoUserDetail.phone}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    Official Email
                  </span>
                  <p className="font-mono text-slate-700 text-xs truncate">{ngoUserDetail.email || 'N/A'}</p>
                </div>
              </div>

              {/* Operating Zones */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    Operating Zones:
                  </span>
                  {Array.isArray(ngoUserDetail.operatingZones) ? (
                    ngoUserDetail.operatingZones.map(zone => (
                      <span key={zone} className="px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-md font-bold text-[11px]">
                        {zone}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-md font-bold text-[11px]">
                      Assam State Relief Corridor
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
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors shrink-0"
                >
                  <span>Configure Operating Zones</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NAVIGATION MODULE TABS & EXTENDED FILTER TOOLBAR ─────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Module Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {currentUser.role !== 'VOLUNTEER' && (
              <>
                <button
                  onClick={() => { setQueueTab('ALL'); setReqCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    queueTab === 'ALL'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>ALL REQUESTS ({victimRequests.length})</span>
                </button>

                <button
                  onClick={() => { setQueueTab('CRITICAL_RESCUE'); setReqCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    queueTab === 'CRITICAL_RESCUE'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-slate-50 text-red-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <Siren className="w-4 h-4 shrink-0 animate-pulse text-red-500" />
                  <span>BOAT RESCUES ({criticalRequests.length})</span>
                </button>

                <button
                  onClick={() => { setQueueTab('SUPPLY_REQUESTS'); setReqCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    queueTab === 'SUPPLY_REQUESTS'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span>RELIEF DEMAND ({supplyRequests.length})</span>
                </button>

                <button
                  onClick={() => { setQueueTab('VOLUNTEERS'); setVolCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    queueTab === 'VOLUNTEERS'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>VOLUNTEERS ({volunteers.length})</span>
                </button>
              </>
            )}

            <button
              onClick={() => { setQueueTab('COLLABORATIONS'); setCollabCurrentPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                queueTab === 'COLLABORATIONS'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>CONTACT EXCHANGE ({collabRequests.length})</span>
            </button>
          </div>

          {queueTab !== 'VOLUNTEERS' && queueTab !== 'COLLABORATIONS' && (
            <button
              onClick={handleDownloadBulkPDF}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 shadow-sm transition-colors shrink-0"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>EXPORT DISPATCH PDF</span>
            </button>
          )}
        </div>

        {/* Extended Filter Controls Row (Search, Status, Urgency, Verification, District) */}
        {queueTab !== 'COLLABORATIONS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={queueTab === 'VOLUNTEERS' ? "Search name, vehicle..." : "Search name, village, PIN..."}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setReqCurrentPage(1); setVolCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 min-h-[38px]"
              />
            </div>

            {/* Status / Role Filter */}
            {queueTab === 'VOLUNTEERS' ? (
              <select
                value={filterVolRole}
                onChange={(e) => { setFilterVolRole(e.target.value); setVolCurrentPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 min-h-[38px]"
              >
                <option value="ALL">All Capabilities</option>
                <option value="Rescue Boat">Motorboat Rescue</option>
                <option value="Transport Service">4x4 Transport Vehicle</option>
                <option value="Truck">Goods Truck / Pickup</option>
                <option value="Medical">Medical Doctor / Paramedic</option>
              </select>
            ) : (
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setReqCurrentPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 min-h-[38px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Response</option>
                <option value="In Progress">Team Dispatched</option>
                <option value="Rescued">Safely Rescued</option>
              </select>
            )}

            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={(e) => { setFilterUrgency(e.target.value); setReqCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Urgency Levels</option>
              <option value="CRITICAL">🚨 Critical Rescue</option>
              <option value="HIGH">⚠️ High Priority Supply</option>
              <option value="NORMAL"> Standard Demand</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={filterVerification}
              onChange={(e) => { setFilterVerification(e.target.value); setReqCurrentPage(1); setVolCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">✓ Verified Only</option>
              <option value="UNVERIFIED">⏳ Pending Verification</option>
            </select>

            {/* District Filter */}
            <select
              value={filterDistrict}
              onChange={(e) => { setFilterDistrict(e.target.value); setReqCurrentPage(1); setVolCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Districts ({ASSAM_DISTRICTS.length})</option>
              {ASSAM_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

          </div>
        )}
      </div>

      {/* ── MODULE 1: EMERGENCY SOS & FOOD RELIEF CARDS GRID ─────────────── */}
      {(queueTab === 'CRITICAL_RESCUE' || queueTab === 'SUPPLY_REQUESTS' || queueTab === 'ALL') && (
        <>
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Relief Requests Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No requests match your selected search query or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedRequests.map((req) => {
                  const isUrgent = req.isUrgentRescue;
                  const isInProgress = req.status === 'In Progress';
                  const isRescued = req.status === 'Rescued' || req.status === 'Fulfilled';

                  return (
                    <div 
                      key={req.id} 
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {req.verified ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Verified
                              </span>
                            ) : isUrgent ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                🚨 Urgent Boat
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                📦 Supply Request
                              </span>
                            )}
                          </div>

                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            isRescued
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isInProgress
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {req.status || 'Pending'}
                          </span>
                        </div>

                        {/* Request Details */}
                        <div>
                          <h4 className="text-base font-black text-slate-900 leading-tight">
                            {req.familiesCount > 0 
                              ? `${req.familiesCount} Families Need Relief` 
                              : (req.peopleCount > 0 ? `${req.peopleCount} People Need Relief` : 'Relief Request')}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Contact: <strong className="text-slate-900">{req.name}</strong>
                          </p>
                        </div>

                        {/* Location */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-start gap-2 text-slate-700">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900">{req.district}: </span>
                              <span>{req.locationName || req.villageName}</span>
                              {req.pinCode && <span className="ml-1 text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">PIN: {req.pinCode}</span>}
                            </div>
                          </div>

                          {req.latitude && req.longitude && (
                            <a
                              href={getGoogleMapsUrl(req)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5 text-blue-600" />
                              <span>Open Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Needed Supplies */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relief Needed:</span>
                          <div className="flex flex-wrap gap-1">
                            {parseNeedsTags(req.needs).map((item, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {req.details && <ExpandableNotes text={req.details} dark={false} className="mt-1" />}

                      </div>

                      {/* Action Row */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {isAuthorizedUser ? (
                            <>
                              <a
                                href={`tel:${req.phone}`}
                                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Contact</span>
                              </a>

                              <a
                                href={getWhatsAppLink(req.phone, `Hello ${req.name}, this is ${ngoUserDetail.name} Relief Team regarding your request.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          ) : (
                            <div className="col-span-2 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 text-center">
                              Log in to view contact details
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {isAuthorizedUser && (
                            <button
                              onClick={() => setActiveLogRequest(req)}
                              className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Post Update</span>
                            </button>
                          )}

                          <button
                            onClick={() => setActiveTreeRequest(req)}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            <span>Updates</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROL BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">
                    Page {safeReqPage} of {totalReqPages} ({filteredRequests.length} Total Cases)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Per Page:</span>
                    <select
                      value={reqItemsPerPage}
                      onChange={(e) => { setReqItemsPerPage(Number(e.target.value)); setReqCurrentPage(1); }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value={6}>6 Cases</option>
                      <option value={12}>12 Cases</option>
                      <option value={24}>24 Cases</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                  <button
                    disabled={safeReqPage <= 1}
                    onClick={() => setReqCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    disabled={safeReqPage >= totalReqPages}
                    onClick={() => setReqCurrentPage(prev => Math.min(totalReqPages, prev + 1))}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* ── MODULE 2: LOGISTICS VOLUNTEERS DIRECTORY ───────────────────────── */}
      {queueTab === 'VOLUNTEERS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900">Logistics Volunteers Directory</h3>
              <p className="text-xs text-slate-500">Dispatch requests directly to motorboat operators, 4x4 vehicles, or paramedics.</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
              {filteredVolunteers.length} Active Volunteers
            </span>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Volunteers Match Filters</h3>
              <p className="text-xs text-slate-500">Try changing capability type or district dropdown.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedVolunteers.map(vol => (
                  <div key={vol.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                          {vol.roleType || 'Relief Helper'}
                        </span>
                        {vol.verified && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{vol.name}</h3>
                        <p className="text-xs text-slate-500">{vol.district} District</p>
                      </div>

                      {vol.offerings && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                          "{vol.offerings}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => {
                          setTargetVolForReq(vol);
                          setCollabMessage(`Hello ${vol.name}, our NGO (${ngoUserDetail.name}) needs your ${vol.roleType || 'logistics support'} for active flood relief operations in ${vol.district}.`);
                        }}
                        className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Request Logistics Assistance</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VOLUNTEERS PAGINATION CONTROL BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">
                    Page {safeVolPage} of {totalVolPages} ({filteredVolunteers.length} Total Volunteers)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Per Page:</span>
                    <select
                      value={volItemsPerPage}
                      onChange={(e) => { setVolItemsPerPage(Number(e.target.value)); setVolCurrentPage(1); }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value={6}>6 Items</option>
                      <option value={12}>12 Items</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                  <button
                    disabled={safeVolPage <= 1}
                    onClick={() => setVolCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    disabled={safeVolPage >= totalVolPages}
                    onClick={() => setVolCurrentPage(prev => Math.min(totalVolPages, prev + 1))}
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

      {/* ── MODULE 3: MUTUAL CONTACT EXCHANGE ─────────────────────────────── */}
      {queueTab === 'COLLABORATIONS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900">Mutual Contact Exchange Requests</h3>
              <p className="text-xs text-slate-500">When a volunteer accepts an NGO request, direct contact details unlock automatically for both parties.</p>
            </div>
            <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-bold">
              {collabRequests.length} Total Requests
            </span>
          </div>

          {collabRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Contact Requests Sent Yet</h3>
              <p className="text-xs text-slate-500">Go to the VOLUNTEERS tab to dispatch requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {paginatedCollabs.map(req => {
                  const isAccepted = req.status === 'ACCEPTED';
                  return (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-end gap-2 border-b border-slate-100 pb-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${isAccepted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {isAccepted ? '✓ UNLOCKED & ACCEPTED' : '⏳ PENDING RESPONSE'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <p className="text-slate-900"><strong>Target Volunteer:</strong> {req.volName} ({req.volDistrict})</p>
                        {req.sosLocation && <p className="text-slate-700"><strong>Location:</strong> {req.sosLocation}</p>}
                        {req.message && <p className="text-slate-600 italic">"{req.message}"</p>}
                      </div>

                      {isAccepted ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Direct Contact Details Unlocked:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Volunteer</span>
                              <p className="font-bold text-slate-900">{req.volName}</p>
                              <p className="font-mono text-blue-600">{req.volPhone}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">NGO Desk</span>
                              <p className="font-bold text-slate-900">{req.ngoName}</p>
                              <p className="font-mono text-blue-600">{req.ngoPhone}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <a
                              href={getWhatsAppLink(req.volPhone, `Hello ${req.volName}, this is ${req.ngoName} regarding logistics dispatch (${req.id}).`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <a
                              href={`tel:${req.volPhone.replace(/[^0-9]/g, '')}`}
                              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Phone</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                          Waiting for volunteer to accept. Phone details will unlock automatically.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* COLLABS PAGINATION BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 text-xs mb-36 sm:mb-6 pb-10 sm:pb-4">
                <span className="font-bold text-slate-700">
                  Page {safeCollabPage} of {totalCollabPages} ({collabRequests.length} Total Requests)
                </span>
                <div className="flex items-center justify-start sm:justify-center gap-2 w-full sm:w-auto pr-36 sm:pr-0">
                  <button
                    disabled={safeCollabPage <= 1}
                    onClick={() => setCollabCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    disabled={safeCollabPage >= totalCollabPages}
                    onClick={() => setCollabCurrentPage(prev => Math.min(totalCollabPages, prev + 1))}
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

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {/* Dispatch Logistics Request Modal */}
      {targetVolForReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Send Logistics Request</h3>
                  <p className="text-xs text-slate-500">To: <strong className="text-slate-900">{targetVolForReq.name}</strong> ({targetVolForReq.roleType})</p>
                </div>
              </div>
              <button onClick={() => setTargetVolForReq(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {collabSubmitSuccess ? (
              <div className="p-6 bg-slate-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Request Dispatched!</h4>
                <p className="text-xs text-slate-500">When accepted, phone details will unlock in your Mutual Contact Exchange panel.</p>
              </div>
            ) : (
              <form onSubmit={handleSendVolRequestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Associated SOS Distress Case (Optional)
                  </label>
                  <select
                    value={selectedSosForVol}
                    onChange={(e) => setSelectedSosForVol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select an active distress signal location...</option>
                    {victimRequests.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.isUrgentRescue ? 'BOAT' : 'FOOD'} - {r.district}: {r.name} ({r.locationName || r.villageName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dispatch Instructions / Details for Volunteer *
                  </label>
                  <textarea
                    rows={3}
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Specify number of boats/trucks needed or exact meeting point..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetVolForReq(null)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Configure Operating Zones Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Configure NGO Operating Zones</h3>
                  <p className="text-xs text-slate-500">Select where your organization operates in Assam.</p>
                </div>
              </div>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setZoneModalMode('WHOLE_ASSAM')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    zoneModalMode === 'WHOLE_ASSAM'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Whole Assam (All 35 Districts)
                </button>
                <button
                  type="button"
                  onClick={() => setZoneModalMode('CUSTOM_DISTRICTS')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    zoneModalMode === 'CUSTOM_DISTRICTS'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Specific Districts
                </button>
              </div>

              {zoneModalMode === 'CUSTOM_DISTRICTS' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-bold">Selected: {zoneModalDistricts.length} Districts</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setZoneModalDistricts(ASSAM_DISTRICTS)} className="text-blue-600 font-bold hover:underline">Select All</button>
                      <button type="button" onClick={() => setZoneModalDistricts([])} className="text-red-600 font-bold hover:underline">Clear</button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 border border-slate-200 p-2.5 rounded-xl bg-slate-50 text-xs">
                    {ASSAM_DISTRICTS.map(dist => {
                      const isSelected = zoneModalDistricts.includes(dist);
                      return (
                        <label key={dist} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setZoneModalDistricts(prev => [...prev, dist]);
                              else setZoneModalDistricts(prev => prev.filter(d => d !== dist));
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={isSelected ? "text-blue-600 font-bold" : ""}>{dist}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsZoneModalOpen(false)} className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveOperatingZones} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Operating Zones</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Relief Delivery Modal */}
      {activeLogRequest && (
        <DeliveryLogModal
          request={activeLogRequest}
          ngos={ngos}
          onClose={() => setActiveLogRequest(null)}
          onSubmitted={() => loadData()}
        />
      )}

      {/* View Impact Updates Tree Modal */}
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
