import React, { useState } from 'react';
import { AlertTriangle, MapPin, Package, Clock, ShieldCheck, ChevronLeft, ChevronRight, Users } from 'lucide-react';

export default function PublicRequestsList({ victimRequests = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(victimRequests.length / itemsPerPage);
  const currentRequests = victimRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Public Rescue & Relief Requests</h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Live tracking of all rescue and relief requests. Contact details are hidden to protect privacy. Registered NGOs and volunteers can view full details in the Partner Dashboard to respond and deliver aid.
        </p>
      </div>

      {victimRequests.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
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
                <div key={req.id} className={`bg-slate-900/80 border rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all ${
                  isUrgent ? 'border-red-500/40 hover:border-red-400' : 'border-amber-500/30 hover:border-amber-400'
                }`}>
                  <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b ${
                    isUrgent ? 'bg-red-950/40 border-red-900/40 text-red-300' : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {isUrgent ? <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> : <Package className="w-4 h-4 text-amber-500" />}
                      <span className="uppercase">{isUrgent ? 'EMERGENCY BOAT RESCUE' : 'RELIEF SUPPLY REQUEST'}</span>
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
                  
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-black text-white">{req.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">
                          Requested by: {req.requestedByRole === 'CITIZEN' ? '👤 Citizen' : req.requestedByRole === 'NGO' ? '🏛️ NGO' : '🚚 Volunteer'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 w-fit">
                      <Users className="w-3.5 h-3.5" />
                      <span>{totalPeopleCount} People Affected</span>
                    </div>
                    
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
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {req.details && (
                      <div className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        "{req.details}"
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono font-bold bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                      <span>Phone: +91 ******{req.phone ? req.phone.slice(-4) : 'XXXX'}</span>
                    </div>
                    {req.verified && (
                      <span className="flex items-center gap-1 text-emerald-400 font-black bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-900">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
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
    </div>
  );
}
