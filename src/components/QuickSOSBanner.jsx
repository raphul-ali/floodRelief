import React, { useState, useEffect } from 'react';
import { ShieldAlert, Navigation, Phone, CheckCircle2, Zap, AlertTriangle, Users, Hash, MapPin, AlertOctagon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { i18nService } from '../services/i18nService';
import DistrictSelect from './DistrictSelect';

export default function QuickSOSBanner({ onRequestSubmitted }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: 'Jorhat',
    villageName: '',
    pinCode: '',
    landmark: '',
    peopleCount: 1,
    familiesCount: 0,
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
        setLocationStatus(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('Type village name & PIN code below');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const totalPeopleCount = (parseInt(formData.peopleCount) || 0) || ((parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0));

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
        peopleCount: totalPeopleCount,
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
    <div className="bg-slate-800 border-2 border-red-500/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-app-card space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shadow-md">
                <Zap className="w-3 h-3 fill-white" /> LOW BATTERY OPTIMIZED (10-SEC SOS)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 uppercase">
              {i18nService.t('sosTitle', 'NEED EMERGENCY MOTORBOAT RESCUE? SEND SOS NOW')}
            </h2>
          </div>
        </div>

        <a
          href="tel:1070"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>{i18nService.t('govtHelpline', 'CALL ASDMA HELPLINE: 1070')}</span>
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
          
          {/* Inputs Grid: Phone & People Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1.5">
                Mobile Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98640 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border-2 border-amber-500/80 rounded-xl text-white font-black text-base focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Number of People Needing Rescue */}
            <div>
              <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1.5">
                Number of People Needing Rescue *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5 people stranded"
                  value={formData.peopleCount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-black text-base focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>

          </div>

          {/* GPS Location Button */}
          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all min-h-[42px] ${
                formData.latitude
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : formData.latitude ? 'GPS Pinned (Click to Refetch)' : 'Tap to Attach GPS Location'}</span>
            </button>
            {formData.latitude && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-1 bg-slate-800 rounded-lg shrink-0 border border-emerald-500/30">
                GPS Attached
              </span>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mb-8 sm:mb-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base uppercase tracking-wider shadow-lg border border-red-500 transition-all flex items-center justify-center gap-3 active:scale-98"
          >
            <ShieldAlert className="w-6 h-6" />
            <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}</span>
          </button>

        </form>
      )}

    </div>
  );
}
