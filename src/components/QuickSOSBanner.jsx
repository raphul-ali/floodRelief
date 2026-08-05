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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-amber-50 text-amber-700 border border-amber-200 font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> LOW BATTERY OPTIMIZED (10-SEC SOS)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              {i18nService.t('sosTitle', 'NEED EMERGENCY MOTORBOAT RESCUE? SEND SOS NOW')}
            </h2>
          </div>
        </div>

        <a
          href="tel:1070"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>{i18nService.t('govtHelpline', 'CALL ASDMA HELPLINE: 1070')}</span>
        </a>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {submittedSuccess ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">SOS RESCUE SIGNAL SENT!</h3>
          <p className="text-xs text-slate-600">
            Emergency rescue teams have been notified. Keep your phone line free. Emergency contact:{' '}
            <strong className="text-slate-900">{formData.phone}</strong>.
          </p>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition-colors"
          >
            Submit Another SOS
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Inputs Grid: Phone & People Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98640 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">People Needing Rescue *</label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5 people stranded"
                  value={formData.peopleCount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, peopleCount: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Village Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Village / Area Name *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Kamalabari Village, Majuli"
                value={formData.villageName}
                onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </div>

          {/* GPS Location Button */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> GPS Location (Optional but Recommended)
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 border min-h-[40px] cursor-pointer ${
                formData.latitude
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>
                {isLocating ? 'Acquiring GPS...' : formData.latitude
                  ? `GPS Attached ✓ (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})`
                  : 'Tap to Attach GPS Location'}
              </span>
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mb-8 sm:mb-0 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{isSubmitting ? 'SUBMITTING...' : 'SEND EMERGENCY SOS'}</span>
          </button>

        </form>
      )}

    </div>
  );
}


