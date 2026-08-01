import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Package, Clock, ShieldCheck, ChevronLeft, ChevronRight, Users, Activity, Loader2 } from 'lucide-react';
import DeliveryUpdatesTreeModal from './DeliveryUpdatesTreeModal';
import { storageService } from '../services/storageService';
import { parseNeedsTags } from './VictimRequestForm';

function RequestCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md animate-pulse space-y-4 p-5 min-h-[220px] flex flex-col justify-between">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
        <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
        <div className="h-6 w-20 bg-slate-100 rounded-lg"></div>
        <div className="h-6 w-24 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
    </div>
  );
}

export default function PublicRequestsList({ victimRequests = [], deliveryLogs: propDeliveryLogs, isLoading = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTreeRequest, setActiveTreeRequest] = useState(null);
  const [deliveryLogs, setDeliveryLogs] = useState(propDeliveryLogs || []);

  useEffect(() => {
    const fetchLogs = () => {
      if (propDeliveryLogs) {
        setDeliveryLogs(propDeliveryLogs);
      } else {
        setDeliveryLogs(storageService.getDeliveryLogs());
      }
    };
    fetchLogs();
    window.addEventListener('flood_data_changed', fetchLogs);
    return () => window.removeEventListener('flood_data_changed', fetchLogs);
  }, [propDeliveryLogs]);

  const itemsPerPage = 12;

  const totalPages = Math.ceil(victimRequests.length / itemsPerPage);
  const currentRequests = victimRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Public Rescue & Relief Requests</h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Live tracking of all rescue and relief requests. Contact details are hidden to protect privacy. Registered NGOs and volunteers can view full details in the Partner Dashboard to respond and deliver aid.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-bold text-amber-300 bg-amber-950/40 p-3.5 rounded-2xl border border-amber-900/40 shadow-lg animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <span>Connecting to live Help Axom network & syncing latest request cards...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <RequestCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      ) : victimRequests.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Requests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no active relief requests to display.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentRequests.map(req => {
              const isUrgent = req.isUrgentRescue;
              const isInProgress = req.status === 'In Progress';
              const totalPeopleCount = req.peopleCount || ((req.malesCount || 0) + (req.femalesCount || 0) + (req.childrenCount || 0));
              
              // Light card color theme matching design mockup
              const cardBgStyle = isInProgress
                ? 'bg-[#fef3c7] border-[#fde68a] text-slate-900 shadow-md'
                : isUrgent
                ? 'bg-[#fff1f2] border-[#fecdd3] text-slate-900 shadow-md'
                : 'bg-white border-slate-200 text-slate-900 shadow-md';

              return (
                <div key={req.id} className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-lg ${cardBgStyle}`}>
                  <div className="space-y-3">
                    
                    {/* Top Status Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {req.verified ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#16a34a] text-white shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-sm">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Emergency
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            SOS Request
                          </span>
                        )}
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                        req.status === 'Rescued' || req.status === 'Fulfilled'
                          ? 'bg-emerald-700 text-white'
                          : isInProgress
                          ? 'bg-[#d97706] text-white font-black'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}>
                        {req.status || 'Pending'}
                      </span>
                    </div>
                    
                    {/* Title: Family / People Count & (District) */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {req.familiesCount > 0 
                          ? `${req.familiesCount} Families Need Help` 
                          : totalPeopleCount > 0 
                          ? `${totalPeopleCount} People Need Help` 
                          : 'Relief Help Needed'}
                        <span className="text-slate-700 font-bold ml-1">({req.district})</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{req.locationName || req.villageName}</span>
                        {req.pinCode && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-1">PIN: {req.pinCode}</span>}
                      </p>
                    </div>

                    {/* Needs / Supplies List */}
                    {(() => {
                      const tags = parseNeedsTags(req.needs);
                      return tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {tags.map((item, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs font-extrabold bg-slate-100 text-slate-800 rounded-lg border border-slate-300 shadow-2xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                    
                    {/* Details / Notes */}
                    {req.details && (
                      <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                        "{req.details}"
                      </p>
                    )}
                  </div>
                  
                  {/* Card Footer: Phone & Impact Tree Button */}
                  <div className="pt-3 mt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Phone: +91 ******{req.phone ? req.phone.slice(-4) : 'XXXX'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTreeRequest(req)}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-emerald-200" />
                      <span>SEE UPDATES & IMPACT TREE</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 bg-slate-900 border border-slate-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-black text-slate-300 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 bg-slate-900 border border-slate-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
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
