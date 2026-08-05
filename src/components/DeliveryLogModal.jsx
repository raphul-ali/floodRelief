import React, { useState } from 'react';
import { Package, X, CheckCircle2, AlertTriangle, Send, Phone, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export default function DeliveryLogModal({ request, ngos = [], onClose, onSubmitted }) {
  const currentUser = authService.getCurrentUser();
  const isNgoAuthenticated = Boolean(currentUser.role === 'NGO' && currentUser.user);

  const [deliveredBy, setDeliveredBy] = useState(
    isNgoAuthenticated ? currentUser.user.name : (ngos[0]?.name || '')
  );
  const [volunteerPhone, setVolunteerPhone] = useState(
    isNgoAuthenticated ? (currentUser.user.phone || '') : ''
  );
  const [itemsDelivered, setItemsDelivered] = useState('');
  const [supplyQuantities, setSupplyQuantities] = useState({});
  const [peopleImpacted, setPeopleImpacted] = useState('');
  const [rescuedCount, setRescuedCount] = useState('');
  const [remainingCount, setRemainingCount] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRescue = request.isUrgentRescue || request.is_urgent_rescue;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!deliveredBy.trim()) {
      setError('Please provide your NGO or Volunteer Organization Name.');
      return;
    }
    if (!volunteerPhone.trim()) {
      setError('Please provide a contact phone number for verification.');
      return;
    }
    if (!isRescue && !itemsDelivered.trim()) {
      setError('Please specify the exact items delivered (e.g. 50 food packets, 10 water jars).');
      return;
    }
    if (isRescue && !rescuedCount.toString().trim()) {
      setError('Please enter the number of people rescued.');
      return;
    }
    if (isRescue && !remainingCount.toString().trim()) {
      setError('Please enter the number of people remaining. Enter 0 if everyone was rescued.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isAutoVerified = isNgoAuthenticated;

      storageService.submitDeliveryLog({
        requestId: request.id,
        recipientName: request.name,
        district: request.district,
        deliveredBy,
        volunteerPhone,
        itemsDelivered: isRescue ? null : itemsDelivered,
        peopleImpacted: isRescue ? null : (peopleImpacted || `${request.peopleCount || 1} People`),
        rescuedCount: isRescue ? rescuedCount : null,
        remainingCount: isRescue ? remainingCount : null,
        deliveryNotes,
        statusUpdate,
        verifiedBy: isAutoVerified ? `Verified NGO: ${currentUser.user.name}` : null
      }, isAutoVerified);

      if (isAutoVerified) {
        setSuccessMsg('Verified NGO Dispatch Logged! Your delivery has been auto-verified and published directly to the live request timeline.');
      } else {
        setSuccessMsg('Relief delivery log submitted! The Admin Verification Team will connect with you via WhatsApp for photo verification before publishing.');
      }

      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit delivery log.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-900 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className={`p-3 rounded-2xl border ${isRescue ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              {isRescue ? 'Post Rescue Update' : 'Post Relief Update'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Target: <strong className="text-slate-900">{request.name}</strong> ({request.id})
            </p>
          </div>
        </div>

        {/* Info Banner */}
        {isNgoAuthenticated ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800">Verified NGO Direct Dispatch</p>
              <p className="text-emerald-700 mt-0.5">
                Logged in as <strong className="underline">{currentUser.user.name}</strong>. Your relief updates will be <strong className="font-bold">auto-published directly</strong> to the impact tree.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800">Manual Admin Verification Active</p>
              <p className="text-blue-700 mt-0.5">
                Public submissions are reviewed by the Admin Control Room before publishing.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NGO Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NGO / Volunteer Organization Name *
              </label>
              <input
                type="text"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="e.g. Red Cross Assam / Brahmaputra Relief Team"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                required
              />
            </div>

            {/* Volunteer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Volunteer Contact / WhatsApp Number *</span>
                <span className="text-[10px] text-slate-500 font-semibold">(For verification audit)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder="+91 98640 00000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>

            {/* Conditional Fields */}
            {isRescue ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    People Rescued *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rescuedCount}
                    onChange={(e) => setRescuedCount(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    required={isRescue}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    People Remaining *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={remainingCount}
                    onChange={(e) => setRemainingCount(e.target.value)}
                    placeholder="e.g. 0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    required={isRescue}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Relief Supplies Delivered *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const std = {
                            'Cooked Food Packets': 50,
                            'Water Jars (20L)': 20,
                            'Dry Ration Kits (Rice/Dal)': 10,
                            'Tarpaulin (Tirpal) Sheets': 15,
                            'Hygiene & Sanitation Kits': 10
                          };
                          setSupplyQuantities(std);
                          const str = Object.entries(std).map(([k, v]) => `${v} ${k}`).join(', ');
                          setItemsDelivered(str);
                        }}
                        className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>⚡ Prefill Standard Package</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSupplyQuantities({});
                          setItemsDelivered('');
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                      >
                        Reset All to 0
                      </button>
                    </div>
                  </div>

                  {/* Quantity Input Grid */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Enter quantities delivered (0 = none):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {[
                        { name: 'Cooked Food Packets', unit: 'Packets' },
                        { name: 'Water Jars (20L)', unit: 'Jars' },
                        { name: 'Dry Ration Kits (Rice/Dal)', unit: 'Kits' },
                        { name: 'Tarpaulin (Tirpal) Sheets', unit: 'Sheets' },
                        { name: 'Hygiene & Sanitation Kits', unit: 'Kits' },
                        { name: 'Medical & ORS Kits', unit: 'Kits' },
                        { name: 'Mosquito Nets', unit: 'Nets' },
                        { name: 'Baby Food & Milk Cans', unit: 'Cans' }
                      ].map(({ name, unit }) => {
                        const count = supplyQuantities[name] || 0;

                        const updateQty = (newVal) => {
                          const validVal = Math.max(0, parseInt(newVal) || 0);
                          const updated = { ...supplyQuantities, [name]: validVal };
                          setSupplyQuantities(updated);

                          const selectedItems = Object.entries(updated)
                            .filter(([_, c]) => c > 0)
                            .map(([n, c]) => `${c} ${n}`);

                          setItemsDelivered(selectedItems.join(', '));
                        };

                        return (
                          <div
                            key={name}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                              count > 0 ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className={`font-bold truncate text-[11px] ${count > 0 ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium">{unit}</p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQty(count - 1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center cursor-pointer active:scale-95"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={count}
                                onChange={(e) => updateQty(e.target.value)}
                                className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-extrabold text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                              />
                              <button
                                type="button"
                                onClick={() => updateQty(count + 1)}
                                className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Compiled Delivery Summary (Generated from item quantities above):
                    </label>
                    <textarea
                      value={itemsDelivered}
                      readOnly
                      placeholder="Enter quantities above to build delivery log..."
                      rows="2"
                      className="w-full bg-slate-100/90 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 font-semibold focus:outline-none cursor-not-allowed resize-none"
                      required={!isRescue}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    People Impacted / Beneficiaries
                  </label>
                  <input
                    type="text"
                    value={peopleImpacted}
                    onChange={(e) => setPeopleImpacted(e.target.value)}
                    placeholder={`e.g. ${request.peopleCount || 50} People / 20 Families`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRescue ? 'Rescue Notes (Optional)' : 'Delivery Notes & Description'}
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={isRescue ? "e.g. Rescued 5 individuals by motorboat." : "e.g. Handed over directly to relief camp."}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Request Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recommend Request Status Update
              </label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="In Progress">In Progress (Partially Fulfilled)</option>
                <option value="Rescued">Rescued / Fully Resolved</option>
              </select>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isNgoAuthenticated ? 'POST INSTANT UPDATE' : 'POST UPDATE'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
