import React, { useState } from 'react';
import { Package, X, CheckCircle2, AlertTriangle, Send, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function DeliveryLogModal({ request, ngos = [], onClose, onSubmitted }) {
  const [deliveredBy, setDeliveredBy] = useState(ngos[0]?.name || '');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [itemsDelivered, setItemsDelivered] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!itemsDelivered.trim()) {
      setError('Please specify the exact items delivered (e.g. 50 food packets, 10 water jars).');
      return;
    }

    try {
      setIsSubmitting(true);
      storageService.submitDeliveryLog({
        requestId: request.id,
        recipientName: request.name,
        district: request.district,
        deliveredBy,
        volunteerPhone,
        itemsDelivered,
        deliveryNotes,
        statusUpdate
      });

      setSuccessMsg('✅ Relief delivery log submitted! The Admin Control Room will connect with you via WhatsApp for photo verification before publishing to the live timeline.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              Log Relief Delivery
            </h3>
            <p className="text-xs text-slate-400">
              Update supply delivery status for <span className="text-amber-300 font-bold">{request.name}</span> ({request.id})
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-950/70 border border-blue-500/30 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-200">Manual Admin Verification Workflow</p>
            <p className="text-slate-400 mt-0.5">
              Once submitted, our Admin Control Room will connect with your phone via WhatsApp to receive geotagged delivery images before approving the timeline log.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Delivered By */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                NGO / Volunteer Organization Name *
              </label>
              <input
                type="text"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="e.g. Red Cross Assam / Brahmaputra Relief Team"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Volunteer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Volunteer WhatsApp / Phone Number *</span>
                <span className="text-[10px] text-amber-400 font-semibold">(For WhatsApp Geo-tag photo confirmation)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder="+91 98640 00000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Items Delivered */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Relief Supplies Delivered *
              </label>
              <textarea
                value={itemsDelivered}
                onChange={(e) => setItemsDelivered(e.target.value)}
                placeholder="e.g. 30 Water Jars (20L), 100 Cooked Food Packets, 1 Paramedic First Aid Kit"
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Delivery Notes & Location Description
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Handed over directly to school shelter manager. Water level dropped by 1 ft."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Updated Request Status */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Recommend Updated Request Status
              </label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="In Progress">🟡 In Progress (Partially Fulfilled - More supplies/rescue needed)</option>
                <option value="Rescued">🟢 Rescued / Fully Resolved (All needs met)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>SUBMIT FOR ADMIN VERIFICATION</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
