import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, MapPin, Package, Clock, ShieldCheck,
  ChevronLeft, ChevronRight, ChevronDown, Users, Activity, Loader2,
  ArrowUpRight, Waves, Droplets, Compass, Filter
} from 'lucide-react';
import DeliveryUpdatesTreeModal from './DeliveryUpdatesTreeModal';
import { storageService } from '../services/storageService';
import { parseNeedsTags } from '../utils/helpers';
import RippleButton from './ui/RippleButton';
import ExpandableNotes from './ExpandableNotes';

/* ── Skeleton card ───────────────────────────────────────────────────────── */
function RequestCardSkeleton() {
  return (
    <div className="card-surface card-accent-neutral rounded-2xl overflow-hidden p-5 flex flex-col gap-4 min-h-[220px]">
      <div className="flex justify-between items-center">
        <div className="skeleton-shimmer h-5 w-28 rounded-full" />
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-6 w-3/4 rounded-lg" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton-shimmer h-6 w-16 rounded-full" />
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton-shimmer h-11 w-full rounded-xl mt-auto" />
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getCardAccent(isUrgent, isInProgress, status) {
  if (status === 'Rescued' || status === 'Fulfilled') return 'card-accent-resolved';
  if (isInProgress) return 'card-accent-progress';
  if (isUrgent)     return 'card-accent-urgent';
  return 'card-accent-neutral';
}

function getStatusChip(req, isUrgent, isInProgress) {
  if (req.verified)
    return <span className="status-chip status-chip-resolved"><ShieldCheck className="w-3 h-3" />Verified</span>;
  if (req.status === 'Rescued' || req.status === 'Fulfilled')
    return <span className="status-chip status-chip-resolved"><ShieldCheck className="w-3 h-3" />{req.status}</span>;
  if (isInProgress)
    return <span className="status-chip status-chip-progress"><Clock className="w-3 h-3" />In Progress</span>;
  if (isUrgent)
    return <span className="status-chip status-chip-urgent"><AlertTriangle className="w-3 h-3" />Emergency</span>;
  return <span className="status-chip status-chip-neutral">SOS Request</span>;
}

function getUrgencyChip(urgency) {
  switch(urgency) {
    case 'CRITICAL':
    case 'URGENT':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider"><AlertTriangle className="w-3 h-3" />{urgency}</span>;
    case 'HIGH':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 uppercase tracking-wider"><AlertTriangle className="w-3 h-3" />High</span>;
    case 'MEDIUM':
    case 'NEEDED':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">{urgency}</span>;
    case 'LOW':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">Low</span>;
    default:
      if (!urgency) return null;
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">{urgency}</span>;
  }
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function PublicRequestsList({ victimRequests = [], deliveryLogs: propDeliveryLogs, isLoading = false }) {
  const [currentPage, setCurrentPage]       = useState(1);
  const [activeTreeRequest, setActiveTreeRequest] = useState(null);
  const [deliveryLogs, setDeliveryLogs]     = useState(propDeliveryLogs || []);
  
  // Filter States
  const [filterType, setFilterType] = useState('ALL');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchLogs = () => {
      setDeliveryLogs(propDeliveryLogs ?? storageService.getDeliveryLogs());
    };
    fetchLogs();
    window.addEventListener('flood_data_changed', fetchLogs);
    return () => window.removeEventListener('flood_data_changed', fetchLogs);
  }, [propDeliveryLogs]);

  // Filtering Logic
  const filteredRequests = victimRequests.filter(req => {
    // 1. Type
    if (filterType === 'SUPPLY' && req.isUrgentRescue === true) return false;
    if (filterType === 'RESCUE' && req.isUrgentRescue !== true) return false;
    
    // 2. Urgency
    if (filterUrgency !== 'ALL' && req.urgency !== filterUrgency) return false;
    
    // 3. Status
    if (filterStatus !== 'ALL') {
      const statusStr = (req.status || '').toLowerCase();
      const isResolved = statusStr === 'rescued' || statusStr === 'fulfilled';
      const isInProgress = statusStr === 'in progress';
      const isActive = !isResolved && !isInProgress;

      if (filterStatus === 'Active' && !isActive) return false;
      if (filterStatus === 'In Progress' && !isInProgress) return false;
      if (filterStatus === 'Resolved' && !isResolved) return false;
    }
    return true;
  });

  const ITEMS_PER_PAGE = 12;
  const totalPages     = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="status-chip status-chip-info text-[10px] sm:text-xs py-0.5 sm:py-1">
            <Activity className="w-3 h-3" />
            Live Tracking
          </span>
          {victimRequests.length > 0 && (
            <span className="status-chip status-chip-neutral text-[10px] sm:text-xs py-0.5 sm:py-1">
              <Users className="w-3 h-3" />
              {victimRequests.length} Requests
            </span>
          )}
        </div>
        <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Public Rescue &amp; Relief Requests
        </h2>
        <p className="hidden sm:block text-sm text-slate-500 max-w-2xl leading-relaxed">
          Live tracking of all rescue and relief requests. Contact details are hidden to protect privacy.
          Registered NGOs and volunteers can view full details in the Partner Dashboard.
        </p>

        {/* Filters (Sticky on Mobile) */}
        <div className="sticky top-14 sm:top-0 sm:static z-30 bg-white/95 backdrop-blur-md sm:bg-transparent -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-4 sm:border-t sm:border-slate-100 sm:mt-4">
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm font-semibold shrink-0">
              <Filter className="w-4 h-4" /> Filters:
            </div>
            <div className="relative w-full">
              <select 
                value={filterType} 
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-lg pl-2.5 pr-8 sm:pl-3 sm:pr-8 py-2 sm:py-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-full appearance-none shadow-sm"
              >
                <option value="ALL">All Types</option>
                <option value="SUPPLY">Relief Supplies</option>
                <option value="RESCUE">Rescue Operations</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative w-full">
              <select 
                value={filterUrgency} 
                onChange={e => { setFilterUrgency(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-lg pl-2.5 pr-8 sm:pl-3 sm:pr-8 py-2 sm:py-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-full appearance-none shadow-sm"
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="NEEDED">Needed</option>
                <option value="LOW">Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full col-span-2 sm:col-span-1">
              <select 
                value={filterStatus} 
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-lg pl-2.5 pr-8 sm:pl-3 sm:pr-8 py-2 sm:py-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-full appearance-none shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active (Waiting)</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved / Fulfilled</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-flat animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
            <span>Connecting to live Help Axom network &amp; syncing request cards…</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RequestCardSkeleton key={i} />)}
          </div>
        </div>

      /* Empty */
      ) : victimRequests.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Requests Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            There are currently no active relief requests to display.
          </p>
        </div>

      /* Card grid */
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentRequests.map(req => {
              const isUrgent     = req.isUrgentRescue;
              const isInProgress = req.status === 'In Progress';
              const isResolved   = req.status === 'Rescued' || req.status === 'Fulfilled';
              const peopleTotal  = req.peopleCount || ((req.malesCount || 0) + (req.femalesCount || 0) + (req.childrenCount || 0));
              const accentClass  = getCardAccent(isUrgent, isInProgress, req.status);

              const cardBg = isResolved
                ? 'bg-emerald-50/80'
                : isInProgress
                ? 'bg-amber-50/80'
                : isUrgent
                ? 'bg-red-50/80'
                : 'bg-white';

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Paper Header / Title Row */}
                  <div className="p-4 border-b border-slate-100 flex items-start gap-3 bg-slate-50/60">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : isUrgent
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {isResolved ? <ShieldCheck className="w-5 h-5" /> : isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors truncate">
                          {req.familiesCount > 0
                            ? `${req.familiesCount} Families Need Help`
                            : peopleTotal > 0
                            ? `${peopleTotal} People Need Help`
                            : 'Relief Help Needed'}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {getStatusChip(req, isUrgent, isInProgress)}
                        {getUrgencyChip(req.urgency)}
                      </div>
                    </div>
                  </div>

                  {/* Paper Content Area */}
                  <div className="flex-1 p-4 space-y-3">
                    {/* Location & District */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">{req.locationName || req.villageName}</span>
                      <span className="ml-auto font-mono text-[10px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0 font-bold">
                        {req.district}
                      </span>
                    </div>

                    {/* Ground Condition Pill */}
                    {req.groundCondition && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {req.groundCondition === 'SUBMERGED' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-cyan-50 text-cyan-800 border border-cyan-300 px-3 py-1 rounded-full">
                            <Waves className="w-3 h-3 text-cyan-600 shrink-0" />
                            <span>Submerged (Boat Access Only)</span>
                          </span>
                        )}
                        {req.groundCondition === 'RECEDING' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-full">
                            <Droplets className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Water Receding (Heavy Mud)</span>
                          </span>
                        )}
                        {req.groundCondition === 'DRY_LAND' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full">
                            <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Dry Land (Road Accessible)</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Need tags */}
                    {(() => {
                      const tags = parseNeedsTags(req.needs);
                      return tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200/80">
                              {tag}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {req.details && (
                      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
                        <ExpandableNotes text={req.details} />
                      </div>
                    )}
                  </div>

                  {/* Paper Actions Bar */}
                  <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                      +91 ×××× {req.phone ? req.phone.slice(-4) : 'XXXX'}
                    </span>

                    <RippleButton
                      variant="emerald"
                      onClick={() => setActiveTreeRequest(req)}
                      className="py-2 px-4 rounded-full text-xs font-black tracking-wider uppercase gap-2 hover:shadow-md active:scale-95 transition-all shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span>View Updates</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80 shrink-0" />
                    </RippleButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 pt-6 pb-36 sm:pb-6 pl-4 sm:pl-0 pr-44 sm:pr-0 mb-12 sm:mb-0">
              <RippleButton
                variant="glass"
                darkRipple
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl disabled:opacity-30 min-h-[40px] min-w-[40px] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </RippleButton>

              <span className="text-xs font-bold text-slate-600 bg-white px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 shadow-flat min-h-[40px] flex items-center shrink-0">
                {currentPage} / {totalPages}
              </span>

              <RippleButton
                variant="glass"
                darkRipple
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2.5 rounded-xl disabled:opacity-30 min-h-[40px] min-w-[40px] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </RippleButton>
            </div>
          )}
        </>
      )}

      {/* Tree Modal */}
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
