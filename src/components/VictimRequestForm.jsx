import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Users, Phone, CheckCircle, Navigation, HeartHandshake, ShieldCheck, Hash, UserCheck, AlertOctagon, AlertTriangle, Siren, ShieldAlert } from 'lucide-react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import DistrictSelect from './DistrictSelect';
import { i18nService } from '../services/i18nService';

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

  const totalPeopleCount = (parseInt(formData.malesCount) || 0) + (parseInt(formData.femalesCount) || 0) + (parseInt(formData.childrenCount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone || !formData.name || !formData.villageName || !formData.district) {
      setErrorMessage("Please fill out Victim Name, Mobile Phone, Village Name, and select a District!");
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
        needs: formData.isUrgentRescue ? ['Emergency Motorboat Rescue & Life Evacuation'] : [formData.customNeeds],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
      <div className={`relative w-full max-w-2xl bg-slate-900 border-2 rounded-2xl max-sm:rounded-b-none max-sm:rounded-t-3xl shadow-2xl overflow-hidden my-auto max-sm:mb-0 max-sm:mt-auto max-h-[92vh] max-sm:max-h-[90vh] flex flex-col animate-slide-up ${
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
            
            {/* Victim Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {i18nService.t('victimName', 'Victim / Contact Person Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biren Hazarika"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border-2 border-amber-500/60 rounded-xl text-white font-black text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Alternate Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {i18nService.t('alternatePhone', 'Alternate Phone Number (Optional)')}
              </label>
              <input
                type="tel"
                placeholder="e.g. 94350 98765"
                value={formData.altPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, altPhone: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            {/* Village Name, District, and PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {i18nService.t('villageName', 'Village / Panchayat *')}
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

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {i18nService.t('selectDistrict', 'District *')}
                </label>
                <DistrictSelect
                  value={formData.district}
                  onChange={(selected) => setFormData(prev => ({ ...prev, district: selected }))}
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Landmark (Emergency Rescue Only) & GPS Detector Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {formData.isUrgentRescue && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {i18nService.t('exactSpotLandmark', 'Exact Spot / Rooftop / Dike Landmark')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Primary School Dike, House No 12"
                    value={formData.landmark}
                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              )}

              <div className={formData.isUrgentRescue ? "sm:col-span-1" : "sm:col-span-3"}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={attachGps}
                      onChange={(e) => setAttachGps(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                      Attach GPS
                    </span>
                  </label>
                  {attachGps && !formData.latitude && <span className="text-[10px] text-red-400 font-extrabold animate-pulse">REQUIRED</span>}
                </div>
                
                {attachGps ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={formData.latitude !== null ? formData.latitude : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                        required={attachGps}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={formData.longitude !== null ? formData.longitude : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                        required={attachGps}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
                        formData.latitude
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>
                        {isLocating 
                          ? 'Acquiring GPS...' 
                          : formData.latitude 
                            ? 'GPS Pinned (Click to Refetch)' 
                            : 'Fetch Auto Geolocation'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-900/50 border border-slate-800 flex items-center justify-center min-h-[44px] italic">
                    Submitted without GPS
                  </div>
                )}
              </div>
            </div>

            {/* Demographics: Males, Females, Children, Families Counters */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Demographics Needing Rescue</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Total: {totalPeopleCount} People{formData.familiesCount > 0 ? `, ${formData.familiesCount} Families` : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-300 mb-1">Males</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.malesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, malesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-300 mb-1">Females</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.femalesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, femalesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-300 mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.childrenCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-300 mb-1">Families</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.familiesCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, familiesCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* ONLY SHOW SUPPLY TEXT BOX IF IN MATERIAL RELIEF MODE */}
            {!formData.isUrgentRescue && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Materials & Food Needed
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Cooked Meals, Drinking Water, Blankets, Baby Food..."
                  value={formData.customNeeds}
                  onChange={(e) => setFormData(prev => ({ ...prev, customNeeds: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-sm"
                  required={!formData.isUrgentRescue}
                />
              </div>
            )}

            {/* Details / Water Level Situation */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Situation Notes / Water Level Status
              </label>
              <textarea
                rows="2"
                placeholder={formData.isUrgentRescue ? "e.g. Water level rising fast, 7 people stuck on bamboo roof platform. Need motorboat urgently." : "e.g. Need fever meds & food packets"}
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  formData.isUrgentRescue
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                    : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                }`}
              >
                {isSubmitting ? (
                  <span>{i18nService.t('transmitting', 'TRANSMITTING SOS SIGNAL...')}</span>
                ) : (
                  <>
                    {formData.isUrgentRescue ? <ShieldAlert className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                    <span>{formData.isUrgentRescue ? i18nService.t('transmitSos', 'TRANSMIT EMERGENCY RESCUE SOS NOW') : i18nService.t('publishRequest', 'PUBLISH RELIEF SUPPLY REQUEST')}</span>
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
