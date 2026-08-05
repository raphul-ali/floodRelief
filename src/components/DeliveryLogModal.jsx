import React, { useState } from 'react';
import { Package, X, CheckCircle2, AlertTriangle, Send, Phone, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { parseNeedsTags } from '../utils/helpers';

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
  const [peopleImpacted, setPeopleImpacted] = useState('');
  const [rescuedCount, setRescuedCount] = useState('');
  const [remainingCount, setRemainingCount] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [agreeTerms, setAgreeTerms] = useState(false);
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
    if (!agreeTerms) {
      setError('Please check the confirmation box to verify that your reported delivery details are genuine and true.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-slate-900 relative max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-y-auto">
        
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
              Target: <strong className="text-slate-900">{request.name}</strong>
            </p>
          </div>
        </div>



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
                  {/* Requested Needs Section for Target Request (Uncluttered, Spacious Card) */}
                  {request.needs && parseNeedsTags(request.needs).length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 mb-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          <span>Victim's Requested Supplies</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const tags = parseNeedsTags(request.needs);
                            setItemsDelivered(tags.join(', '));
                          }}
                          className="px-2.5 py-1 text-[11px] font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <span>Copy All</span>
                        </button>
                      </div>

                      {/* Item Tags Chips — Tap individual item to append */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {parseNeedsTags(request.needs).map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setItemsDelivered(prev => {
                                if (!prev.trim()) return item;
                                if (prev.includes(item)) return prev;
                                return `${prev}, ${item}`;
                              });
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                            title="Tap to add this item to delivery log"
                          >
                            <span className="text-blue-600 font-extrabold text-xs">+</span>
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Relief Supplies Delivered *
                    </label>
                    <textarea
                      value={itemsDelivered}
                      onChange={(e) => setItemsDelivered(e.target.value)}
                      placeholder="Specify exact supplies delivered for this request (e.g. 50 Cooked Food Packets, 20 Water Jars)..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 min-h-[90px]"
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
                <option value="In Progress">In Progress / Partially Completed</option>
                <option value="Completed">Completed (Rescued / Resolved)</option>
              </select>
            </div>

            {/* Terms & Truth Declaration Checkbox */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                  I confirm that the relief/rescue delivery updates reported above are 100% genuine, true, and verified on the ground.
                </span>
              </label>
              {!agreeTerms && (
                <p className="text-[11px] font-bold text-red-600 pl-6">
                  * Required: Please check this box to verify delivery details before posting.
                </p>
              )}
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
                disabled={isSubmitting || !agreeTerms}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
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
