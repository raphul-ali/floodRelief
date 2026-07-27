import React, { useState } from 'react';
import { ShieldAlert, Navigation, Phone, CheckCircle2, Zap, AlertTriangle, Users, Hash, MapPin, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import DistrictSelect from './DistrictSelect';

export default function QuickSOSBanner({ onRequestSubmitted }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: 'Jorhat',
    villageName: '',
    pinCode: '',
    landmark: '',
    malesCount: 1,
    femalesCount: 1,
    childrenCount: 0,
    latitude: null,
    longitude: null,
    isUrgentRescue: true,
    needs: ['Emergency Motorboat Rescue & Life Evacuation'],
    details: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // GPS Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS not supported');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setIsLocating(false);
        setLocationStatus(`✅ GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('⚠️ Type village name & PIN code below');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const totalPeopleCount = (parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone || !formData.villageName) {
      setErrorMessage("Please type your Mobile Phone Number and Village Name!");
      return;
    }

    setIsSubmitting(true);

    try {
      const locationAddressFormatted = `${formData.villageName}${formData.pinCode ? `, PIN: ${formData.pinCode}` : ''}${formData.landmark ? ` (${formData.landmark})` : ''}`;

      const saved = storageService.addVictimRequest({
        ...formData,
        name: formData.name || 'Emergency Victim',
        peopleCount: totalPeopleCount > 0 ? totalPeopleCount : 1,
        locationName: locationAddressFormatted,
        needs: ['Emergency Motorboat Rescue & Life Evacuation']
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onRequestSubmitted) onRequestSubmitted(saved);
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "Failed to send.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/50 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-slate-950" /> LOW BATTERY OPTIMIZED (10-SEC SOS)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              NEED EMERGENCY MOTORBOAT RESCUE? SEND SOS NOW
            </h2>
          </div>
        </div>

        <a
          href="tel:1070"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>CALL ASDMA HELPLINE: 1070</span>
        </a>
      </div>

      {/* Error / Rate Limit Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-red-950/90 border border-red-500 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {submittedSuccess ? (
        <div className="p-6 bg-slate-950 border border-emerald-500/50 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">SOS RESCUE SIGNAL SENT!</h3>
          <p className="text-xs text-slate-300">
            Emergency rescue teams have been notified. Keep your phone line free. Emergency contact: <strong className="text-amber-400">{formData.phone}</strong>.
          </p>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-4 py-2 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl"
          >
            Submit Another SOS
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Quick Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                1. Your Mobile Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98640 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border-2 border-amber-500/60 rounded-xl text-white font-black text-sm focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                2. Victim / Contact Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            {/* Searchable District Combobox */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                3. District (Jorhat & Sivasagar Top)
              </label>
              <DistrictSelect
                value={formData.district}
                onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))}
              />
            </div>

          </div>

          {/* Village Name, PIN Code, and Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                4. Village / Panchayat Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kamalabari Village"
                value={formData.villageName}
                onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                5. PIN Code (6-digit)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 785104"
                  value={formData.pinCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/[^0-9]/g, '') }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                6. GPS Location
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring...' : formData.latitude ? '✅ GPS Pinned' : '1-Tap Detect GPS'}</span>
              </button>
            </div>
          </div>

          {/* Demographics Row: Males, Females, Children */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">Demographics Breakdown</span>
              <span className="text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">Total: {totalPeopleCount}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">👨 Males</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.malesCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, malesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-extrabold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">👩 Females</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.femalesCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, femalesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-extrabold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">👶 Children</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.childrenCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-extrabold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Situation Notes */}
          <div>
            <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
              Water Level & Spot Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Water 4ft high, trapped on roof of house near dike"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base uppercase tracking-wider shadow-2xl shadow-red-950/80 transition-all flex items-center justify-center gap-3 active:scale-98 animate-urgent-pulse"
          >
            <ShieldAlert className="w-6 h-6" />
            <span>{isSubmitting ? 'TRANSMITTING SOS...' : '⚡ TRANSMIT EMERGENCY RESCUE SOS NOW'}</span>
          </button>

        </form>
      )}

    </div>
  );
}
