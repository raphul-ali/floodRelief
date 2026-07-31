import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Package, Clock, ShieldCheck, ChevronLeft, ChevronRight, Users, Activity, Loader2 } from 'lucide-react';
import DeliveryUpdatesTreeModal from './DeliveryUpdatesTreeModal';
import { storageService } from '../services/storageService';

function RequestCardSkeleton() {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-pulse space-y-4 p-4 min-h-[220px] flex flex-col justify-between">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
        <div className="h-4 w-36 bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-16 bg-slate-800 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-800 rounded-lg"></div>
        <div className="h-3 w-1/2 bg-slate-800/60 rounded-md"></div>
      </div>
      <div className="h-10 w-full bg-slate-950 rounded-xl border border-slate-800/80"></div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-800 rounded-lg"></div>
        <div className="h-5 w-20 bg-slate-800 rounded-lg"></div>
        <div className="h-5 w-24 bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-9 w-full bg-slate-800/70 rounded-xl"></div>
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
            <span>Connecting to live Assam Flood Relief network & syncing latest request cards...</span>
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
              const totalPeopleCount = req.peopleCount || ((req.malesCount || 0) + (req.femalesCount || 0) + (req.childrenCount || 0));
              
              return (
                <div key={req.id} className={`bg-slate-900/95 sm:bg-slate-800 border rounded-[22px] sm:rounded-2xl overflow-hidden shadow-app-card flex flex-col justify-between active:scale-[0.99] sm:active:scale-100 transition-all ${
                  isUrgent ? 'border-red-500/40 hover:border-red-400' : 'border-amber-500/30 hover:border-amber-400'
                }`}>
                  <div className={`px-3.5 sm:px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b ${
                    isUrgent ? 'bg-red-950/40 border-red-900/40 text-red-300' : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isUrgent ? <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> : <Package className="w-4 h-4 text-amber-500" />}
                      <span className="uppercase text-[11px] sm:text-xs font-black">{isUrgent ? 'EMERGENCY BOAT RESCUE' : 'RELIEF SUPPLY REQUEST'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-black ${
                      req.status === 'Rescued'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : req.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="p-3.5 sm:p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-black text-white text-base">{req.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {(req.familiesCount > 0 || totalPeopleCount > 0) && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-900/40 w-fit">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>
                          {req.familiesCount > 0 ? `${req.familiesCount} Families Need Help` : `${totalPeopleCount} People Need Help`}
                        </span>
                      </div>
                    )}
                    
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-amber-400">{req.district}: </span>
                          <span className="font-semibold">{req.locationName || req.villageName}</span>
                        </div>
                      </div>
                    </div>

                    {Array.isArray(req.needs) && req.needs.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {req.needs.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-bold bg-slate-950 text-slate-300 rounded-lg border border-slate-800">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {req.details && (
                      <div className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        "{req.details}"
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span>Phone: +91 ******{req.phone ? req.phone.slice(-4) : 'XXXX'}</span>
                      </div>
                      {req.verified && (
                        <span className="flex items-center gap-1 text-emerald-400 font-black bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-900/60">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTreeRequest(req)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>SEE UPDATES & IMPACT TREE</span>
                    </button>
                  </div>
                </div>
              )
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
