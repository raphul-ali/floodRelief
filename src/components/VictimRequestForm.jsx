import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Users, Phone, CheckCircle, Navigation, HeartHandshake, ShieldCheck, Hash, UserCheck, AlertOctagon, AlertTriangle, Siren, ShieldAlert } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import DistrictSelect from './DistrictSelect';
import { i18nService } from '../services/i18nService';

export const parseNeedsTags = (needs) => {
  if (!needs) return [];
  let rawList = Array.isArray(needs) ? needs : [needs];
  const tags = [];
  rawList.forEach(item => {
    if (typeof item === 'string') {
      item.split(/[,;\n]+/).forEach(part => {
        const trimmed = part.trim();
        if (trimmed) tags.push(trimmed);
      });
    }
  });
  return tags;
};

// Removed SUPPLY_NEEDS array

export default function VictimRequestForm({ onClose, onRequestSubmitted, initialUrgent = true }) {
  const [, setLangState] = useState(i18nService.getLanguage());

  useEffect(() => {
    const handleLangChange = () => setLangState(i18nService.getLanguage());
    window.addEventListener('flood_lang_changed', handleLangChange);
    return () => window.removeEventListener('flood_lang_changed', handleLangChange);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    malesCount: 0,
    femalesCount: 0,
    childrenCount: 0,
    familiesCount: 0,
    district: '',
    villageName: '',
    pinCode: '',
    landmark: '',
    latitude: null,
    longitude: null,
    isUrgentRescue: initialUrgent,
    customNeeds: initialUrgent ? '' : 'Cooked Meals, Clean Drinking Water',
    details: ''
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isUrgentRescue: initialUrgent,
      customNeeds: initialUrgent ? '' : 'Cooked Meals, Clean Drinking Water'
    }));
  }, [initialUrgent]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachGps, setAttachGps] = useState(true);

  // HTML5 Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setIsLocating(false);
        setLocationStatus(`GPS Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("GPS error:", error);
        setLocationStatus('Could not acquire GPS automatically. Please type village & PIN code below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Removed toggleNeed function

  const totalPeopleCount = (parseInt(formData.peopleCount) || 0) || ((parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone) {
      setErrorMessage("Please type a valid Mobile Phone Number!");
      return;
    }

    if (!formData.isUrgentRescue && (!formData.name || !formData.villageName || !formData.district)) {
      setErrorMessage("Please fill out Name, Village Name, and select a District!");
      return;
    }

    if (attachGps && (!formData.latitude || !formData.longitude)) {
      setErrorMessage("GPS Location is required when 'Attach GPS' is checked. Please click 'Attach Mandatory GPS Location *' button to auto-detect your location before submitting, or uncheck the 'Attach GPS' option if you don't have internet/GPS.");
      return;
    }

    setIsSubmitting(true);

    try {
      const landmarkText = (formData.isUrgentRescue && formData.landmark) ? ` (${formData.landmark})` : '';
      const locationAddressFormatted = `${formData.villageName}${formData.pinCode ? `, PIN: ${formData.pinCode}` : ''}${landmarkText}`;

      const currentUser = authService.getCurrentUser();
      let requestedByRole = 'CITIZEN';
      let requestedByName = formData.name;
      let requestedByPhone = formData.phone;

      if (currentUser && currentUser.user) {
        if (currentUser.role === 'NGO') {
          requestedByRole = 'NGO';
          requestedByName = currentUser.user.name;
          requestedByPhone = currentUser.user.phone || formData.phone;
        } else if (currentUser.role === 'VOLUNTEER') {
          requestedByRole = 'VOLUNTEER';
          requestedByName = currentUser.user.name;
          requestedByPhone = currentUser.user.phone || formData.phone;
        }
      }

      const savedRequest = storageService.addVictimRequest({
        ...formData,
        requestedByRole,
        requestedByName,
        requestedByPhone,
        peopleCount: totalPeopleCount,
        locationName: locationAddressFormatted,
        needs: formData.isUrgentRescue ? ['Emergency Motorboat Rescue & Life Evacuation'] : parseNeedsTags(formData.customNeeds),
        latitude: attachGps ? formData.latitude : null,
        longitude: attachGps ? formData.longitude : null
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);

      if (onRequestSubmitted) {
        onRequestSubmitted(savedRequest);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "Failed to submit request.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 max-sm:pb-24 max-sm:pt-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
      <div className={`relative w-full max-w-2xl bg-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-slide-up ${
        formData.isUrgentRescue ? 'border-red-500 shadow-red-950/80' : 'border-amber-500/40 shadow-amber-950/50'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 ${
          formData.isUrgentRescue 
            ? 'bg-gradient-to-r from-red-950 via-slate-950 to-slate-950 border-red-800' 
            : 'bg-gradient-to-r from-amber-950 via-slate-950 to-slate-950 border-amber-800'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border text-white shrink-0 ${
              formData.isUrgentRescue 
                ? 'bg-red-600 border-red-400 shadow-lg shadow-red-600/50 animate-pulse' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {formData.isUrgentRescue ? <Siren className="w-5 h-5 sm:w-6 sm:h-6" /> : <Package className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
                {formData.isUrgentRescue ? i18nService.t('emergencyRescueSos', 'EMERGENCY RESCUE SOS') : i18nService.t('floodReliefRequest', 'FLOOD RELIEF & SUPPLY REQUEST')}
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold text-amber-300">
                {formData.isUrgentRescue 
                  ? i18nService.t('sosSubtitle', 'Transmitting victim location directly to rescue boats') 
                  : i18nService.t('requestRegisteredSub', 'Published to NGOs & Volunteers to supply food & materials')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Type Switcher Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              isUrgentRescue: true, 
              needs: ['Emergency Motorboat Rescue & Life Evacuation'] 
            }))}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              formData.isUrgentRescue
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>{i18nService.t('emergencyBoatRescue', 'EMERGENCY BOAT RESCUE')}</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              isUrgentRescue: false, 
              needs: ['Cooked Meals & Food Packets', 'Clean Drinking Water Jars'] 
            }))}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !formData.isUrgentRescue
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{i18nService.t('foodMaterialRelief', 'FOOD & MATERIAL RELIEF')}</span>
          </button>
        </div>

        {/* Error / Rate Limit Alert Banner */}
        {errorMessage && (
          <div className="m-4 p-3.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dignified Reassuring Success View */}
        {submittedSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Request Registered. Someone will help you soon.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your request has been published to nearby verified NGOs, rescue boat operators, and logistics volunteers in <strong className="text-amber-300">{formData.district}</strong>. Someone will contact your mobile phone soon.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Phone:</span>
                <span className="font-mono font-bold text-amber-300">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-200">{formData.villageName}, {formData.district} {formData.pinCode ? `(PIN: ${formData.pinCode})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Demographics:</span>
                <span className="font-bold text-amber-300 text-right">
                  {totalPeopleCount} Total ({formData.malesCount} M, {formData.femalesCount} F, {formData.childrenCount} C)
                  {formData.familiesCount > 0 ? ` & ${formData.familiesCount} Families` : ''}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors min-h-[44px]"
            >
              Return to Portal
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {formData.isUrgentRescue ? (
              /* Emergency Rescue Mode: ONLY Phone + People Count + Auto GPS */
              <div className="space-y-4">
                <div className="bg-red-900/40 border border-red-700 p-3 rounded-xl text-red-100 text-xs font-bold flex items-center gap-2">
                  <Siren className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                  <span>Quick Emergency Rescue SOS — Enter phone number and count of stranded people.</span>
                </div>

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
                        className="w-full pl-10 pr-3.5 py-3 bg-slate-800 border-2 border-amber-500/80 rounded-xl text-white font-black text-base focus:outline-none focus:border-amber-400 font-mono shadow-inner"
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
                        className="w-full pl-10 pr-3.5 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-white font-black text-base focus:outline-none focus:border-amber-400 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto GPS Location */}
                <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">GPS Location</span>
                    {formData.latitude && (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                      formData.latitude
                        ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Acquiring GPS...' : formData.latitude ? 'GPS Pinned (Click to Refetch)' : 'Tap to Detect GPS Location'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Food & Material Relief Mode: Full comprehensive form fields */
              <div className="space-y-4">
                {/* Victim Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('victimName', 'Victim / Contact Person Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biren Hazarika"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('phoneContact', 'Mobile Phone Number *')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98640 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border-2 border-amber-500/70 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Village Name, District, and PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('villageName', 'Village / Panchayat *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kamalabari Village"
                      value={formData.villageName}
                      onChange={(e) => setFormData(prev => ({ ...prev, villageName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm font-medium"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('selectDistrict', 'District *')}
                    </label>
                    <DistrictSelect
                      value={formData.district}
                      onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('pinCodeLabel', 'PIN Code (6-digit)')}
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="e.g. 785104"
                        value={formData.pinCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Landmark & GPS Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                      {i18nService.t('exactSpotLandmark', 'Exact Spot / Rooftop / Dike Landmark')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Primary School Dike, House No 12"
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm font-medium"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all min-h-[42px] ${
                        formData.latitude
                          ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500'
                          : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>
                        {isLocating 
                          ? 'Acquiring GPS...' 
                          : formData.latitude 
                            ? 'GPS Pinned' 
                            : 'Fetch Auto Geolocation'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Demographics: Number of Families Needing Help */}
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Number of Families Needing Help *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.familiesCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, familiesCount: Math.max(1, parseInt(e.target.value) || 0), peopleCount: (Math.max(1, parseInt(e.target.value) || 0)) * 4 }))}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Materials & Food Needed */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Materials & Food Needed *
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold">Use commas (,) to separate items</span>
                  </div>
                  <textarea
                    rows="3"
                    placeholder="e.g. Phenyle, Bleaching Powder, Dettol Soap, Tirpal, Mosquito Nets..."
                    value={formData.customNeeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, customNeeds: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm font-medium"
                    required
                  />
                  {formData.customNeeds && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Supply Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {parseNeedsTags(formData.customNeeds).map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-[11px] font-extrabold bg-amber-100 text-amber-950 rounded-lg border border-amber-300 shadow-sm leading-tight">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Situation Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                    Situation Notes / Water Level Status
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Need fever meds & food packets"
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 pb-12 sm:pb-4 mb-6 sm:mb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer min-h-[50px] ${
                  formData.isUrgentRescue
                    ? 'btn-sos animate-sos-pulse'
                    : 'btn-relief animate-relief-glow text-slate-950'
                }`}
              >
                {isSubmitting ? (
                  <span>SUBMITTING...</span>
                ) : (
                  <>
                    {formData.isUrgentRescue ? <ShieldAlert className="w-5 h-5 shrink-0 text-white" /> : <HeartHandshake className="w-5 h-5 shrink-0 text-slate-950" />}
                    <span>{formData.isUrgentRescue ? 'SUBMIT EMERGENCY RESCUE' : i18nService.t('publishRequest', 'SUBMIT RELIEF REQUEST')}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
