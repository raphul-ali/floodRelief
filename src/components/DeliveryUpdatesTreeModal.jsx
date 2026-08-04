import React from 'react';
import { X, Package, CheckCircle2, Clock, MapPin, Users, Building2, ShieldCheck } from 'lucide-react';
import ExpandableNotes from './ExpandableNotes';

export default function DeliveryUpdatesTreeModal({ request, deliveryLogs = [], onClose }) {
  if (!request) return null;

  // Strictly filter logs for this specific request ID
  const requestLogs = deliveryLogs.filter(log => log && request && log.requestId === request.id);
  const isRescue = request.isUrgentRescue || request.is_urgent_rescue;

  const totalDeliveries = requestLogs.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-900 relative max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {isRescue ? "Rescue Progress & Updates" : "Relief Progress & Updates"}
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                {request.district}: {request.villageName || request.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impact Overview Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">Target Beneficiaries</span>
            <p className="text-xs sm:text-sm font-black text-slate-900">{request.peopleCount || 1} People</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">{isRescue ? 'Rescue Operations Logged' : 'Dispatches Logged'}</span>
            <p className="text-xs sm:text-sm font-black text-emerald-700">{totalDeliveries} {isRescue ? 'Operations' : 'Deliveries'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">{isRescue ? 'Rescue Status' : 'Delivery Status'}</span>
            <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${request.status === 'Rescued' || request.status === 'Fulfilled' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></span>
              {request.status || 'Active Demand'}
            </p>
          </div>
        </div>

        {/* Visual Timeline Tree Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 min-h-[220px]">
          
          {/* Root Tree Node: Request Origin */}
          <div className="relative pl-6 pb-3 border-l-2 border-dashed border-amber-400">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center"></div>
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1 text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider text-[10px]">
                  Distress Relief Demand Registered
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                  {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Active'}
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs sm:text-sm">{request.name}</p>
              <p className="text-slate-700 font-medium">Needs: {Array.isArray(request.needs) ? request.needs.join(', ') : request.needs}</p>
            </div>
          </div>

          {/* Delivery Branch Nodes */}
          {requestLogs.length > 0 ? (
            requestLogs.map((log, index) => (
              <div key={log.logId || index} className="relative pl-6 border-l-2 border-emerald-500 pb-4 last:border-l-0">
                {/* Branch Node Bullet */}
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md font-black text-[10px]">
                  ✓
                </div>

                {/* Delivery Node Card */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 text-xs shadow-md hover:border-emerald-500 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-black text-slate-900 text-xs sm:text-sm">{log.deliveredBy}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      Verified NGO Dispatch
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-800">
                    {log.rescuedCount !== undefined && log.rescuedCount !== null ? (
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div>
                            <strong className="text-slate-900">People Rescued:</strong>
                            <p className="text-emerald-700 font-black mt-0.5 text-sm">{log.rescuedCount}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                          <div>
                            <strong className="text-slate-900">People Remaining:</strong>
                            <p className="text-amber-700 font-black mt-0.5 text-sm">{log.remainingCount}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {log.itemsDelivered && (
                          <div className="flex items-start gap-2">
                            <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-900">Supplies Delivered:</strong>
                              <p className="text-slate-900 font-black mt-0.5 text-xs">{log.itemsDelivered}</p>
                            </div>
                          </div>
                        )}

                        {log.peopleImpacted && (
                          <div className="flex items-center gap-2 text-xs pt-1">
                            <Users className="w-4 h-4 text-blue-600 shrink-0" />
                            <span><strong className="text-slate-900">People Impacted / Beneficiaries:</strong> <span className="text-blue-700 font-black">{log.peopleImpacted}</span></span>
                          </div>
                        )}
                      </>
                    )}

                    {log.deliveryNotes && (
                      <ExpandableNotes text={log.deliveryNotes} />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Dispatch Time: {new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-emerald-700 font-bold">Status: {log.statusUpdate || 'Delivered'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-6 pt-1">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
                <Clock className="w-7 h-7 text-amber-500 mx-auto animate-pulse" />
                <p className="font-bold text-slate-900 text-sm">{isRescue ? 'No Rescue Updates Logged Yet' : 'No Delivery Updates Logged Yet'}</p>
                <p className="text-slate-600 max-w-sm mx-auto">
                  {isRescue ? 'Verified NGOs and rescue teams will log evacuation updates here as they happen.' : 'Verified NGOs & logistics volunteers will log supply dispatches for this area here as aid is delivered.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs sm:text-sm transition-colors shrink-0 min-h-[44px] shadow-md cursor-pointer"
        >
          {isRescue ? 'Close Rescue Tree' : 'Close Delivery Tree'}
        </button>

      </div>
    </div>
  );
}
