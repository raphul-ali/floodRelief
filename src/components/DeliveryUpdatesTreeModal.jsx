import React from 'react';
import { X, Package, CheckCircle2, Clock, MapPin, Users, Building2, ShieldCheck } from 'lucide-react';

export default function DeliveryUpdatesTreeModal({ request, deliveryLogs = [], onClose }) {
  if (!request) return null;

  // Filter logs for this specific request ID or district matching
  const requestLogs = deliveryLogs.filter(log => log.requestId === request.id || (log.district === request.district && log.recipientName === request.name));
  const isRescue = request.isUrgentRescue || request.is_urgent_rescue;

  const totalDeliveries = requestLogs.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-100 relative max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                {isRescue ? "Emergency Rescue & Impact Tree" : "Relief Delivery & Impact Tree"}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                📍 {request.district}: {request.villageName || request.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impact Overview Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Target Beneficiaries</span>
            <p className="text-xs sm:text-sm font-black text-amber-300">👥 {request.peopleCount || 1} People</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">{isRescue ? 'Rescue Operations Logged' : 'Dispatches Logged'}</span>
            <p className="text-xs sm:text-sm font-black text-emerald-400">{isRescue ? '🛟' : '📦'} {totalDeliveries} {isRescue ? 'Operations' : 'Deliveries'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">{isRescue ? 'Rescue Status' : 'Delivery Status'}</span>
            <p className="text-xs font-black text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${request.status === 'Rescued' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              {request.status === 'Rescued' ? 'Fulfilled' : request.status || 'Active Demand'}
            </p>
          </div>
        </div>

        {/* Visual Timeline Tree Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 min-h-[220px]">
          
          {/* Root Tree Node: Request Origin */}
          <div className="relative pl-6 pb-3 border-l-2 border-dashed border-amber-500/50">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center"></div>
            <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-1 text-xs shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[10px]">
                  📌 Distress Relief Demand Registered
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                  {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Active'}
                </span>
              </div>
              <p className="font-black text-white text-xs sm:text-sm">{request.name}</p>
              <p className="text-slate-300">Needs: {Array.isArray(request.needs) ? request.needs.join(', ') : request.needs}</p>
            </div>
          </div>

          {/* Delivery Branch Nodes */}
          {requestLogs.length > 0 ? (
            requestLogs.map((log, index) => (
              <div key={log.logId || index} className="relative pl-6 border-l-2 border-emerald-500/60 pb-4 last:border-l-0">
                {/* Branch Node Bullet */}
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg font-black text-[10px]">
                  ✓
                </div>

                {/* Delivery Node Card */}
                <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-2.5 text-xs shadow-xl hover:border-emerald-400 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-black text-white text-xs sm:text-sm">{log.deliveredBy}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified NGO Dispatch
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    {log.rescuedCount !== undefined && log.rescuedCount !== null ? (
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">🛟</span>
                          <div>
                            <strong className="text-white">People Rescued:</strong>
                            <p className="text-emerald-400 font-bold mt-0.5 text-sm">{log.rescuedCount}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <strong className="text-white">People Remaining:</strong>
                            <p className="text-amber-400 font-bold mt-0.5 text-sm">{log.remainingCount}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {log.itemsDelivered && (
                          <div className="flex items-start gap-2">
                            <Package className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white">Supplies Delivered:</strong>
                              <p className="text-amber-200 font-bold mt-0.5 text-xs">{log.itemsDelivered}</p>
                            </div>
                          </div>
                        )}

                        {log.peopleImpacted && (
                          <div className="flex items-center gap-2 text-xs pt-1">
                            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span><strong className="text-white">People Impacted / Beneficiaries:</strong> <span className="text-cyan-300 font-black">{log.peopleImpacted}</span></span>
                          </div>
                        )}
                      </>
                    )}

                    {log.deliveryNotes && (
                      <div className="p-2.5 bg-slate-900 rounded-xl text-[11px] italic text-slate-300 border border-slate-800">
                        "{log.deliveryNotes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-900">
                    <span>Dispatch Time: {new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold">Status: {log.statusUpdate || 'Delivered'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-6 pt-1">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2 text-xs">
                <Clock className="w-7 h-7 text-amber-400 mx-auto animate-pulse" />
                <p className="font-bold text-white text-sm">{isRescue ? 'No Rescue Updates Logged Yet' : 'No Delivery Updates Logged Yet'}</p>
                <p className="text-slate-400 max-w-sm mx-auto">
                  {isRescue ? 'Verified NGOs and rescue teams will log evacuation updates here as they happen.' : 'Verified NGOs & logistics volunteers will log supply dispatches for this area here as aid is delivered.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shrink-0 min-h-[44px]"
        >
          {isRescue ? 'Close Rescue Tree' : 'Close Delivery Tree'}
        </button>

      </div>
    </div>
  );
}
